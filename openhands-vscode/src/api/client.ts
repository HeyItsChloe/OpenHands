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
    
    // Connect via Socket.IO with session_api_key
    await this.connectSocket(conversationId, conversationInfo?.session_api_key);
  }

  private async waitForConversationReady(conversationId: string, maxAttempts: number = 30): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.fetch(`/api/conversations/${conversationId}`);
        const data = await response.json() as any;
        this.log(`Conversation status: ${data.status}, runtime: ${data.runtime_status}`);
        
        // Check if the conversation is ready
        if (data.status === 'RUNNING' || data.status === 'AWAITING_USER_INPUT') {
          this.log(`Conversation is ready!`);
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

  private async connectSocket(conversationId: string, sessionApiKey?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.log(`Connecting Socket.IO to conversation: ${conversationId}`);
      
      const headers = await this.authService.getAuthHeadersAsync();
      const baseUrl = this.baseUrl.replace(/\/$/, '');
      
      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      // Build query params - session_api_key is required for Socket.IO auth
      const query: Record<string, any> = {
        conversation_id: conversationId,
        latest_event_id: -1,
      };
      
      if (sessionApiKey) {
        query.session_api_key = sessionApiKey;
        this.log(`Using session_api_key for Socket.IO auth`);
      }
      
      this.log(`Connecting to ${baseUrl} with path /socket.io`);
      
      this.socket = io(baseUrl, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        query,
        extraHeaders: headers,
      });
      
      this.socket.on('connect', () => {
        this.log(`Socket.IO connected! Socket ID: ${this.socket?.id}`);
        resolve();
      });
      
      this.socket.on('connect_error', (error: Error) => {
        this.log(`Socket.IO connection error: ${error.message}`);
        reject(error);
      });
      
      this.socket.on('oh_event', (event: AgentEvent) => {
        this.log(`Received event: ${event.action || event.observation || 'unknown'}`);
        this.eventHandlers.forEach(handler => handler(event));
      });
      
      this.socket.on('disconnect', (reason: string) => {
        this.log(`Socket.IO disconnected: ${reason}`);
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.socket?.connected) {
          this.log('Socket.IO connection timeout');
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

    // Send message via Socket.IO using oh_user_action event
    const messageEvent = {
      action: 'message',
      args: {
        content: fullMessage,
      },
    };
    
    this.log(`Sending message via Socket.IO: ${fullMessage.substring(0, 50)}...`);
    this.socket.emit('oh_user_action', messageEvent);
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
}
