import { 
  getConversations as dbGetConversations,
  createConversation as dbCreateConversation,
  updateConversation as dbUpdateConversation,
  deleteConversation as dbDeleteConversation,
  addMessage as dbAddMessage
} from '../services/database';
import { Conversation, Message } from '../types';

export async function loadConversations(): Promise<Conversation[]> {
  return await dbGetConversations();
}

export async function createConversation(title: string, modelId: string): Promise<Conversation> {
  return await dbCreateConversation(title, modelId);
}

export async function updateConversation(conversationId: string, updates: { title?: string }): Promise<void> {
  await dbUpdateConversation(conversationId, updates);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await dbDeleteConversation(conversationId);
}

export async function addMessage(conversationId: string, message: Message): Promise<Message> {
  return await dbAddMessage(conversationId, message);
}