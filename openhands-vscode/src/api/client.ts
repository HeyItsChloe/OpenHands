import * as vscode from 'vscode';
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
    const response = await this.fetch('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const conversation = await response.json() as Conversation;
    this.currentConversationId = conversation.conversation_id;
    this.log(`Created conversation: ${conversation.conversation_id}`);
    return conversation;
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

    await this.fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content: fullMessage,
      }),
    });

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
