import * as vscode from 'vscode';
import * as path from 'path';
import { OpenHandsClient, AgentEvent, FileContext } from '../api';
import { AuthService } from '../auth';
import { FileOperationsService } from '../files';
import { ConversationStorageService, ConversationSummary, StoredMessage } from '../storage';

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
  private conversationStorage: ConversationStorageService | null = null;
  private conversations: ConversationSummary[] = [];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly client: OpenHandsClient,
    private readonly authService: AuthService,
    private readonly fileOps: FileOperationsService,
    private readonly outputChannel: vscode.OutputChannel,
    private readonly context?: vscode.ExtensionContext
  ) {
    // Initialize storage if context is provided
    if (context) {
      this.conversationStorage = new ConversationStorageService(
        context,
        client,
        outputChannel
      );
    }
  }

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
          await this.loadConversationList();
          break;
        case 'newConversation':
          await this.handleNewConversation();
          break;
        case 'selectConversation':
          await this.handleSelectConversation(data.conversationId);
          break;
        case 'deleteConversation':
          await this.handleDeleteConversation(data.conversationId);
          break;
        case 'refreshConversations':
          await this.loadConversationList(true);
          break;
        case 'startConversation':
          await this.handleStartConversation();
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

      // Set up event handler for WebSocket events
      let eventReceived = false;
      const eventHandler = async (event: AgentEvent) => {
        eventReceived = true;
        this.handleAgentEvent(event, assistantMessage);
        
        // Check if agent finished - multiple ways this can happen:
        // 1. agent_state_changed observation with awaiting_user_input
        // 2. full_state event (initial connection state)
        // 3. finish action
        
        const isAgentStateChanged = event.observation === 'agent_state_changed' && 
            (event.extras?.agent_state === 'awaiting_user_input' || 
             event.extras?.agent_state === 'stopped' ||
             event.extras?.agent_state === 'finished');
        
        // full_state events are sent on connection - they contain the current state
        const isFullState = (event as any).key === 'full_state';
        
        const isFinishAction = event.action === 'finish';
        
        if (isAgentStateChanged || isFinishAction) {
          this.outputChannel.appendLine(`Agent finished: state_changed=${isAgentStateChanged}, finish=${isFinishAction}`);
          
          // If we still have no content, try fetching events from REST API
          if (!assistantMessage.content && this.currentConversationId) {
            this.outputChannel.appendLine('No content received via WebSocket, fetching from REST...');
            try {
              const events = await this.client.fetchEvents(this.currentConversationId, 0);
              for (const e of events) {
                if (e.source === 'agent' && (e.action === 'message' || e.action === 'finish')) {
                  this.handleAgentEvent(e, assistantMessage);
                }
              }
            } catch (e) {
              this.outputChannel.appendLine(`Failed to fetch events: ${e}`);
            }
          }
          
          assistantMessage.isStreaming = false;
          this.syncMessages();
          this.isProcessing = false;
          this.updateWebviewState();
          this.client.offEvent(eventHandler);
        }
        
        // For full_state, just log it - don't finish processing immediately
        // The agent needs to run first
        if (isFullState) {
          this.outputChannel.appendLine(`Received full_state event on connection`);
        }
      };
      
      this.client.onEvent(eventHandler);
      
      // Timeout: if no meaningful response after 60 seconds, reset processing state
      setTimeout(() => {
        if (this.isProcessing && assistantMessage.isStreaming) {
          this.outputChannel.appendLine('Timeout waiting for agent response, resetting processing state');
          assistantMessage.content = assistantMessage.content || 'No response received. The agent may still be processing.';
          assistantMessage.isStreaming = false;
          this.syncMessages();
          this.isProcessing = false;
          this.updateWebviewState();
          this.client.offEvent(eventHandler);
        }
      }, 60000);
      
      // Store cleanup function
      this.streamCleanup = () => {
        this.client.offEvent(eventHandler);
      };

      // Create conversation if needed, or resume if stopped
      if (!this.currentConversationId) {
        // No conversation selected - create a new one
        const conversation = await this.client.createConversation();
        this.currentConversationId = conversation.conversation_id;
        
        // Add to conversation storage
        if (this.conversationStorage) {
          await this.conversationStorage.addConversation({
            id: conversation.conversation_id,
            title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'RUNNING',
            cloudId: conversation.conversation_id,
          });
          this.syncConversationList();
        }
      } else if (!this.client.isConnected()) {
        // Conversation exists but Socket.IO not connected - need to resume/reconnect
        this.outputChannel.appendLine(`Resuming conversation: ${this.currentConversationId}`);
        
        // Show status update
        this.addMessage({
          role: 'system',
          content: '⏳ Resuming conversation...',
          timestamp: new Date()
        });
        
        try {
          await this.client.reconnectToConversation(this.currentConversationId);
          this.outputChannel.appendLine('Conversation resumed successfully');
          
          // Remove the "resuming" message
          this.messages = this.messages.filter(m => m.content !== '⏳ Resuming conversation...');
          
          // Also remove the "stopped conversation" placeholder
          this.messages = this.messages.filter(m => 
            !m.content.includes('This conversation is currently stopped')
          );
          this.syncMessages();
        } catch (error) {
          this.outputChannel.appendLine(`Failed to resume: ${error}`);
          // Remove the status message
          this.messages = this.messages.filter(m => m.content !== '⏳ Resuming conversation...');
          throw new Error(`Failed to resume conversation: ${error instanceof Error ? error.message : error}`);
        }
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

    // Skip environment events that don't have content
    const eventAny = event as any;
    if (eventAny.source === 'environment') {
      // Skip state updates, stats, etc.
      if (eventAny.key === 'execution_status' || eventAny.key === 'stats' || eventAny.key === 'full_state') {
        return;
      }
    }

    // Skip agent state changes (no displayable content)
    if (event.observation === 'agent_state_changed') {
      return;
    }

    let content: string | undefined;

    // V1 FORMAT HANDLING
    
    // V1: Agent thought/reasoning
    if (!content && eventAny.reasoning_content) {
      content = `*Thinking: ${eventAny.reasoning_content}*`;
    }
    
    // V1: Agent action with tool call
    if (!content && eventAny.action?.command) {
      content = `Running: \`${eventAny.action.command}\``;
    }
    
    // V1: Tool observation result
    if (!content && eventAny.observation?.content) {
      const obsContent = eventAny.observation.content;
      if (Array.isArray(obsContent) && obsContent[0]?.text) {
        content = `\`\`\`\n${obsContent[0].text}\n\`\`\``;
      }
    }

    // V0 FORMAT HANDLING
    
    // 1. AgentFinishAction with outputs.content
    if (!content && event.action === 'finish' && event.args?.outputs) {
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

    // Handle edit actions (str_replace_editor tool calls)
    if (event.action === 'edit' && event.tool_call_metadata) {
      this.outputChannel.appendLine(`Agent edit action detected`);
      this.handleEditAction(event);
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

  private async handleEditAction(event: AgentEvent): Promise<void> {
    try {
      // Extract the tool call arguments
      const toolCallMetadata = event.tool_call_metadata as any;
      const modelResponse = toolCallMetadata?.model_response;
      const choices = modelResponse?.choices;
      
      if (!choices || choices.length === 0) {
        return;
      }

      const toolCalls = choices[0]?.message?.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        return;
      }

      for (const toolCall of toolCalls) {
        if (toolCall.function?.name === 'str_replace_editor') {
          const argsStr = toolCall.function.arguments;
          let args: any;
          try {
            args = JSON.parse(argsStr);
          } catch {
            this.outputChannel.appendLine(`Failed to parse edit args: ${argsStr}`);
            continue;
          }

          const command = args.command;
          const remotePath = args.path as string;
          const fileText = args.file_text as string;
          const oldStr = args.old_str as string;
          const newStr = args.new_str as string;

          this.outputChannel.appendLine(`Edit command: ${command}, path: ${remotePath}`);

          // Map remote path to local workspace
          const localPath = this.mapRemotePathToLocal(remotePath);
          this.outputChannel.appendLine(`Mapping ${remotePath} -> ${localPath}`);

          if (command === 'create' && fileText) {
            // Create new file
            await this.handleFileWrite(localPath, fileText);
          } else if (command === 'str_replace' && oldStr && newStr !== undefined) {
            // String replacement in existing file
            await this.handleStringReplace(localPath, oldStr, newStr);
          } else if (command === 'insert' && args.insert_line !== undefined && newStr) {
            // Insert at line
            await this.handleInsert(localPath, args.insert_line as number, newStr);
          }
        }
      }
    } catch (error) {
      this.outputChannel.appendLine(`Error handling edit action: ${error}`);
    }
  }

  private mapRemotePathToLocal(remotePath: string): string {
    // Convert cloud /workspace/... paths to local workspace
    const workspaceRoot = this.fileOps.getWorkspaceRoot();
    if (!workspaceRoot) {
      return remotePath;
    }

    // Remove /workspace prefix and join with local workspace
    const relativePath = remotePath.replace(/^\/workspace\/?/, '');
    return path.join(workspaceRoot, relativePath);
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

  private async handleStringReplace(filePath: string, oldStr: string, newStr: string): Promise<void> {
    try {
      // Read existing file
      let content: string;
      try {
        content = await this.fileOps.readFile(filePath);
      } catch {
        this.outputChannel.appendLine(`File does not exist locally: ${filePath}, creating with new content`);
        // File doesn't exist locally, write newStr directly
        await this.handleFileWrite(filePath, newStr);
        return;
      }

      // Apply replacement
      if (!content.includes(oldStr)) {
        this.outputChannel.appendLine(`Warning: old_str not found in local file, writing new content directly`);
        // Old string not found, might be due to sync issues
        // Write the new content assuming the agent knows what it's doing
        const newContent = content + newStr;
        await this.handleFileWrite(filePath, newContent);
        return;
      }

      const newContent = content.replace(oldStr, newStr);
      this.outputChannel.appendLine(`Replacing in ${filePath}: "${oldStr.substring(0, 30)}..." -> "${newStr.substring(0, 30)}..."`);
      
      await this.handleFileWrite(filePath, newContent);
    } catch (error) {
      this.outputChannel.appendLine(`Error in string replace: ${error}`);
      vscode.window.showErrorMessage(`Failed to edit file: ${filePath}`);
    }
  }

  private async handleInsert(filePath: string, insertLine: number, content: string): Promise<void> {
    try {
      const existingContent = await this.fileOps.readFile(filePath);
      const lines = existingContent.split('\n');
      
      // Insert at the specified line (0-indexed)
      lines.splice(insertLine, 0, content);
      const newContent = lines.join('\n');
      
      await this.handleFileWrite(filePath, newContent);
    } catch (error) {
      this.outputChannel.appendLine(`Error in insert: ${error}`);
      vscode.window.showErrorMessage(`Failed to insert into file: ${filePath}`);
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

  // ============= Conversation Management Methods =============

  private async loadConversationList(forceRefresh = false): Promise<void> {
    this.outputChannel.appendLine(`[Chat] loadConversationList called, forceRefresh=${forceRefresh}`);
    
    if (!this.conversationStorage) {
      this.outputChannel.appendLine('[Chat] ERROR: No conversation storage available (context not passed?)');
      return;
    }

    try {
      this.outputChannel.appendLine('[Chat] Fetching conversations from storage...');
      this.conversations = await this.conversationStorage.listConversations(forceRefresh);
      this.outputChannel.appendLine(`[Chat] Got ${this.conversations.length} conversations`);
      this.syncConversationList();
    } catch (error) {
      this.outputChannel.appendLine(`[Chat] Error loading conversations: ${error}`);
    }
  }

  private syncConversationList(): void {
    this._view?.webview.postMessage({
      type: 'updateConversations',
      conversations: this.conversations.map(c => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt,
        status: c.status,
      })),
      currentConversationId: this.currentConversationId,
    });
  }

  private async handleNewConversation(): Promise<void> {
    // Clear current chat
    this.messages = [];
    this.currentConversationId = null;
    this.syncMessages();
    
    // Update UI
    this.syncConversationList();
    
    this.outputChannel.appendLine('Created new conversation (will connect on first message)');
  }

  private async handleStartConversation(): Promise<void> {
    // Check authentication
    if (!await this.authService.ensureAuthenticated()) {
      return;
    }

    try {
      // Create and start a new conversation (this also connects)
      const conversation = await this.client.createConversation();
      const conversationId = conversation.conversation_id;
      this.currentConversationId = conversationId;
      
      // Refresh conversation list
      await this.loadConversationList(true);
      
      // Clear messages and sync - this will trigger the UI to show the input
      this.messages = [];
      this.syncMessages();
      
      // Send state update to show input
      this._view?.webview.postMessage({
        type: 'conversationStarted',
        conversationId,
      });
      
      this.outputChannel.appendLine(`Conversation ${conversationId} started and ready`);
    } catch (error) {
      this.outputChannel.appendLine(`Error starting conversation: ${error}`);
      vscode.window.showErrorMessage(`Failed to start conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleSelectConversation(conversationId: string): Promise<void> {
    if (conversationId === this.currentConversationId) {
      return;
    }

    this.outputChannel.appendLine(`Switching to conversation: ${conversationId}`);

    // Clean up current connection
    this.cleanup();

    // Set conversation ID first
    this.currentConversationId = conversationId;
    
    // Get conversation info from the cached list
    const cachedConversations = await this.conversationStorage?.listConversations(false);
    const conversationInfo = cachedConversations?.find(c => c.id === conversationId);
    const status = conversationInfo?.status || 'UNKNOWN';
    
    this.outputChannel.appendLine(`Conversation status: ${status}`);

    // For stopped conversations, we need to resume to see history
    // The cloud doesn't expose event history for stopped V1 conversations
    if (status === 'STOPPED' || status === 'FINISHED') {
      // Show a placeholder message explaining the situation
      this.messages = [{
        role: 'system',
        content: `📋 **Conversation: ${conversationInfo?.title || 'Untitled'}**\n\nThis conversation is currently stopped. Send a message to resume it and see the history.`,
        timestamp: new Date(),
      }];
      this.syncMessages();
      this.syncConversationList();
      this.outputChannel.appendLine('Conversation is stopped - send a message to resume');
      return;
    }

    // For running conversations, try to load events
    if (this.conversationStorage) {
      try {
        const conversation = await this.conversationStorage.loadConversation(conversationId);
        if (conversation && conversation.messages.length > 0) {
          this.messages = conversation.messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
          }));
          this.syncMessages();
          this.syncConversationList();
          this.outputChannel.appendLine(`Loaded ${this.messages.length} messages from conversation history`);
        } else {
          this.outputChannel.appendLine(`No messages found for conversation ${conversationId}`);
          this.messages = [];
          this.syncMessages();
          this.syncConversationList();
        }
      } catch (error) {
        this.outputChannel.appendLine(`Error loading conversation: ${error}`);
        this.messages = [];
        this.syncMessages();
        this.syncConversationList();
      }
    }
  }

  private async handleDeleteConversation(conversationId: string): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
      'Delete this conversation?',
      { modal: true },
      'Delete'
    );

    if (confirm !== 'Delete') {
      return;
    }

    if (this.conversationStorage) {
      try {
        await this.conversationStorage.deleteConversation(conversationId);
        
        // If we deleted the current conversation, clear the chat
        if (conversationId === this.currentConversationId) {
          this.messages = [];
          this.currentConversationId = null;
          this.syncMessages();
        }

        // Refresh the list
        await this.loadConversationList(true);
        
        vscode.window.showInformationMessage('Conversation deleted');
      } catch (error) {
        this.outputChannel.appendLine(`Error deleting conversation: ${error}`);
        vscode.window.showErrorMessage('Failed to delete conversation');
      }
    }
  }

  // Update clearChat to also handle storage
  public clearChat() {
    this.messages = [];
    this.currentConversationId = null;
    this.syncMessages();
    this.syncConversationList();
    vscode.window.showInformationMessage('Chat history cleared');
  }

  // ============= End Conversation Management =============

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
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: var(--vscode-descriptionForeground);
      padding: 40px 20px;
    }
    
    .welcome-content {
      max-width: 300px;
    }
    
    .empty-state h3 {
      margin-bottom: 8px;
      color: var(--vscode-foreground);
    }
    
    .empty-state p {
      margin-bottom: 20px;
    }
    
    .start-btn {
      padding: 12px 32px;
      font-size: 14px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .start-btn:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    
    .start-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .ready-message {
      text-align: center;
      color: var(--vscode-descriptionForeground);
      padding: 40px 20px;
      font-style: italic;
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

    /* Conversation Selector Styles */
    .conversation-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--vscode-widget-border);
      background-color: var(--vscode-sideBar-background);
    }

    .new-chat-btn {
      padding: 4px 8px;
      font-size: 14px;
      min-width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .conversation-select {
      flex: 1;
      padding: 4px 8px;
      border: 1px solid var(--vscode-input-border);
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 4px;
      font-size: var(--vscode-font-size);
      cursor: pointer;
    }

    .conversation-select:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }

    .menu-btn {
      padding: 4px 8px;
      font-size: 14px;
      min-width: 32px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--vscode-foreground);
      cursor: pointer;
      border-radius: 4px;
    }

    .menu-btn:hover {
      background-color: var(--vscode-toolbar-hoverBackground);
    }

    .dropdown-menu {
      position: absolute;
      right: 12px;
      top: 40px;
      background-color: var(--vscode-menu-background);
      border: 1px solid var(--vscode-menu-border);
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 100;
      display: none;
    }

    .dropdown-menu.show {
      display: block;
    }

    .dropdown-item {
      padding: 8px 16px;
      cursor: pointer;
      white-space: nowrap;
      color: var(--vscode-menu-foreground);
    }

    .dropdown-item:hover {
      background-color: var(--vscode-menu-selectionBackground);
      color: var(--vscode-menu-selectionForeground);
    }

    .dropdown-item.danger {
      color: var(--vscode-errorForeground);
    }

    .dropdown-item.danger:hover {
      background-color: var(--vscode-inputValidation-errorBackground);
    }

    .header-wrapper {
      position: relative;
    }
  </style>
</head>
<body>
  <div class="header-wrapper">
    <div class="conversation-header">
      <button class="new-chat-btn primary" id="newChatBtn" title="New Chat">+</button>
      <select class="conversation-select" id="conversationSelect">
        <option value="">New Conversation</option>
      </select>
      <button class="menu-btn" id="menuBtn" title="More options">⋮</button>
    </div>
    <div class="dropdown-menu" id="dropdownMenu">
      <div class="dropdown-item" id="refreshBtn">↻ Refresh</div>
      <div class="dropdown-item danger" id="deleteBtn">🗑 Delete</div>
    </div>
  </div>

  <div class="chat-container" id="chatContainer">
    <div class="empty-state" id="emptyState">
      <div class="welcome-content">
        <h3>👋 Welcome to OpenHands</h3>
        <p>Your AI software development assistant</p>
        <button class="start-btn" id="startBtn">Start Conversation</button>
      </div>
    </div>
  </div>
  
  <div class="input-container" id="inputContainer" style="display: none;">
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
    const inputContainer = document.getElementById('inputContainer');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const stopBtn = document.getElementById('stopBtn');
    const startBtn = document.getElementById('startBtn');
    
    // Conversation selector elements
    const newChatBtn = document.getElementById('newChatBtn');
    const conversationSelect = document.getElementById('conversationSelect');
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const refreshBtn = document.getElementById('refreshBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    
    let isProcessing = false;
    let pendingFileChanges = [];
    let currentConversationId = null;
    let conversations = [];
    let conversationStarted = false;

    // Send ready signal
    vscode.postMessage({ type: 'ready' });

    // Start button handler
    startBtn.addEventListener('click', () => {
      startBtn.disabled = true;
      startBtn.textContent = 'Starting...';
      vscode.postMessage({ type: 'startConversation' });
    });

    // Conversation selector event handlers
    newChatBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'newConversation' });
      dropdownMenu.classList.remove('show');
    });

    conversationSelect.addEventListener('change', (e) => {
      const conversationId = e.target.value;
      if (conversationId && conversationId !== currentConversationId) {
        vscode.postMessage({ type: 'selectConversation', conversationId });
      } else if (!conversationId) {
        vscode.postMessage({ type: 'newConversation' });
      }
    });

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    refreshBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'refreshConversations' });
      dropdownMenu.classList.remove('show');
    });

    deleteBtn.addEventListener('click', () => {
      if (currentConversationId) {
        vscode.postMessage({ type: 'deleteConversation', conversationId: currentConversationId });
      }
      dropdownMenu.classList.remove('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });

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
        case 'updateConversations':
          updateConversationList(data.conversations, data.currentConversationId);
          break;
        case 'conversationStarted':
          // Conversation is ready - show input
          conversationStarted = true;
          currentConversationId = data.conversationId;
          emptyState.style.display = 'none';
          inputContainer.style.display = 'block';
          chatContainer.innerHTML = '<div class="ready-message">Ready! Send a message to start.</div>';
          messageInput.focus();
          break;
      }
    });

    function updateConversationList(convos, currentId) {
      conversations = convos || [];
      currentConversationId = currentId;
      
      // Clear and rebuild select options
      conversationSelect.innerHTML = '<option value="">New Conversation</option>';
      
      conversations.forEach(conv => {
        const option = document.createElement('option');
        option.value = conv.id;
        option.textContent = truncateTitle(conv.title, 40);
        option.title = conv.title; // Full title on hover
        if (conv.id === currentId) {
          option.selected = true;
        }
        conversationSelect.appendChild(option);
      });

      // Enable/disable delete button based on selection
      deleteBtn.style.opacity = currentConversationId ? '1' : '0.5';
      deleteBtn.style.pointerEvents = currentConversationId ? 'auto' : 'none';
    }

    function truncateTitle(title, maxLength) {
      if (title.length <= maxLength) return title;
      return title.substring(0, maxLength - 3) + '...';
    }

    function renderMessages(messages) {
      if (messages.length === 0 && !conversationStarted) {
        // Show welcome screen with start button
        emptyState.style.display = 'flex';
        inputContainer.style.display = 'none';
        chatContainer.innerHTML = '';
        chatContainer.appendChild(emptyState);
        // Reset start button
        startBtn.disabled = false;
        startBtn.textContent = 'Start Conversation';
        return;
      }

      // Hide welcome, show input
      emptyState.style.display = 'none';
      inputContainer.style.display = 'block';
      conversationStarted = true;

      if (messages.length === 0) {
        chatContainer.innerHTML = '<div class="ready-message">Ready! Send a message to start.</div>';
        return;
      }

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
