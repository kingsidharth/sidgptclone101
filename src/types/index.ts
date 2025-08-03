export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface Model {
  id: string;
  name: string;
  contextWindow: number;
  costPer1k: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  selectedModel: string;
  isLoading: boolean;
  error: string | null;
}