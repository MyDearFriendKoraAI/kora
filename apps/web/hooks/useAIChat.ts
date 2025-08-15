"use client";

import { useState, useCallback, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/components/features/ai-chat/AIChat';

interface UseAIChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  remainingRequests: number | undefined;
  conversationId: string | null;
  sendMessage: (message: string, promptType?: string) => Promise<void>;
  clearError: () => void;
  clearChat: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
}

export function useAIChat(teamId: string): UseAIChatReturn {
  const {
    conversations,
    currentConversationId,
    isLoading,
    error,
    remainingRequests,
    addMessage,
    setLoading,
    setError,
    clearError,
    setRemainingRequests,
    setCurrentConversation,
    loadConversation: storeLoadConversation,
  } = useChatStore();

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // Ottieni la conversazione corrente
  const currentConversation = currentConversationId 
    ? conversations[currentConversationId] 
    : null;

  // Sincronizza messaggi locali con store
  useEffect(() => {
    if (currentConversation) {
      const messages: Message[] = currentConversation.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.timestamp),
      }));
      setLocalMessages(messages);
    } else {
      setLocalMessages([]);
    }
  }, [currentConversation]);

  const sendMessage = useCallback(async (
    message: string, 
    promptType: string = 'trainingPlan'
  ) => {
    if (!message.trim() || isLoading) return;

    // Dichiara userMessage fuori dal try per essere accessibile nel catch
    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    try {
      setLoading(true);
      clearError();

      // Aggiungi messaggio utente immediatamente per UX
      setLocalMessages(prev => [...prev, userMessage]);

      // Chiamata API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          teamId,
          conversationId: currentConversationId,
          promptType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'invio del messaggio');
      }

      if (!data.success) {
        throw new Error(data.error || 'Risposta non riuscita');
      }

      // Aggiorna remaining requests
      if (data.remainingRequests !== undefined) {
        setRemainingRequests(data.remainingRequests);
      }

      // Aggiorna conversation ID se nuovo
      if (data.conversationId && data.conversationId !== currentConversationId) {
        setCurrentConversation(data.conversationId);
      }

      // Aggiungi risposta AI
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        metadata: data.metadata,
      };

      setLocalMessages(prev => [...prev, aiMessage]);

      // Salva nello store per persistenza
      addMessage(currentConversationId || data.conversationId, {
        id: userMessage.id,
        content: message,
        role: 'user',
        timestamp: new Date().toISOString(),
      });

      addMessage(currentConversationId || data.conversationId, {
        id: aiMessage.id,
        content: data.message,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error('Errore invio messaggio:', error);
      
      // Gestisci errori specifici
      let errorMessage = error.message || 'Si è verificato un errore imprevisto';
      
      if (error.message?.includes('RATE_LIMITED')) {
        errorMessage = 'Hai raggiunto il limite giornaliero di richieste. Riprova domani.';
      } else if (error.message?.includes('CONTEXT_TOO_LONG')) {
        errorMessage = 'La conversazione è diventata troppo lunga. Inizia una nuova chat.';
      } else if (error.message?.includes('FORBIDDEN')) {
        errorMessage = 'Non hai i permessi per accedere a questa squadra.';
      } else if (error.message?.includes('SERVICE_UNAVAILABLE')) {
        errorMessage = 'Il servizio AI è temporaneamente non disponibile.';
      }
      
      setError(errorMessage);
      
      // Rimuovi il messaggio utente in caso di errore
      setLocalMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
    } finally {
      setLoading(false);
    }
  }, [
    teamId,
    currentConversationId,
    isLoading,
    setLoading,
    clearError,
    setError,
    setRemainingRequests,
    setCurrentConversation,
    addMessage,
  ]);

  const clearChat = useCallback(() => {
    setLocalMessages([]);
    setCurrentConversation(null);
    clearError();
  }, [setCurrentConversation, clearError]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch(`/api/ai/chat?conversationId=${conversationId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il caricamento della conversazione');
      }

      if (data.conversation) {
        storeLoadConversation(conversationId, data.conversation);
        setCurrentConversation(conversationId);
      }

    } catch (error: any) {
      console.error('Errore caricamento conversazione:', error);
      setError(error.message || 'Errore durante il caricamento della conversazione');
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError, storeLoadConversation, setCurrentConversation]);

  return {
    messages: localMessages,
    isLoading,
    error,
    remainingRequests,
    conversationId: currentConversationId,
    sendMessage,
    clearError,
    clearChat,
    loadConversation,
  };
}

// Hook per caricare lista conversazioni
export function useConversationList() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async (limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/chat?limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il caricamento delle conversazioni');
      }

      setConversations(data.conversations || []);

    } catch (error: any) {
      console.error('Errore caricamento conversazioni:', error);
      setError(error.message || 'Errore durante il caricamento delle conversazioni');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch: loadConversations,
  };
}

// Hook per gestire rate limiting
export function useRateLimit() {
  const { remainingRequests } = useChatStore();
  
  const canSendMessage = remainingRequests === undefined || remainingRequests > 0;
  const isNearLimit = remainingRequests !== undefined && remainingRequests <= 2;
  
  return {
    remainingRequests,
    canSendMessage,
    isNearLimit,
  };
}