'use client';

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, QUERY_STALE_TIMES } from '@/lib/react-query/client';
import { getUserTeamsAction } from '@/app/actions/team';

// Hook per prefetching intelligente
export function usePrefetch() {
  const queryClient = useQueryClient();
  
  // Prefetch teams quando probabile che l'utente li voglia vedere
  const prefetchTeams = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.teams.lists(),
      queryFn: async () => {
        const result = await getUserTeamsAction();
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch teams');
        }
        return result.teams || [];
      },
      staleTime: QUERY_STALE_TIMES.teams,
    });
  };
  
  // Prefetch giocatori di un team (es. quando hover su team card)
  const prefetchTeamPlayers = (teamId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.players.list(teamId),
      queryFn: async () => {
        const response = await fetch(`/api/teams/${teamId}/players`);
        if (!response.ok) {
          throw new Error('Failed to prefetch players');
        }
        return response.json();
      },
      staleTime: QUERY_STALE_TIMES.players,
    });
  };
  
  // Prefetch training details quando probabile apertura modal
  const prefetchTrainingDetails = (teamId: string, trainingId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.trainings.detail(trainingId),
      queryFn: async () => {
        const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}`);
        if (!response.ok) {
          throw new Error('Failed to prefetch training');
        }
        return response.json();
      },
      staleTime: QUERY_STALE_TIMES.trainings,
    });
  };
  
  // Prefetch attendance quando si sta per aprire modal presenza
  const prefetchAttendance = (teamId: string, trainingId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.trainings.attendance(trainingId),
      queryFn: async () => {
        const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}/attendance`);
        if (!response.ok) {
          throw new Error('Failed to prefetch attendance');
        }
        return response.json();
      },
      staleTime: 30 * 1000, // Dati freschi per attendance
    });
  };
  
  // Prefetch dati dashboard quando si naviga verso dashboard
  const prefetchDashboardData = (teamId?: string) => {
    // Prefetch upcoming trainings
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.trainings.lists(), 'upcoming', teamId, 5],
      queryFn: async () => {
        const params = new URLSearchParams();
        params.append('status', 'upcoming');
        params.append('limit', '5');
        params.append('sortBy', 'date');
        params.append('sortOrder', 'asc');
        
        const url = teamId 
          ? `/api/teams/${teamId}/trainings?${params}`
          : `/api/trainings?${params}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to prefetch upcoming trainings');
        }
        return response.json();
      },
      staleTime: QUERY_STALE_TIMES.trainings,
    });
    
    // Prefetch team stats se abbiamo un teamId
    if (teamId) {
      queryClient.prefetchQuery({
        queryKey: [...queryKeys.trainings.list(teamId), 'stats', '30'],
        queryFn: async () => {
          const response = await fetch(`/api/teams/${teamId}/trainings/stats?period=30`);
          if (!response.ok) {
            throw new Error('Failed to prefetch training stats');
          }
          return response.json();
        },
        staleTime: QUERY_STALE_TIMES.trainings,
      });
    }
  };
  
  // Prefetch next probable page (es. quando si sta navigando tra teams)
  const prefetchNextTeam = (teams: any[], currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < teams.length) {
      const nextTeam = teams[nextIndex];
      prefetchTeamPlayers(nextTeam.id);
    }
  };
  
  // Warm up cache con dati essenziali
  const warmUpCache = () => {
    // Prefetch teams sempre
    prefetchTeams();
    
    // Prefetch dashboard data generali
    prefetchDashboardData();
  };
  
  return {
    prefetchTeams,
    prefetchTeamPlayers,
    prefetchTrainingDetails,
    prefetchAttendance,
    prefetchDashboardData,
    prefetchNextTeam,
    warmUpCache,
  };
}

// Hook per hover prefetching
export function useHoverPrefetch() {
  const { prefetchTeamPlayers, prefetchTrainingDetails, prefetchAttendance } = usePrefetch();
  
  // Debounced hover handler per evitare troppe chiamate
  const createHoverHandler = (prefetchFn: () => void, delay = 300) => {
    let timeoutId: NodeJS.Timeout;
    
    return {
      onMouseEnter: () => {
        timeoutId = setTimeout(prefetchFn, delay);
      },
      onMouseLeave: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      },
    };
  };
  
  return {
    // Handler per hover su team card
    teamCardHover: (teamId: string) => createHoverHandler(() => prefetchTeamPlayers(teamId)),
    
    // Handler per hover su training card
    trainingCardHover: (teamId: string, trainingId: string) => 
      createHoverHandler(() => prefetchTrainingDetails(teamId, trainingId)),
    
    // Handler per hover su attendance button
    attendanceButtonHover: (teamId: string, trainingId: string) =>
      createHoverHandler(() => prefetchAttendance(teamId, trainingId), 200), // Più veloce per azioni
  };
}

// Hook per gestione cache intelligente
export function useCacheManager() {
  const queryClient = useQueryClient();
  
  // Invalida cache stale dopo mutazioni importanti
  const invalidateStaleData = () => {
    // Invalida dati più vecchi di 5 minuti
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.state.dataUpdatedAt < Date.now() - 5 * 60 * 1000;
      },
    });
  };
  
  // Clear cache non essenziale per liberare memoria
  const clearNonEssentialCache = () => {
    // Rimuovi cache di dettagli non attivi da più di 10 minuti
    queryClient.removeQueries({
      predicate: (query) => {
        const isDetailQuery = query.queryKey.includes('detail');
        const isOld = query.state.dataUpdatedAt < Date.now() - 10 * 60 * 1000;
        return isDetailQuery && isOld;
      },
    });
  };
  
  // Refresh critical data
  const refreshCriticalData = () => {
    // Refresh team data
    queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
    
    // Refresh upcoming trainings
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.trainings.lists(),
      predicate: (query) => query.queryKey.includes('upcoming'),
    });
  };
  
  // Ottimizzazione memoria
  const optimizeMemory = () => {
    // Garbage collect old queries
    queryClient.getQueryCache().clear();
    
    // Re-warm essential data
    const { warmUpCache } = usePrefetch();
    warmUpCache();
  };
  
  return {
    invalidateStaleData,
    clearNonEssentialCache,
    refreshCriticalData,
    optimizeMemory,
  };
}

// Hook per gestire background sync
export function useBackgroundSync() {
  const queryClient = useQueryClient();
  
  // Sync quando l'app torna in focus
  const onFocus = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        // Solo queries che dovrebbero essere sempre fresh
        return query.queryKey.includes('upcoming') || 
               query.queryKey.includes('attendance') ||
               query.queryKey.includes('stats');
      },
    });
  };
  
  // Sync quando torna la connessione
  const onOnline = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.state.fetchStatus === 'idle',
    });
  };
  
  // Setup event listeners
  const setupBackgroundSync = () => {
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  };
  
  return {
    setupBackgroundSync,
    onFocus,
    onOnline,
  };
}