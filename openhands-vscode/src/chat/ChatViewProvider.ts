import * as vscode from 'vscode';
import { OpenHandsClient, AgentEvent, FileContext } from '../api';
import { AuthService } from '../auth';
import { FileOperationsService } from '../files';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'openhands.chat';
  
  private _view?: vscode.WebviewView;
  private messages: ChatMessage[] = [];
  private currentConversationId: string | null = null;
  private isProcessing = false;
  private streamCleanup: (() => void) | null = null;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly client: OpenHandsClient,
    private readonly authService: AuthService,
    private readonly fileOps: FileOperationsService,
    private readonly outputChannel: vscode.OutputChannel
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage':
          await this.handleSendMessage(data.message, data.context);
          break;
        case 'stopGeneration':
          await this.handleStopGeneration();
          break;
        case 'applyFileChange':
          await this.handleApplyFileChange(data.path, data.content);
          break;
        case 'clearChat':
          this.clearChat();
          break;
        case 'ready':
          this.syncMessages();
          break;
      }
    });

    webviewView.onDidDispose(() => {
      this.cleanup();
    });
  }

  private async handleSendMessage(message: string, context?: FileContext) {
    if (this.isProcessing) {
      return;
    }

    // Check authentication
    if (!await this.authService.ensureAuthenticated()) {
      return;
    }

    // Warn if no workspace is open (agent can still respond, but file ops won't work)
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      const action = await vscode.window.showWarningMessage(
        'No folder is open. File operations will not work. Open a folder first?',
        'Open Folder',
        'Continue Anyway'
      );
      if (action === 'Open Folder') {
        await vscode.commands.executeCommand('vscode.openFolder');
        return;
      }
      if (action !== 'Continue Anyway') {
        return;
      }
    }

    this.isProcessing = true;
    this.updateWebviewState();

    // Add user message
    this.addMessage({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    try {
      // Add placeholder for assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      // Set up event handler for Socket.IO events
      const eventHandler = async (event: AgentEvent) => {
        this.handleAgentEvent(event, assistantMessage);
        
        // Check if agent finished
        if (event.observation === 'agent_state_changed' && 
            event.extras?.agent_state === 'awaiting_user_input') {
          
          // If we still have no content, try fetching events from REST API
          if (!assistantMessage.content && this.currentConversationId) {
            this.outputChannel.appendLine('No content received via Socket.IO, fetching from REST...');
            const events = await this.client.fetchEvents(this.currentConversationId, 0);
            for (const e of events) {
              if (e.source === 'agent' && (e.action === 'message' || e.action === 'finish')) {
                this.handleAgentEvent(e, assistantMessage);
              }
            }
          }
          
          assistantMessage.isStreaming = false;
          this.syncMessages();
          this.isProcessing = false;
          this.updateWebviewState();
          this.client.offEvent(eventHandler);
        }
      };
      
      this.client.onEvent(eventHandler);
      
      // Store cleanup function
      this.streamCleanup = () => {
        this.client.offEvent(eventHandler);
      };

      // Create conversation if needed (this also connects Socket.IO)
      if (!this.currentConversationId) {
        const conversation = await this.client.createConversation();
        this.currentConversationId = conversation.conversation_id;
      }

      // Add assistant message placeholder after conversation is ready
      this.addMessage(assistantMessage);

      // Send message via Socket.IO
      await this.client.sendMessage(this.currentConversationId, message, context);
    } catch (error) {
      this.outputChannel.appendLine(`Error sending message: ${error}`);
      this.addMessage({
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      });
      this.isProcessing = false;
      this.updateWebviewState();
    }
  }

  private handleAgentEvent(event: AgentEvent, assistantMessage: ChatMessage) {
    this.outputChannel.appendLine(`Chat Event: ${JSON.stringify(event).substring(0, 800)}`);

    // Skip status updates
    if ((event as any).status_update) {
      return;
    }

    // Skip user messages (we already show those)
    if (event.source === 'user') {
      return;
    }

    // Skip agent state changes (no displayable content)
    if (event.observation === 'agent_state_changed') {
      return;
    }

    let content: string | undefined;

    // Try various ways to extract content from agent events
    
    // 1. AgentFinishAction with outputs.content
    if (event.action === 'finish' && event.args?.outputs) {
      const outputs = event.args.outputs as Record<string, any>;
      content = outputs.content || event.args.final_thought as string;
    }
    
    // 2. MessageAction from agent
    if (!content && event.action === 'message' && event.args?.content) {
      content = event.args.content as string;
    }
    
    // 3. Direct message field
    if (!content && event.message) {
      content = event.message;
    }
    
    // 4. Direct content field  
    if (!content && event.content) {
      content = event.content;
    }
    
    // 5. AgentThinkAction - show thought
    if (!content && event.action === 'think' && event.args?.thought) {
      content = `*Thinking: ${event.args.thought}*`;
    }

    // 6. Check extras for content
    if (!content && event.extras?.content) {
      content = event.extras.content as string;
    }

    // Update message if we found content
    if (content && content.trim()) {
      this.outputChannel.appendLine(`Setting assistant content: ${content.substring(0, 200)}`);
      assistantMessage.content = content;
      this.syncMessages();
    }

    // Handle file operations - automatically apply writes with confirmation
    if (event.action === 'write' && event.args) {
      const filePath = event.args.path as string;
      const fileContent = event.args.content as string;
      this.outputChannel.appendLine(`Agent wants to write file: ${filePath}`);
      this.handleFileWrite(filePath, fileContent);
    }

    // Also handle run_ipython which might create files
    if (event.action === 'run_ipython' && event.args?.code) {
      this.outputChannel.appendLine(`Agent running IPython: ${(event.args.code as string).substring(0, 100)}`);
    }

    // Handle command execution that might create files
    if (event.action === 'run' && event.args?.command) {
      this.outputChannel.appendLine(`Agent running command: ${event.args.command}`);
    }
  }

  private async handleFileWrite(filePath: string, content: string): Promise<void> {
    try {
      // Use writeFileWithConfirmation to show user what's being written
      const applied = await this.fileOps.writeFileWithConfirmation(filePath, content);
      if (applied) {
        this.outputChannel.appendLine(`File written: ${filePath}`);
        // Open the file in editor
        const uri = vscode.Uri.file(filePath);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
      }
    } catch (error) {
      this.outputChannel.appendLine(`Error writing file: ${error}`);
      vscode.window.showErrorMessage(`Failed to write file: ${filePath}`);
    }
  }

  private notifyFileChange(path: string, content: string) {
    this._view?.webview.postMessage({
      type: 'fileChange',
      path,
      content
    });
  }

  private async handleStopGeneration() {
    if (this.streamCleanup) {
      this.streamCleanup();
      this.streamCleanup = null;
    }

    if (this.currentConversationId) {
      try {
        await this.client.stopAgent(this.currentConversationId);
      } catch (error) {
        this.outputChannel.appendLine(`Error stopping agent: ${error}`);
      }
    }

    this.isProcessing = false;
    this.updateWebviewState();
  }

  private async handleApplyFileChange(path: string, content: string) {
    try {
      await this.fileOps.writeFile(path, content);
      vscode.window.showInformationMessage(`Applied changes to ${path}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to apply changes: ${error}`);
    }
  }

  private addMessage(message: ChatMessage) {
    this.messages.push(message);
    this.syncMessages();
  }

  private syncMessages() {
    this._view?.webview.postMessage({
      type: 'updateMessages',
      messages: this.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        isStreaming: m.isStreaming
      }))
    });
  }

  private updateWebviewState() {
    this._view?.webview.postMessage({
      type: 'updateState',
      isProcessing: this.isProcessing
    });
  }

  public clearChat() {
    this.messages = [];
    this.currentConversationId = null;
    this.syncMessages();
    vscode.window.showInformationMessage('Chat history cleared');
  }

  public async sendMessageWithContext(message: string, context?: FileContext) {
    // Reveal the chat panel
    if (this._view) {
      this._view.show(true);
    } else {
      await vscode.commands.executeCommand('openhands.chat.focus');
    }

    // Wait a bit for the view to be ready
    await new Promise(resolve => setTimeout(resolve, 100));

    await this.handleSendMessage(message, context);
  }

  private cleanup() {
    if (this.streamCleanup) {
      this.streamCleanup();
      this.streamCleanup = null;
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>OpenHands Chat</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-sideBar-background);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .message {
      padding: 10px 14px;
      border-radius: 8px;
      max-width: 90%;
      word-wrap: break-word;
    }
    
    .message.user {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      align-self: flex-end;
    }
    
    .message.assistant {
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border);
      align-self: flex-start;
    }
    
    .message.system {
      background-color: var(--vscode-inputValidation-warningBackground);
      border: 1px solid var(--vscode-inputValidation-warningBorder);
      align-self: center;
      font-size: 0.9em;
    }
    
    .message pre {
      background-color: var(--vscode-textCodeBlock-background);
      padding: 8px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
    }
    
    .message code {
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
    }
    
    .streaming-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: var(--vscode-progressBar-background);
      border-radius: 50%;
      animation: pulse 1s infinite;
      margin-left: 4px;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    
    .input-container {
      padding: 12px;
      border-top: 1px solid var(--vscode-widget-border);
      display: flex;
      gap: 8px;
    }
    
    .input-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    textarea {
      width: 100%;
      min-height: 60px;
      max-height: 150px;
      padding: 8px;
      border: 1px solid var(--vscode-input-border);
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      resize: vertical;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    
    textarea:focus {
      outline: 1px solid var(--vscode-focusBorder);
      border-color: var(--vscode-focusBorder);
    }
    
    .button-row {
      display: flex;
      gap: 8px;
    }
    
    button {
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: var(--vscode-font-size);
    }
    
    button.primary {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    
    button.primary:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    
    button.secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    
    button.secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .empty-state {
      text-align: center;
      color: var(--vscode-descriptionForeground);
      padding: 40px 20px;
    }
    
    .empty-state h3 {
      margin-bottom: 8px;
    }
    
    .file-change {
      background-color: var(--vscode-diffEditor-insertedTextBackground);
      border: 1px solid var(--vscode-diffEditor-insertedLineBackground);
      border-radius: 4px;
      padding: 8px;
      margin: 8px 0;
    }
    
    .file-change-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .file-change-path {
      font-family: var(--vscode-editor-font-family);
      font-size: 0.9em;
    }
    
    .apply-btn {
      padding: 2px 8px;
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <div class="chat-container" id="chatContainer">
    <div class="empty-state" id="emptyState">
      <h3>👋 Welcome to OpenHands</h3>
      <p>Start a conversation to get help with your code</p>
    </div>
  </div>
  
  <div class="input-container">
    <div class="input-wrapper">
      <textarea 
        id="messageInput" 
        placeholder="Ask OpenHands anything..."
        rows="2"
      ></textarea>
      <div class="button-row">
        <button class="primary" id="sendBtn">Send</button>
        <button class="secondary" id="stopBtn" style="display: none;">Stop</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    
    const chatContainer = document.getElementById('chatContainer');
    const emptyState = document.getElementById('emptyState');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    let isProcessing = false;
    let pendingFileChanges = [];

    // Send ready signal
    vscode.postMessage({ type: 'ready' });

    // Handle messages from extension
    window.addEventListener('message', event => {
      const data = event.data;
      
      switch (data.type) {
        case 'updateMessages':
          renderMessages(data.messages);
          break;
        case 'updateState':
          isProcessing = data.isProcessing;
          updateUI();
          break;
        case 'fileChange':
          pendingFileChanges.push({ path: data.path, content: data.content });
          break;
      }
    });

    function renderMessages(messages) {
      if (messages.length === 0) {
        emptyState.style.display = 'block';
        chatContainer.innerHTML = '';
        chatContainer.appendChild(emptyState);
        return;
      }

      emptyState.style.display = 'none';
      chatContainer.innerHTML = messages.map((msg, idx) => {
        let content = escapeHtml(msg.content);
        content = formatCodeBlocks(content);
        
        const streamingIndicator = msg.isStreaming 
          ? '<span class="streaming-indicator"></span>' 
          : '';
        
        return \`
          <div class="message \${msg.role}">
            \${content}\${streamingIndicator}
          </div>
        \`;
      }).join('');

      // Scroll to bottom
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function formatCodeBlocks(text) {
      // Simple code block formatting
      return text.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, (match, lang, code) => {
        return \`<pre><code class="language-\${lang}">\${code}</code></pre>\`;
      }).replace(/\`([^\`]+)\`/g, '<code>$1</code>');
    }

    function updateUI() {
      sendBtn.disabled = isProcessing;
      sendBtn.style.display = isProcessing ? 'none' : 'block';
      stopBtn.style.display = isProcessing ? 'block' : 'none';
      messageInput.disabled = isProcessing;
    }

    function sendMessage() {
      const message = messageInput.value.trim();
      if (!message || isProcessing) return;

      vscode.postMessage({
        type: 'sendMessage',
        message: message
      });

      messageInput.value = '';
    }

    sendBtn.addEventListener('click', sendMessage);
    
    stopBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'stopGeneration' });
    });

    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  </script>
</body>
</html>`;
  }
}
