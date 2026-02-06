import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth';
import { 
  Conversation, 
  AgentEvent, 
  FileContext, 
  ApiError 
} from './types';

export class OpenHandsClient {
  private authService: AuthService;
  private outputChannel: vscode.OutputChannel;
  private currentConversationId: string | null = null;
  private eventSource: EventSource | null = null;
  private socket: Socket | null = null;
  private eventHandlers: ((event: AgentEvent) => void)[] = [];

  constructor(authService: AuthService, outputChannel: vscode.OutputChannel) {
    this.authService = authService;
    this.outputChannel = outputChannel;
  }

  private get baseUrl(): string {
    return this.authService.getServerUrl();
  }

  private log(message: string): void {
    this.outputChannel.appendLine(`[OpenHands API] ${message}`);
  }

  private async fetch(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.authService.getAuthHeadersAsync();
    
    this.log(`${options.method || 'GET'} ${url}`);
    this.log(`Auth headers present: ${Object.keys(headers).join(', ') || 'NONE'}`);
    if (headers['Authorization']) {
      this.log(`Auth type: ${headers['Authorization'].substring(0, 20)}...`);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      this.log(`Error: ${response.status} - ${error}`);
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    return response;
  }

  async createConversation(): Promise<Conversation> {
    // Step 1: Create the conversation
    const response = await this.fetch('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const conversation = await response.json() as Conversation;
    this.currentConversationId = conversation.conversation_id;
    this.log(`Created conversation: ${conversation.conversation_id}`);
    
    // Step 2: Start the conversation (required before sending messages)
    await this.startConversation(conversation.conversation_id);
    
    return conversation;
  }

  async startConversation(conversationId: string): Promise<void> {
    this.log(`Starting conversation: ${conversationId}`);
    
    const response = await this.fetch(`/api/conversations/${conversationId}/start`, {
      method: 'POST',
      body: JSON.stringify({
        providers_set: []
      }),
    });
    
    const startResult = await response.json() as any;
    this.log(`Started conversation: ${conversationId}, status: ${startResult.conversation_status}`);
    
    // Wait for conversation to be ready
    const conversationInfo = await this.waitForConversationReady(conversationId);
    
    // Connect via Socket.IO - use conversation URL if provided (it points to the runtime server)
    await this.connectSocket(
      conversationId, 
      conversationInfo?.session_api_key,
      conversationInfo?.url
    );
  }

  private async waitForConversationReady(conversationId: string, maxAttempts: number = 30): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.fetch(`/api/conversations/${conversationId}`);
        const data = await response.json() as any;
        this.log(`Conversation status: ${data.status}, runtime: ${data.runtime_status}`);
        this.log(`Conversation URL: ${data.url || 'none'}`);
        
        // Check if the conversation is ready
        if (data.status === 'RUNNING' || data.status === 'AWAITING_USER_INPUT') {
          this.log(`Conversation is ready!`);
          this.log(`Full conversation data: ${JSON.stringify(data)}`);
          return data;
        }
      } catch (error) {
        this.log(`Waiting... (attempt ${i + 1}/${maxAttempts})`);
      }
      
      // Wait 2 seconds between checks
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    this.log(`Conversation may not be fully ready, proceeding anyway...`);
    return null;
  }

  private async connectSocket(conversationId: string, sessionApiKey?: string, conversationUrl?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.log(`Connecting Socket.IO to conversation: ${conversationId}`);
      
      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      // Determine Socket.IO host and path
      // If conversationUrl is provided (points to runtime server), use that
      // Otherwise fall back to main app URL
      let socketHost: string;
      let socketPath: string = '/socket.io';
      
      if (conversationUrl && !conversationUrl.startsWith('/')) {
        const u = new URL(conversationUrl);
        socketHost = u.host;
        // Store runtime base URL for REST API calls
        this.runtimeUrl = `https://${u.host}`;
        // Store session API key for REST API auth
        if (sessionApiKey) {
          this.sessionApiKey = sessionApiKey;
        }
        // Check if there's a path prefix before /api/conversations
        const pathBeforeApi = u.pathname.split('/api/conversations')[0] || '/';
        socketPath = `${pathBeforeApi.replace(/\/$/, '')}/socket.io`;
        this.log(`Using runtime URL: ${socketHost}, path: ${socketPath}`);
      } else {
        const urlObj = new URL(this.baseUrl);
        socketHost = urlObj.host;
        this.log(`Using main app URL: ${socketHost}`);
      }
      
      // Get API key
      const apiKey = await this.authService.getApiKey();
      
      // Build query params
      const query: Record<string, any> = {
        conversation_id: conversationId,
        latest_event_id: -1,
      };
      
      if (sessionApiKey) {
        query.session_api_key = sessionApiKey;
        this.log(`Using session_api_key for Socket.IO auth`);
      }
      
      this.log(`Connecting Socket.IO to host: ${socketHost}`);
      this.log(`Query params: ${JSON.stringify(query)}`);
      
      // Try WebSocket-only with headers (works better in Node.js)
      // autoConnect: false so we can set up handlers first
      this.socket = io(`https://${socketHost}`, {
        path: socketPath,
        transports: ['websocket'],
        query,
        extraHeaders: apiKey ? {
          'Authorization': `Bearer ${apiKey}`,
        } : undefined,
        forceNew: true,
        reconnection: false,
        timeout: 25000,
        autoConnect: false, // Don't connect until handlers are set up
      });
      
      this.log(`Socket.IO transport: websocket only`);
      
      // Socket-level events
      this.socket.on('connect', () => {
        this.log(`Socket.IO connected! Socket ID: ${this.socket?.id}`);
        resolve();
      });
      
      this.socket.on('connect_error', (error: Error) => {
        this.log(`Socket.IO connection error: ${error.message}`);
        this.log(`Error stack: ${error.stack}`);
        reject(error);
      });
      
      this.socket.on('oh_event', (event: AgentEvent) => {
        this.log(`Received event: ${event.action || event.observation || 'unknown'}`);
        this.eventHandlers.forEach(handler => handler(event));
      });
      
      this.socket.on('disconnect', (reason: string, description: any) => {
        this.log(`Socket.IO disconnected: ${reason}`);
        if (description) {
          this.log(`Disconnect description: ${JSON.stringify(description)}`);
        }
      });
      
      // Catch-all for any event
      this.socket.onAny((eventName: string, ...args: any[]) => {
        this.log(`Socket event '${eventName}': ${JSON.stringify(args).substring(0, 200)}`);
      });
      
      // Manager-level events
      this.socket.io.on('error', (error: Error) => {
        this.log(`Manager error: ${error.message}`);
      });
      
      this.socket.io.on('ping', () => {
        this.log(`Manager ping`);
      });
      
      this.socket.io.on('open', () => {
        this.log(`Manager opened - setting up engine listeners`);
        
        // Engine is now available
        const engine = (this.socket!.io as any).engine;
        if (engine) {
          this.log(`Engine available, transport: ${engine.transport?.name}`);
          
          engine.on('message', (msg: string) => {
            this.log(`Engine message: ${msg.substring(0, 500)}`);
          });
          
          engine.on('close', (reason: string, desc: any) => {
            this.log(`Engine close: ${reason}, desc: ${JSON.stringify(desc)}`);
          });
        } else {
          this.log(`Engine not available!`);
        }
      });
      
      this.socket.io.on('close', (reason: string) => {
        this.log(`Manager closed: ${reason}`);
      });
      
      this.socket.io.on('packet', (packet: any) => {
        this.log(`Manager packet: type=${packet.type}, nsp=${packet.nsp}, data=${JSON.stringify(packet.data)?.substring(0, 200)}`);
      });
      
      // Now connect
      this.log(`Connecting socket...`);
      this.socket.connect();
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.socket?.connected) {
          this.log('Socket.IO connection timeout');
          this.log(`Socket state: connected=${this.socket?.connected}, disconnected=${this.socket?.disconnected}`);
          this.log(`Socket id: ${this.socket?.id}`);
          reject(new Error('Socket.IO connection timeout'));
        }
      }, 30000);
    });
  }

  onEvent(handler: (event: AgentEvent) => void): void {
    this.eventHandlers.push(handler);
  }

  offEvent(handler: (event: AgentEvent) => void): void {
    this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await this.fetch(`/api/conversations/${conversationId}`);
    return response.json() as Promise<Conversation>;
  }

  // Fetch events from the runtime server (useful for getting missed events)
  async fetchEvents(conversationId: string, startId: number = 0): Promise<AgentEvent[]> {
    // Try main API first (works for all conversations, including stopped ones)
    // Endpoint is /api/conversations/{id}/events
    try {
      const url = `${this.baseUrl}/api/conversations/${conversationId}/events?start_id=${startId}&limit=100`;
      this.log(`Fetching events from main API: ${url}`);
      
      const headers = await this.authService.getAuthHeadersAsync();
      const response = await fetch(url, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json() as { events: AgentEvent[], has_more: boolean };
        this.log(`Fetched ${result.events?.length || 0} events from main API`);
        return result.events || [];
      }
      
      const errorText = await response.text();
      this.log(`Main API failed: ${response.status} - ${errorText.substring(0, 100)}`);
    } catch (error) {
      this.log(`Error fetching from main API: ${error}`);
    }
    
    // Fallback to runtime URL if available (for running conversations)
    if (this.runtimeUrl && this.sessionApiKey) {
      try {
        const url = `${this.runtimeUrl}/api/conversations/${conversationId}/events?start_id=${startId}&limit=100`;
        this.log(`Fetching events from runtime: ${url}`);
        
        const headers = await this.authService.getAuthHeadersAsync();
        const response = await fetch(url, {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'X-Session-API-Key': this.sessionApiKey,
          },
        });
        
        if (response.ok) {
          const result = await response.json() as { events: AgentEvent[], has_more: boolean };
          this.log(`Fetched ${result.events?.length || 0} events from runtime`);
          return result.events || [];
        }
        
        const text = await response.text();
        this.log(`Runtime API failed: ${response.status} - ${text.substring(0, 200)}`);
      } catch (error) {
        this.log(`Error fetching from runtime: ${error}`);
      }
    }
    
    this.log('Could not fetch events from any source');
    return [];
  }

  private runtimeUrl: string | null = null;
  private sessionApiKey: string | null = null;
  
  setRuntimeUrl(url: string) {
    this.runtimeUrl = url;
  }
  
  setSessionApiKey(key: string) {
    this.sessionApiKey = key;
  }

  // Check if Socket.IO is connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  async sendMessage(
    conversationId: string, 
    message: string, 
    context?: FileContext
  ): Promise<void> {
    let fullMessage = message;
    
    if (context) {
      fullMessage = this.buildContextualMessage(message, context);
    }

    if (!this.socket?.connected) {
      throw new Error('Socket.IO not connected. Please start a conversation first.');
    }

    // Wait a moment for the agent to be fully ready
    // This helps avoid the first-message-not-processed issue
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send message via Socket.IO using oh_user_action event
    const messageEvent = {
      action: 'message',
      args: {
        content: fullMessage,
      },
    };
    
    this.log(`Sending message via Socket.IO: ${fullMessage.substring(0, 50)}...`);
    this.socket.emit('oh_user_action', messageEvent);
    
    // Small delay before triggering run
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // After sending message, trigger agent to run
    // This is needed because the agent starts in AWAITING_USER_INPUT state
    const runEvent = {
      action: 'change_agent_state',
      args: {
        agent_state: 'running',
      },
    };
    this.log(`Triggering agent to run...`);
    this.socket.emit('oh_user_action', runEvent);
    
    this.log(`Sent message to conversation ${conversationId}`);
  }

  private buildContextualMessage(message: string, context: FileContext): string {
    let contextStr = `\n\n---\n**File:** \`${context.path}\``;
    
    if (context.language) {
      contextStr += ` (${context.language})`;
    }
    
    if (context.selection) {
      contextStr += `\n**Lines ${context.selection.startLine}-${context.selection.endLine}:**\n\`\`\`${context.language || ''}\n${context.selection.text}\n\`\`\``;
    } else {
      contextStr += `\n\`\`\`${context.language || ''}\n${context.content}\n\`\`\``;
    }

    return message + contextStr;
  }

  streamEvents(
    conversationId: string,
    onEvent: (event: AgentEvent) => void,
    onError: (error: Error) => void,
    onComplete?: () => void
  ): () => void {
    const url = `${this.baseUrl}/api/conversations/${conversationId}/events`;
    this.log(`Starting event stream: ${url}`);

    let isClosed = false;
    
    const startEventSource = async () => {
      try {
        const headers = await this.authService.getAuthHeadersAsync();
        
        // Using fetch with readable stream for SSE
        const response = await fetch(url, {
          headers: {
            'Accept': 'text/event-stream',
            ...headers,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to connect to event stream: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (!isClosed) {
          const { done, value } = await reader.read();
          
          if (done) {
            this.log('Event stream completed');
            onComplete?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                onEvent(data as AgentEvent);
              } catch (e) {
                // Skip non-JSON data lines
              }
            }
          }
        }
      } catch (error) {
        if (!isClosed) {
          this.log(`Event stream error: ${error}`);
          onError(error as Error);
        }
      }
    };

    startEventSource();

    // Return cleanup function
    return () => {
      isClosed = true;
      this.log('Event stream closed by client');
    };
  }

  async stopAgent(conversationId: string): Promise<void> {
    await this.fetch(`/api/conversations/${conversationId}/stop`, {
      method: 'POST',
    });
    this.log(`Stopped agent for conversation ${conversationId}`);
  }

  getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }

  setCurrentConversationId(id: string | null): void {
    this.currentConversationId = id;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.fetch('/api/options/models');
      return response.ok;
    } catch (error) {
      this.log(`Connection test failed: ${error}`);
      return false;
    }
  }

  // Get list of all conversations
  async getConversations(limit: number = 50): Promise<any[]> {
    try {
      const response = await this.fetch(`/api/conversations?limit=${limit}`);
      const data = await response.json() as any;
      
      // API returns { results: [...], next_page_id: ... }
      const conversations = data.results || data || [];
      this.log(`Fetched ${conversations.length} conversations`);
      return conversations;
    } catch (error) {
      this.log(`Error fetching conversations: ${error}`);
      throw error;
    }
  }

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<void> {
    await this.fetch(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    this.log(`Deleted conversation: ${conversationId}`);
  }

  // Get V1 app conversation data
  private async getV1AppConversation(conversationId: string): Promise<any | null> {
    try {
      const response = await this.fetch(`/api/v1/app-conversations?ids=${conversationId}`);
      const conversations = await response.json() as any[];
      return conversations[0] || null;
    } catch (error) {
      this.log(`Failed to get V1 conversation: ${error}`);
      return null;
    }
  }

  // Resume a V1 sandbox
  private async resumeV1Sandbox(sandboxId: string): Promise<void> {
    this.log(`Resuming V1 sandbox: ${sandboxId}`);
    await this.fetch(`/api/v1/sandboxes/${sandboxId}/resume`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Reconnect to an existing conversation (supports both V0 and V1)
  async reconnectToConversation(conversationId: string): Promise<any> {
    this.log(`Reconnecting to conversation: ${conversationId}`);
    
    // First, try to get V1 app conversation data
    const v1Conversation = await this.getV1AppConversation(conversationId);
    
    if (v1Conversation) {
      // This is a V1 conversation
      // V1 uses execution_status (not status) and sandbox_status
      const executionStatus = v1Conversation.execution_status;
      const sandboxStatus = v1Conversation.sandbox_status;
      this.log(`V1 conversation found. execution_status: ${executionStatus}, sandbox_status: ${sandboxStatus}, sandbox_id: ${v1Conversation.sandbox_id}`);
      
      // Need to resume if execution is stopped/paused OR sandbox is not running
      const needsResume = 
        executionStatus === 'STOPPED' || 
        executionStatus === 'PAUSED' ||
        executionStatus === 'FINISHED' ||
        sandboxStatus === 'STOPPED' ||
        sandboxStatus === 'PAUSED';
      
      if (needsResume) {
        // Resume the sandbox first
        if (v1Conversation.sandbox_id) {
          await this.resumeV1Sandbox(v1Conversation.sandbox_id);
        }
        
        // Wait for conversation to be ready
        const readyConversation = await this.waitForV1ConversationReady(conversationId);
        await this.connectSocket(
          conversationId,
          readyConversation?.session_api_key,
          readyConversation?.conversation_url
        );
        return readyConversation;
      } else if (executionStatus === 'RUNNING' || executionStatus === 'AWAITING_USER_INPUT') {
        // Already running, just connect
        await this.connectSocket(
          conversationId,
          v1Conversation.session_api_key,
          v1Conversation.conversation_url
        );
        return v1Conversation;
      }
      
      return v1Conversation;
    }
    
    // Fall back to V0 API
    this.log('Trying V0 API...');
    const response = await this.fetch(`/api/conversations/${conversationId}`);
    const conversation = await response.json() as any;
    
    if (conversation.status === 'STOPPED' || conversation.status === 'FINISHED') {
      // Need to restart it (V0 style)
      await this.fetch(`/api/conversations/${conversationId}/start`, {
        method: 'POST',
        body: JSON.stringify({ providers_set: [] }),
      });
      
      const readyConversation = await this.waitForConversationReady(conversationId);
      await this.connectSocket(
        conversationId,
        readyConversation?.session_api_key,
        readyConversation?.url
      );
      return readyConversation;
    } else if (conversation.status === 'RUNNING') {
      await this.connectSocket(
        conversationId,
        conversation.session_api_key,
        conversation.url
      );
      return conversation;
    }
    
    return conversation;
  }

  // Wait for V1 conversation to be ready
  private async waitForV1ConversationReady(conversationId: string, maxWaitMs: number = 120000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const conversation = await this.getV1AppConversation(conversationId);
      
      if (conversation) {
        const executionStatus = conversation.execution_status;
        const sandboxStatus = conversation.sandbox_status;
        this.log(`V1 Conversation: execution_status=${executionStatus}, sandbox_status=${sandboxStatus}, url=${conversation.conversation_url || 'none'}`);
        
        // Ready when execution is running/awaiting input AND we have a conversation URL
        const isReady = 
          (executionStatus === 'RUNNING' || executionStatus === 'AWAITING_USER_INPUT') &&
          conversation.conversation_url && 
          conversation.session_api_key;
        
        if (isReady) {
          return conversation;
        }
        
        // Check for errors
        if (sandboxStatus === 'ERROR' || sandboxStatus === 'FAILED') {
          throw new Error(`Sandbox failed to start: ${sandboxStatus}`);
        }
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Timeout waiting for conversation to be ready');
  }
}
