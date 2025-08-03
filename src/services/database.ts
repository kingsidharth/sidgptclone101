import { supabase } from '../lib/supabase';
import { Model, Conversation, Message } from '../types';

// Models
export async function getModels(): Promise<Model[]> {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching models:', error);
    throw new Error('Failed to load models');
  }

  return data.map(model => ({
    id: model.id,
    name: model.name,
    contextWindow: model.context_window,
    costPer1k: model.cost_per_1k
  }));
}

// Conversations
export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw new Error('Failed to load conversations');
  }

  // Get messages for each conversation
  const conversationsWithMessages = await Promise.all(
    data.map(async (conv) => {
      const messages = await getMessages(conv.id);
      return {
        id: conv.id,
        title: conv.title,
        messages,
        model: conv.model_id,
        createdAt: new Date(conv.created_at || '').getTime(),
        updatedAt: new Date(conv.updated_at || '').getTime()
      };
    })
  );

  return conversationsWithMessages;
}

export async function createConversation(title: string, modelId: string): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      title,
      model_id: modelId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }

  return {
    id: data.id,
    title: data.title,
    messages: [],
    model: data.model_id,
    createdAt: new Date(data.created_at || '').getTime(),
    updatedAt: new Date(data.updated_at || '').getTime()
  };
}

export async function updateConversation(conversationId: string, updates: { title?: string }): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  if (error) {
    console.error('Error updating conversation:', error);
    throw new Error('Failed to update conversation');
  }
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
    throw new Error('Failed to delete conversation');
  }
}

// Messages
export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp');

  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to load messages');
  }

  return data.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: msg.timestamp,
    tokens: msg.tokens || undefined
  }));
}

export async function addMessage(conversationId: string, message: Omit<Message, 'id'>): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      tokens: message.tokens || null,
      timestamp: message.timestamp
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message');
  }

  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return {
    id: data.id,
    role: data.role as 'user' | 'assistant',
    content: data.content,
    timestamp: data.timestamp,
    tokens: data.tokens || undefined
  };
}