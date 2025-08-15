"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { AssistantMessage, TeamContext } from '@/lib/openai/assistant-client';

export type ChatState = 
  | 'idle'
  | 'sending'
  | 'assistant-processing'
  | 'receiving'
  | 'error'
  | 'rate-limited';

interface UseAssistantChatReturn {
  messages: AssistantMessage[];
  state: ChatState;
  error: string | null;
  threadId: string | null;
  remainingRequests: number | undefined;
  sendMessage: (message: string) => Promise<void>;
  resetThread: () => Promise<void>;
  clearError: () => void;
  isTyping: boolean;
}

const THREAD_CACHE_KEY = (userId: string, teamId: string) => `kora_thread_${userId}_${teamId}`;

export function useAssistantChat(
  teamId: string,
  teamContext: TeamContext
): UseAssistantChatReturn {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [state, setState] = useState<ChatState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [remainingRequests, setRemainingRequests] = useState<number | undefined>(undefined);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);

  // Inizializza thread al mount
  useEffect(() => {
    if (!isInitializedRef.current && teamId && teamContext.userName) {
      initializeThread();
      isInitializedRef.current = true;
    }
  }, [teamId, teamContext.userName]);

  // Gestione typing indicator
  const handleTyping = useCallback(() => {
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, []);

  const initializeThread = useCallback(async () => {
    try {
      setState('idle');
      
      // Cerca thread in cache localStorage
      const cacheKey = THREAD_CACHE_KEY('current-user', teamId);
      const cachedThreadId = localStorage.getItem(cacheKey);
      
      if (cachedThreadId) {
        setThreadId(cachedThreadId);
        await loadMessages(cachedThreadId);
      }
      
    } catch (error) {
      console.error('Errore inizializzazione thread:', error);
      setError('Errore durante l\'inizializzazione della chat');
    }
  }, [teamId]);

  const loadMessages = useCallback(async (tId: string) => {
    try {
      const response = await fetch(`/api/ai/chat?threadId=${tId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Errore caricamento messaggi:', error);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state !== 'idle') return;

    const userMessage: AssistantMessage = {
      id: `temp-${Date.now()}`,
      content: message,
      role: 'user',
      timestamp: new Date(),
      threadId: threadId || 'temp',
    };

    try {
      setState('sending');
      setError(null);
      setMessages(prev => [...prev, userMessage]);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          teamId,
          teamContext,
          threadId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'invio del messaggio');
      }

      if (!data.success) {
        throw new Error(data.error || 'Risposta non riuscita');
      }

      // Aggiorna stato
      setState('assistant-processing');
      
      // Aggiorna threadId se nuovo
      if (data.threadId && data.threadId !== threadId) {
        setThreadId(data.threadId);
        
        // Salva in cache
        const cacheKey = THREAD_CACHE_KEY('current-user', teamId);
        localStorage.setItem(cacheKey, data.threadId);
      }

      // Aggiorna remaining requests
      if (data.remainingRequests !== undefined) {
        setRemainingRequests(data.remainingRequests);
      }

      // Polling per la risposta dell'assistant
      await pollForResponse(data.threadId, data.runId);

    } catch (error: any) {
      console.error('Errore invio messaggio:', error);
      
      // Rimuovi messaggio temporaneo
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      
      // Gestisci errori specifici
      if (error.message?.includes('RATE_LIMITED')) {
        setState('rate-limited');
        setError('Hai raggiunto il limite giornaliero di richieste. Riprova domani.');
      } else if (error.message?.includes('TIMEOUT')) {
        setState('error');
        setError('Risposta troppo lenta, riprova.');
      } else {
        setState('error');
        setError(error.message || 'Si è verificato un errore imprevisto');
      }
    }
  }, [teamId, teamContext, threadId, state]);

  const pollForResponse = useCallback(async (tId: string, runId: string) => {
    const maxAttempts = 60; // 30 secondi max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        setState('assistant-processing');
        
        const response = await fetch(`/api/ai/chat/status?threadId=${tId}&runId=${runId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Errore controllo status');
        }

        if (data.status === 'completed') {
          setState('receiving');
          
          // Recupera nuovo messaggio
          const messageResponse = await fetch(`/api/ai/chat?threadId=${tId}&latest=true`);
          const messageData = await messageResponse.json();
          
          if (messageResponse.ok && messageData.success && messageData.message) {
            setMessages(prev => [...prev, messageData.message]);
          }
          
          setState('idle');
          return;
        }

        if (data.status === 'failed' || data.status === 'cancelled') {
          throw new Error('L\'Assistant ha riscontrato un errore durante l\'elaborazione');
        }

        // Continua polling
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
        
      } catch (error: any) {
        setState('error');
        setError(error.message || 'Errore durante l\'attesa della risposta');
        return;
      }
    }

    // Timeout
    setState('error');
    setError('Timeout: l\'Assistant sta impiegando troppo tempo a rispondere');
  }, []);

  const resetThread = useCallback(async () => {
    try {
      setState('idle');
      setMessages([]);
      setError(null);
      
      // Rimuovi da cache
      const cacheKey = THREAD_CACHE_KEY('current-user', teamId);
      localStorage.removeItem(cacheKey);
      
      if (threadId) {
        // Chiama API per eliminare thread
        await fetch('/api/ai/chat', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamId,
            threadId,
          }),
        });
      }
      
      setThreadId(null);
      
    } catch (error) {
      console.error('Errore reset thread:', error);
      setError('Errore durante il reset della chat');
    }
  }, [teamId, threadId]);

  const clearError = useCallback(() => {
    setError(null);
    if (state === 'error' || state === 'rate-limited') {
      setState('idle');
    }
  }, [state]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    state,
    error,
    threadId,
    remainingRequests,
    sendMessage,
    resetThread,
    clearError,
    isTyping,
  };
}