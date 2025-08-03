import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Conversation, Model } from '../types';
import { calculateContextUsage, canSendMessage } from '../utils/tokenCounter';
import { Loader2, MessageCircle } from 'lucide-react';

interface ChatAreaProps {
  conversation: Conversation | null;
  selectedModel: Model;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatArea({ conversation, selectedModel, onSendMessage, isLoading }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ChatGPT Clone</h3>
          <p className="text-gray-600">Start a new conversation to begin chatting</p>
        </div>
      </div>
    );
  }

  const contextUsage = calculateContextUsage(conversation.messages);
  const canSend = (message: string) => 
    canSendMessage(conversation.messages, message, selectedModel.contextWindow);

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Loader2 size={16} className="text-white animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-3 bg-gray-100 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        canSend={canSend}
        contextUsage={contextUsage}
        contextWindow={selectedModel.contextWindow}
      />
    </div>
  );
}