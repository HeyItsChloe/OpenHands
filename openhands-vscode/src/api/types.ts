export interface Conversation {
  conversation_id: string;
  created_at: string;
  status: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface FileContext {
  path: string;
  content: string;
  selection?: {
    startLine: number;
    endLine: number;
    text: string;
  };
  language?: string;
}

export interface AgentEvent {
  id: number;
  source: 'agent' | 'user';
  action?: string;
  observation?: string;
  message?: string;
  args?: Record<string, unknown>;
  content?: string;
  extras?: Record<string, unknown>;
  timestamp?: string;
}

export interface FileReadAction {
  action: 'read';
  path: string;
}

export interface FileWriteAction {
  action: 'write';
  path: string;
  content: string;
}

export interface FileEditAction {
  action: 'edit';
  path: string;
  oldContent: string;
  newContent: string;
}

export type FileAction = FileReadAction | FileWriteAction | FileEditAction;

export interface ChatRequest {
  message: string;
  context?: FileContext;
}

export interface ConversationConfig {
  selectedRepository?: string;
  selectedAgent?: string;
}

export interface ApiError {
  error: string;
  message: string;
  status?: number;
}
