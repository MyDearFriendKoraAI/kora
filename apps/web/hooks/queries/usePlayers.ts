'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys, QUERY_STALE_TIMES } from '@/lib/react-query/client';
import { toast } from 'sonner';

// Tipi per le API dei players
interface PlayerFilters {
  status?: 'active' | 'inactive' | 'all';
  search?: string;
  sortBy?: 'name' | 'number' | 'position' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  position?: string[];
}

interface CreatePlayerData {
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  dateOfBirth?: string;
  notes?: string;
}

// Hook per ottenere giocatori di una squadra con filtri
export function usePlayers(teamId: string, filters: PlayerFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.players.list(teamId), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.position?.length) {
        filters.position.forEach(pos => params.append('position', pos));
      }
      
      const response = await fetch(`/api/teams/${teamId}/players?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: QUERY_STALE_TIMES.players,
    enabled: !!teamId,
  });
}

// Hook per infinite query dei giocatori (per liste lunghe con pagination)
export function usePlayersInfinite(teamId: string, filters: PlayerFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.players.list(teamId), 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append('page', pageParam.toString());
      params.append('limit', '20');
      
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await fetch(`/api/teams/${teamId}/players?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.statusText}`);
      }
      
      return response.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: QUERY_STALE_TIMES.players,
    enabled: !!teamId,
  });
}

// Hook per singolo giocatore
export function usePlayer(teamId: string, playerId: string) {
  return useQuery({
    queryKey: queryKeys.players.detail(playerId),
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch player: ${response.statusText}`);
      }
      
      return response.json();
    },
    staleTime: QUERY_STALE_TIMES.players,
    enabled: !!teamId && !!playerId,
  });
}

// Hook per creare un giocatore
export function useCreatePlayer(teamId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePlayerData) => {
      const response = await fetch(`/api/teams/${teamId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create player');
      }
      
      return response.json();
    },
    onSuccess: (newPlayer) => {
      // Invalida queries dei giocatori per questo team
      queryClient.invalidateQueries({ queryKey: queryKeys.players.list(teamId) });
      
      // Aggiungi il nuovo giocatore alla cache se possibile
      queryClient.setQueryData(queryKeys.players.detail(newPlayer.id), newPlayer);
      
      toast.success('Giocatore aggiunto con successo!');
    },
    onError: (error: any) => {
      console.error('Create player error:', error);
      toast.error(error.message || 'Errore durante l\'aggiunta del giocatore');
    },
  });
}

// Hook per aggiornare un giocatore
export function useUpdatePlayer(teamId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ playerId, data }: { playerId: string; data: Partial<CreatePlayerData> }) => {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update player');
      }
      
      return response.json();
    },
    onSuccess: (updatedPlayer, variables) => {
      // Update cache del singolo giocatore
      queryClient.setQueryData(queryKeys.players.detail(variables.playerId), updatedPlayer);
      
      // Invalida lista giocatori
      queryClient.invalidateQueries({ queryKey: queryKeys.players.list(teamId) });
      
      toast.success('Giocatore aggiornato con successo!');
    },
    onError: (error: any) => {
      console.error('Update player error:', error);
      toast.error(error.message || 'Errore durante l\'aggiornamento del giocatore');
    },
  });
}

// Hook per eliminare un giocatore
export function useDeletePlayer(teamId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (playerId: string) => {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete player');
      }
      
      return { playerId };
    },
    onSuccess: (result) => {
      // Rimuovi dalla cache
      queryClient.removeQueries({ queryKey: queryKeys.players.detail(result.playerId) });
      
      // Invalida lista giocatori
      queryClient.invalidateQueries({ queryKey: queryKeys.players.list(teamId) });
      
      toast.success('Giocatore eliminato con successo!');
    },
    onError: (error: any) => {
      console.error('Delete player error:', error);
      toast.error(error.message || 'Errore durante l\'eliminazione del giocatore');
    },
  });
}

// Hook per operazioni bulk sui giocatori
export function useBulkPlayerOperations(teamId: string) {
  const queryClient = useQueryClient();
  
  const bulkUpdate = useMutation({
    mutationFn: async (data: { playerIds: string[]; updates: Partial<CreatePlayerData> }) => {
      const response = await fetch(`/api/teams/${teamId}/players/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk update players');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players.list(teamId) });
      toast.success('Giocatori aggiornati con successo!');
    },
  });
  
  const bulkDelete = useMutation({
    mutationFn: async (playerIds: string[]) => {
      const response = await fetch(`/api/teams/${teamId}/players/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk delete players');
      }
      
      return { playerIds };
    },
    onSuccess: (result) => {
      // Rimuovi dalla cache tutti i giocatori eliminati
      result.playerIds.forEach(playerId => {
        queryClient.removeQueries({ queryKey: queryKeys.players.detail(playerId) });
      });
      
      queryClient.invalidateQueries({ queryKey: queryKeys.players.list(teamId) });
      toast.success('Giocatori eliminati con successo!');
    },
  });
  
  return {
    bulkUpdate: bulkUpdate.mutate,
    bulkDelete: bulkDelete.mutate,
    isBulkUpdating: bulkUpdate.isPending,
    isBulkDeleting: bulkDelete.isPending,
  };
}

// Hook per importare/esportare giocatori
export function usePlayerImportExport(teamId: string) {
  const queryClient = useQueryClient();
  
  const importPlayers = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/teams/${teamId}/players/import`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import players');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players.list(teamId) });
      toast.success(`${result.imported} giocatori importati con successo!`);
    },
  });
  
  const exportPlayers = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to export players');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `players-${teamId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Giocatori esportati con successo!');
    } catch (error: any) {
      toast.error(error.message || 'Errore durante l\'esportazione');
    }
  };
  
  return {
    importPlayers: importPlayers.mutate,
    exportPlayers,
    isImporting: importPlayers.isPending,
  };
}

// Hook combinato per tutte le operazioni player
export function usePlayerOperations(teamId: string, filters: PlayerFilters = {}) {
  const players = usePlayers(teamId, filters);
  const createPlayer = useCreatePlayer(teamId);
  const updatePlayer = useUpdatePlayer(teamId);
  const deletePlayer = useDeletePlayer(teamId);
  const bulkOps = useBulkPlayerOperations(teamId);
  const importExport = usePlayerImportExport(teamId);
  
  return {
    // Data
    players: players.data || [],
    isLoading: players.isLoading,
    error: players.error,
    
    // CRUD Operations
    createPlayer: createPlayer.mutate,
    updatePlayer: updatePlayer.mutate,
    deletePlayer: deletePlayer.mutate,
    
    // Bulk Operations
    ...bulkOps,
    
    // Import/Export
    ...importExport,
    
    // States
    isCreating: createPlayer.isPending,
    isUpdating: updatePlayer.isPending,
    isDeleting: deletePlayer.isPending,
    
    // Helpers
    refetch: players.refetch,
  };
}