import React from 'react';
import { Settings, MessageSquare } from 'lucide-react';
import { Model } from '../types';

interface HeaderProps {
  selectedModel: string;
  models: Model[];
  onModelChange: (modelId: string) => void;
  onSettingsClick: () => void;
  onNewChat: () => void;
}

export function Header({ selectedModel, models, onModelChange, onSettingsClick, onNewChat }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onNewChat}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare size={16} />
          <span>New Chat</span>
        </button>
        
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onSettingsClick}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Settings size={20} />
      </button>
    </header>
  );
}