import { Conversation, Message } from '../types';

const STORAGE_KEY = 'chatgpt-conversations';

export function loadConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversations:', error);
  }
}

export function createConversation(title: string, modelId: string): Conversation {
  const conversation: Conversation = {
    id: crypto.randomUUID(),
    title,
    messages: [],
    model: modelId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const conversations = loadConversations();
  conversations.unshift(conversation);
  saveConversations(conversations);
  
  return conversation;
}

export function updateConversation(conversationId: string, updates: Partial<Conversation>): void {
  const conversations = loadConversations();
  const index = conversations.findIndex(c => c.id === conversationId);
  
  if (index !== -1) {
    conversations[index] = { ...conversations[index], ...updates, updatedAt: Date.now() };
    saveConversations(conversations);
  }
}

export function deleteConversation(conversationId: string): void {
  const conversations = loadConversations();
  const filtered = conversations.filter(c => c.id !== conversationId);
  saveConversations(filtered);
}

export function addMessage(conversationId: string, message: Message): void {
  const conversations = loadConversations();
  const conversation = conversations.find(c => c.id === conversationId);
  
  if (conversation) {
    conversation.messages.push(message);
    conversation.updatedAt = Date.now();
    saveConversations(conversations);
  }
}