import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';
import { AuthWrapper } from './components/AuthWrapper';
import { Conversation, Message, ChatState } from './types';
import { loadModels } from './utils/models';
import { 
  loadConversations, 
  createConversation,
  updateConversation,
  deleteConversation,
  addMessage
} from './utils/storage';
import { sendMessage } from './utils/openai';
import { estimateTokens } from './utils/tokenCounter';

const STORAGE_API_KEY = 'openai-api-key';

function App() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    selectedModel: 'gpt-4o-mini',
    isLoading: false,
    error: null,
  });
  
  const [models, setModels] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [conversations, modelsData] = await Promise.all([
          loadConversations(),
          loadModels()
        ]);
        const storedApiKey = localStorage.getItem(STORAGE_API_KEY) || '';
        
        setState(prev => ({ ...prev, conversations }));
        setModels(modelsData);
        setApiKey(storedApiKey);
      } catch (error) {
        console.error('Failed to load data:', error);
        setState(prev => ({ ...prev, error: 'Failed to load data from database' }));
      }
    };

    loadData();
  }, []);

  const currentConversation = state.conversations.find(
    c => c.id === state.currentConversationId
  );

  const selectedModel = models.find(m => m.id === state.selectedModel) || models[0];

  const updateConversationTitle = async (conversation: Conversation) => {
    if (conversation.messages.length === 1) {
      const firstMessage = conversation.messages[0].content;
      const title = firstMessage.length > 50 
        ? firstMessage.substring(0, 50) + '...'
        : firstMessage;
      
      await updateConversation(conversation.id, { title });
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c =>
          c.id === conversation.id ? { ...c, title } : c
        )
      }));
    }
  };

  const handleNewChat = async () => {
    try {
      const newConversation = await createConversation('New Chat', state.selectedModel);
      setState(prev => ({
        ...prev,
        conversations: [newConversation, ...prev.conversations],
        currentConversationId: newConversation.id,
      }));
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setState(prev => ({ ...prev, error: 'Failed to create new conversation' }));
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setState(prev => ({ ...prev, currentConversationId: conversationId }));
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      setState(prev => {
        const filtered = prev.conversations.filter(c => c.id !== conversationId);
        const newCurrentId = prev.currentConversationId === conversationId 
          ? (filtered[0]?.id || null)
          : prev.currentConversationId;
        
        return {
          ...prev,
          conversations: filtered,
          currentConversationId: newCurrentId,
        };
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setState(prev => ({ ...prev, error: 'Failed to delete conversation' }));
    }
  };

  const handleModelChange = (modelId: string) => {
    setState(prev => ({ ...prev, selectedModel: modelId }));
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem(STORAGE_API_KEY, newApiKey);
  };

  const handleSendMessage = async (content: string) => {
    if (!apiKey) {
      setState(prev => ({ ...prev, error: 'Please set your OpenAI API key in settings' }));
      setSettingsOpen(true);
      return;
    }

    let conversation = currentConversation;
    
    // Create new conversation if none exists
    if (!conversation) {
      try {
        conversation = await createConversation('New Chat', state.selectedModel);
        setState(prev => ({
          ...prev,
          conversations: [conversation, ...prev.conversations],
          currentConversationId: conversation.id,
        }));
      } catch (error) {
        console.error('Failed to create conversation:', error);
        setState(prev => ({ ...prev, error: 'Failed to create conversation' }));
        return;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
        tokens: estimateTokens(content),
      };

      // Add user message to conversation
      await addMessage(conversation.id, userMessage);
      const updatedMessages = [...conversation.messages, userMessage];
      
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c =>
          c.id === conversation!.id
            ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
            : c
        ),
      }));

      // Update conversation title if it's the first message
      await updateConversationTitle({ ...conversation, messages: updatedMessages });

      // Send to OpenAI
      const response = await sendMessage(updatedMessages, state.selectedModel, apiKey);
      
      // Create assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        tokens: estimateTokens(response),
      };

      // Add assistant message to conversation
      await addMessage(conversation.id, assistantMessage);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        conversations: prev.conversations.map(c =>
          c.id === conversation!.id
            ? { 
                ...c, 
                messages: [...updatedMessages, assistantMessage], 
                updatedAt: Date.now() 
              }
            : c
        ),
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  return (
    <AuthWrapper>
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar
          conversations={state.conversations}
          currentConversationId={state.currentConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          isOpen={sidebarOpen}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header
          selectedModel={state.selectedModel}
          models={models}
          onModelChange={handleModelChange}
          onSettingsClick={() => setSettingsOpen(true)}
          onNewChat={handleNewChat}
        />

        {/* Error banner */}
        {state.error && (
          <div className="bg-red-50 border-b border-red-200 p-3">
            <p className="text-red-800 text-sm">{state.error}</p>
          </div>
        )}

        <ChatArea
          conversation={currentConversation}
          selectedModel={selectedModel}
          onSendMessage={handleSendMessage}
          isLoading={state.isLoading}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
    </AuthWrapper>
  );
}

export default App;