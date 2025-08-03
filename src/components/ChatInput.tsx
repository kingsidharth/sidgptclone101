import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { estimateTokens } from '../utils/tokenCounter';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  canSend: boolean;
  contextUsage: number;
  contextWindow: number;
}

export function ChatInput({ 
  onSendMessage, 
  disabled, 
  canSend, 
  contextUsage, 
  contextWindow 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const estimatedTokens = estimateTokens(message);
  const usagePercentage = (contextUsage / contextWindow) * 100;
  const willExceed = !canSend && message.trim().length > 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && canSend && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Context Usage Indicator */}
      <div className="mb-3 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  usagePercentage > 90 ? 'bg-red-500' : 
                  usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <span className="text-gray-600">
              {contextUsage.toLocaleString()}/{contextWindow.toLocaleString()} tokens
            </span>
          </div>
          
          {willExceed && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle size={14} />
              <span>Context limit exceeded</span>
            </div>
          )}
        </div>
        
        {message.trim() && (
          <span className="text-gray-500">
            +{estimatedTokens} tokens
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
            rows={1}
            disabled={disabled}
          />
        </div>
        
        <button
          type="submit"
          disabled={disabled || !message.trim() || !canSend}
          className={`p-3 rounded-xl transition-colors ${
            disabled || !message.trim() || !canSend
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}