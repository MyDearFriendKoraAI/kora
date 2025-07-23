import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dati considerati freschi per diversi periodi
      staleTime: 60 * 1000, // 1 minuto di default
      // Tempo di cache prima della garbage collection
      gcTime: 10 * 60 * 1000, // 10 minuti
      // Retry automatico con exponential backoff
      retry: (failureCount, error: any) => {
        // Non fare retry per errori 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Max 3 retry
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations solo per network errors
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

// Configurazioni specifiche per tipo di dato
export const QUERY_STALE_TIMES = {
  user: 5 * 60 * 1000, // 5 minuti
  teams: 2 * 60 * 1000, // 2 minuti
  players: 60 * 1000, // 1 minuto
  trainings: 30 * 1000, // 30 secondi
  static: 24 * 60 * 60 * 1000, // 24 ore per dati statici
} as const;

// Query keys factory per consistenza
export const queryKeys = {
  all: ['kora'] as const,
  user: () => [...queryKeys.all, 'user'] as const,
  teams: {
    all: () => [...queryKeys.all, 'teams'] as const,
    lists: () => [...queryKeys.teams.all(), 'list'] as const,
    list: (filters?: any) => [...queryKeys.teams.lists(), filters] as const,
    details: () => [...queryKeys.teams.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.teams.details(), id] as const,
    players: (teamId: string) => [...queryKeys.teams.detail(teamId), 'players'] as const,
    trainings: (teamId: string) => [...queryKeys.teams.detail(teamId), 'trainings'] as const,
  },
  players: {
    all: () => [...queryKeys.all, 'players'] as const,
    lists: () => [...queryKeys.players.all(), 'list'] as const,
    list: (teamId: string) => [...queryKeys.players.lists(), teamId] as const,
    detail: (id: string) => [...queryKeys.players.all(), 'detail', id] as const,
  },
  trainings: {
    all: () => [...queryKeys.all, 'trainings'] as const,
    lists: () => [...queryKeys.trainings.all(), 'list'] as const,
    list: (teamId?: string) => [...queryKeys.trainings.lists(), teamId] as const,
    detail: (id: string) => [...queryKeys.trainings.all(), 'detail', id] as const,
    attendance: (trainingId: string) => [...queryKeys.trainings.detail(trainingId), 'attendance'] as const,
  },
  ai: {
    all: () => [...queryKeys.all, 'ai'] as const,
    conversations: () => [...queryKeys.ai.all(), 'conversations'] as const,
    conversation: (id: string) => [...queryKeys.ai.conversations(), id] as const,
    messages: (conversationId: string) => [...queryKeys.ai.conversation(conversationId), 'messages'] as const,
  },
} as const;