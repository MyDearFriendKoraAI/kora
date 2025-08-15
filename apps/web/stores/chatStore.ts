import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  // Conversazioni
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Rate limiting
  remainingRequests: number | undefined;
  lastRequestDate: string | null;
  
  // Actions
  addMessage: (conversationId: string, message: ChatMessage) => void;
  createConversation: (id: string, title?: string) => void;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Rate limiting
  setRemainingRequests: (count: number) => void;
  resetDailyLimit: () => void;
  
  // Persistence
  loadConversation: (id: string, conversation: any) => void;
  updateConversationTitle: (id: string, title: string) => void;
}

const STORAGE_KEY = 'kora-ai-chat';

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: {},
      currentConversationId: null,
      isLoading: false,
      error: null,
      remainingRequests: undefined,
      lastRequestDate: null,

      // Message actions
      addMessage: (conversationId, message) => {
        set((state) => {
          const conversation = state.conversations[conversationId];
          
          if (!conversation) {
            // Crea nuova conversazione se non exists
            const title = generateConversationTitle(message.content);
            const newConversation: Conversation = {
              id: conversationId,
              title,
              messages: [message],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            return {
              conversations: {
                ...state.conversations,
                [conversationId]: newConversation,
              },
              currentConversationId: conversationId,
            };
          }
          
          // Aggiungi messaggio a conversazione esistente
          const updatedConversation: Conversation = {
            ...conversation,
            messages: [...conversation.messages, message],
            updatedAt: new Date().toISOString(),
          };
          
          return {
            conversations: {
              ...state.conversations,
              [conversationId]: updatedConversation,
            },
          };
        });
      },

      createConversation: (id, title) => {
        set((state) => {
          const newConversation: Conversation = {
            id,
            title: title || 'Nuova conversazione',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            conversations: {
              ...state.conversations,
              [id]: newConversation,
            },
            currentConversationId: id,
          };
        });
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = { ...state.conversations };
          delete newConversations[id];
          
          return {
            conversations: newConversations,
            currentConversationId: state.currentConversationId === id 
              ? null 
              : state.currentConversationId,
          };
        });
      },

      clearAllConversations: () => {
        set({
          conversations: {},
          currentConversationId: null,
          error: null,
        });
      },

      // UI Actions
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Rate limiting
      setRemainingRequests: (count) => {
        set({ 
          remainingRequests: count,
          lastRequestDate: new Date().toDateString(),
        });
      },

      resetDailyLimit: () => {
        const today = new Date().toDateString();
        const lastDate = get().lastRequestDate;
        
        if (lastDate !== today) {
          set({ 
            remainingRequests: undefined,
            lastRequestDate: today,
          });
        }
      },

      // Persistence helpers
      loadConversation: (id, conversationData) => {
        set((state) => {
          const conversation: Conversation = {
            id,
            title: conversationData.titolo || conversationData.title || 'Conversazione',
            messages: conversationData.messages?.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              timestamp: msg.createdAt || msg.timestamp,
            })) || [],
            createdAt: conversationData.createdAt,
            updatedAt: conversationData.updatedAt,
          };

          return {
            conversations: {
              ...state.conversations,
              [id]: conversation,
            },
          };
        });
      },

      updateConversationTitle: (id, title) => {
        set((state) => {
          const conversation = state.conversations[id];
          if (!conversation) return state;

          return {
            conversations: {
              ...state.conversations,
              [id]: {
                ...conversation,
                title,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      
      // Solo persistiamo alcuni dati, non UI state
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        remainingRequests: state.remainingRequests,
        lastRequestDate: state.lastRequestDate,
      }),
      
      // Versioning per future migrations
      version: 1,
      
      // Migrazione per versioni future
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration da versione 0 a 1
          return {
            ...persistedState,
            remainingRequests: undefined,
            lastRequestDate: null,
          };
        }
        return persistedState;
      },
      
      // Rehydration complete callback
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Errore durante il caricamento dello stato chat:', error);
          } else if (state) {
            // Reset daily limit se necessario
            state.resetDailyLimit();
          }
        };
      },
    }
  )
);

// Utility functions
function generateConversationTitle(firstMessage: string): string {
  const maxLength = 30;
  const cleanMessage = firstMessage.trim();
  
  if (cleanMessage.length <= maxLength) {
    return cleanMessage;
  }
  
  const truncated = cleanMessage.substring(0, maxLength).trim();
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 15 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

// Selectors per performance
export const useCurrentConversation = () => {
  return useChatStore((state) => {
    if (!state.currentConversationId) return null;
    return state.conversations[state.currentConversationId] || null;
  });
};

export const useConversationList = () => {
  return useChatStore((state) => {
    return Object.values(state.conversations)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });
};

export const useChatLoading = () => {
  return useChatStore((state) => state.isLoading);
};

export const useChatError = () => {
  return useChatStore((state) => state.error);
};

export const useRemainingRequests = () => {
  return useChatStore((state) => state.remainingRequests);
};

// Actions hooks
export const useChatActions = () => {
  return useChatStore((state) => ({
    addMessage: state.addMessage,
    createConversation: state.createConversation,
    setCurrentConversation: state.setCurrentConversation,
    deleteConversation: state.deleteConversation,
    clearAllConversations: state.clearAllConversations,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    setRemainingRequests: state.setRemainingRequests,
    updateConversationTitle: state.updateConversationTitle,
  }));
};

// Helper per debug
export const useChatDebug = () => {
  return useChatStore((state) => ({
    conversationsCount: Object.keys(state.conversations).length,
    currentId: state.currentConversationId,
    isLoading: state.isLoading,
    error: state.error,
    remainingRequests: state.remainingRequests,
  }));
};