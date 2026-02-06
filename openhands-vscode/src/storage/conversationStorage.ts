import * as vscode from 'vscode';
import { OpenHandsClient } from '../api';

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  cloudId?: string;  // Cloud conversation ID
}

export interface StoredMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: string;
  observation?: string;
}

export interface ConversationWithMessages extends ConversationSummary {
  messages: StoredMessage[];
}

interface LocalCache {
  conversations: ConversationSummary[];
  messageCache: Record<string, StoredMessage[]>;  // conversationId -> messages
  lastSynced: string;
}

const CACHE_KEY = 'openhands.conversationCache';
const CACHE_TTL_MS = 5 * 60 * 1000;  // 5 minutes

export class ConversationStorageService {
  private cache: LocalCache | null = null;
  private context: vscode.ExtensionContext;
  private client: OpenHandsClient;
  private outputChannel: vscode.OutputChannel;

  constructor(
    context: vscode.ExtensionContext,
    client: OpenHandsClient,
    outputChannel: vscode.OutputChannel
  ) {
    this.context = context;
    this.client = client;
    this.outputChannel = outputChannel;
    this.loadLocalCache();
  }

  private log(message: string): void {
    this.outputChannel.appendLine(`[ConversationStorage] ${message}`);
  }

  // Load cache from VS Code storage
  private loadLocalCache(): void {
    try {
      const cached = this.context.globalState.get<LocalCache>(CACHE_KEY);
      if (cached) {
        this.cache = cached;
        this.log(`Loaded ${cached.conversations.length} conversations from local cache`);
      } else {
        this.cache = {
          conversations: [],
          messageCache: {},
          lastSynced: '',
        };
      }
    } catch (error) {
      this.log(`Error loading cache: ${error}`);
      this.cache = {
        conversations: [],
        messageCache: {},
        lastSynced: '',
      };
    }
  }

  // Save cache to VS Code storage
  private async saveLocalCache(): Promise<void> {
    if (this.cache) {
      await this.context.globalState.update(CACHE_KEY, this.cache);
      this.log('Saved conversation cache');
    }
  }

  // Check if cache is stale
  private isCacheStale(): boolean {
    if (!this.cache?.lastSynced) return true;
    const lastSynced = new Date(this.cache.lastSynced).getTime();
    return Date.now() - lastSynced > CACHE_TTL_MS;
  }

  // List all conversations (hybrid: try cloud, fallback to cache)
  async listConversations(forceRefresh = false): Promise<ConversationSummary[]> {
    // Return cache if fresh and not forcing refresh
    if (!forceRefresh && !this.isCacheStale() && this.cache?.conversations.length) {
      this.log('Returning cached conversation list');
      return this.cache.conversations;
    }

    // Try to fetch from cloud
    try {
      const cloudConversations = await this.client.getConversations();
      
      const conversations: ConversationSummary[] = cloudConversations.map((conv: any) => ({
        id: conv.conversation_id,
        title: conv.title || `Conversation ${conv.conversation_id.substring(0, 5)}`,
        createdAt: conv.created_at,
        updatedAt: conv.last_updated_at,
        status: conv.status,
        cloudId: conv.conversation_id,
      }));

      // Sort by updated date (most recent first)
      conversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      // Update cache
      if (this.cache) {
        this.cache.conversations = conversations;
        this.cache.lastSynced = new Date().toISOString();
        await this.saveLocalCache();
      }

      this.log(`Fetched ${conversations.length} conversations from cloud`);
      return conversations;

    } catch (error) {
      this.log(`Error fetching from cloud: ${error}`);
      // Return cached conversations as fallback
      if (this.cache?.conversations.length) {
        this.log('Returning cached conversations as fallback');
        return this.cache.conversations;
      }
      return [];
    }
  }

  // Load full conversation with messages (hybrid)
  async loadConversation(conversationId: string): Promise<ConversationWithMessages | null> {
    // Check message cache first
    const cachedMessages = this.cache?.messageCache[conversationId];
    const cachedConvo = this.cache?.conversations.find(c => c.id === conversationId);

    // Try to fetch from cloud
    try {
      const events = await this.client.fetchEvents(conversationId);
      const messages = this.eventsToMessages(events);

      // Update message cache
      if (this.cache) {
        this.cache.messageCache[conversationId] = messages;
        await this.saveLocalCache();
      }

      const conversation = cachedConvo || {
        id: conversationId,
        title: `Conversation ${conversationId.substring(0, 5)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'RUNNING',
        cloudId: conversationId,
      };

      this.log(`Loaded ${messages.length} messages for conversation ${conversationId}`);
      return { ...conversation, messages };

    } catch (error) {
      this.log(`Error loading conversation from cloud: ${error}`);
      
      // Return cached version as fallback
      if (cachedMessages && cachedConvo) {
        this.log('Returning cached conversation as fallback');
        return { ...cachedConvo, messages: cachedMessages };
      }
      return null;
    }
  }

  // Convert cloud events to messages
  private eventsToMessages(events: any[]): StoredMessage[] {
    const messages: StoredMessage[] = [];

    for (const event of events) {
      // Skip system events
      if (event.observation === 'agent_state_changed') continue;
      if (event.action === 'change_agent_state') continue;
      if (event.action === 'recall') continue;

      // User messages
      if (event.source === 'user' && event.action === 'message') {
        messages.push({
          id: event.id,
          role: 'user',
          content: event.args?.content || event.message || '',
          timestamp: event.timestamp,
          action: event.action,
        });
      }

      // Agent messages
      if (event.source === 'agent' && event.action === 'message') {
        messages.push({
          id: event.id,
          role: 'assistant',
          content: event.message || event.args?.content || '',
          timestamp: event.timestamp,
          action: event.action,
        });
      }

      // Agent finish action
      if (event.source === 'agent' && event.action === 'finish') {
        const content = event.args?.final_thought || event.message || '';
        if (content) {
          messages.push({
            id: event.id,
            role: 'assistant',
            content,
            timestamp: event.timestamp,
            action: event.action,
          });
        }
      }

      // File edit observations
      if (event.observation === 'edit' && event.message) {
        messages.push({
          id: event.id,
          role: 'assistant',
          content: event.message,
          timestamp: event.timestamp,
          observation: event.observation,
        });
      }
    }

    return messages;
  }

  // Save a message to local cache (for offline support)
  async cacheMessage(conversationId: string, message: StoredMessage): Promise<void> {
    if (!this.cache) return;

    if (!this.cache.messageCache[conversationId]) {
      this.cache.messageCache[conversationId] = [];
    }
    this.cache.messageCache[conversationId].push(message);
    await this.saveLocalCache();
  }

  // Update conversation title in cache
  async updateTitle(conversationId: string, title: string): Promise<void> {
    if (!this.cache) return;

    const conv = this.cache.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.title = title;
      await this.saveLocalCache();
    }
  }

  // Add new conversation to cache
  async addConversation(conversation: ConversationSummary): Promise<void> {
    if (!this.cache) return;

    // Remove existing if present
    this.cache.conversations = this.cache.conversations.filter(
      c => c.id !== conversation.id
    );
    
    // Add to front
    this.cache.conversations.unshift(conversation);
    this.cache.messageCache[conversation.id] = [];
    await this.saveLocalCache();
  }

  // Delete conversation from cache
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      // Try to delete from cloud
      await this.client.deleteConversation(conversationId);
      this.log(`Deleted conversation ${conversationId} from cloud`);
    } catch (error) {
      this.log(`Error deleting from cloud: ${error}`);
    }

    // Remove from local cache
    if (this.cache) {
      this.cache.conversations = this.cache.conversations.filter(
        c => c.id !== conversationId
      );
      delete this.cache.messageCache[conversationId];
      await this.saveLocalCache();
    }

    return true;
  }

  // Get cached messages for a conversation
  getCachedMessages(conversationId: string): StoredMessage[] {
    return this.cache?.messageCache[conversationId] || [];
  }

  // Clear all local cache
  async clearCache(): Promise<void> {
    this.cache = {
      conversations: [],
      messageCache: {},
      lastSynced: '',
    };
    await this.context.globalState.update(CACHE_KEY, undefined);
    this.log('Cleared conversation cache');
  }
}
