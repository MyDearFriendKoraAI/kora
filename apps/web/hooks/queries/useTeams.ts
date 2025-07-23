'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, QUERY_STALE_TIMES } from '@/lib/react-query/client';
import { 
  getUserTeamsAction, 
  createTeamAction, 
  updateTeamAction, 
  deleteTeamAction,
  getUserTeamCountAction 
} from '@/app/actions/team';
import { toast } from 'sonner';

// Hook per ottenere tutte le squadre dell'utente
export function useTeams() {
  const query = useQuery({
    queryKey: queryKeys.teams.lists(),
    queryFn: async () => {
      const result = await getUserTeamsAction();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch teams');
      }
      
      return result.teams || [];
    },
    staleTime: QUERY_STALE_TIMES.teams,
    retry: (failureCount, error: any) => {
      // Retry solo per errori di rete, non per errori di autenticazione
      if (error.message?.includes('Unauthorized') || error.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    ...query,
    teams: query.data || [],
  };
}

// Hook per contare le squadre (per controllo limiti)
export function useTeamCount() {
  return useQuery({
    queryKey: [...queryKeys.teams.all(), 'count'],
    queryFn: async () => {
      const result = await getUserTeamCountAction();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch team count');
      }
      
      return result.count || 0;
    },
    staleTime: QUERY_STALE_TIMES.teams,
  });
}

// Hook per creare una nuova squadra
export function useCreateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTeamAction,
    onSuccess: (result) => {
      if (result?.success) {
        // Invalida e refetch teams list
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teams.all(), 'count'] });
        
        toast.success('Squadra creata con successo!');
        
        // Prefetch dei dettagli della nuova squadra se abbiamo l'ID
        if (result.teamId) {
          queryClient.prefetchQuery({
            queryKey: queryKeys.teams.detail(result.teamId),
            staleTime: QUERY_STALE_TIMES.teams,
          });
        }
      } else {
        toast.error(result?.error || 'Errore durante la creazione della squadra');
        throw new Error(result?.error || 'Failed to create team');
      }
    },
    onError: (error: any) => {
      console.error('Create team error:', error);
      toast.error(error.message || 'Errore durante la creazione della squadra');
    },
  });
}

// Hook per aggiornare una squadra  
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) => updateTeamAction(teamId, data),
    onSuccess: (result, variables) => {
      if (result?.success) {
        // Invalida queries correlate
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
        
        if (variables.teamId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(variables.teamId) });
        }
        
        toast.success('Squadra aggiornata con successo!');
      } else {
        toast.error(result?.error || 'Errore durante l\'aggiornamento della squadra');
        throw new Error(result?.error || 'Failed to update team');
      }
    },
    onError: (error: any) => {
      console.error('Update team error:', error);
      toast.error(error.message || 'Errore durante l\'aggiornamento della squadra');
    },
  });
}

// Hook per eliminare una squadra
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) => deleteTeamAction(teamId, data),
    onSuccess: (result, variables) => {
      if (result?.success) {
        // Rimuovi dai cache tutte le queries correlate al team
        queryClient.removeQueries({ queryKey: queryKeys.teams.detail(variables.teamId) });
        queryClient.removeQueries({ queryKey: queryKeys.teams.players(variables.teamId) });
        queryClient.removeQueries({ queryKey: queryKeys.teams.trainings(variables.teamId) });
        
        // Invalida lists
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
        queryClient.invalidateQueries({ queryKey: [...queryKeys.teams.all(), 'count'] });
        
        toast.success('Squadra eliminata con successo!');
      } else {
        toast.error(result?.error || 'Errore durante l\'eliminazione della squadra');
        throw new Error(result?.error || 'Failed to delete team');
      }
    },
    onError: (error: any) => {
      console.error('Delete team error:', error);
      toast.error(error.message || 'Errore durante l\'eliminazione della squadra');
    },
  });
}

// Hook per ottimistic updates - utile per azioni frequenti come cambio colori
export function useTeamOptimisticUpdate(teamId: string) {
  const queryClient = useQueryClient();
  
  const updateTeamOptimistic = (updater: (oldData: any) => any) => {
    // Update immediato nella cache
    queryClient.setQueryData(queryKeys.teams.detail(teamId), updater);
    
    // Update anche nella lista
    queryClient.setQueryData(queryKeys.teams.lists(), (oldData: any) => {
      if (!oldData) return oldData;
      
      return oldData.map((team: any) => 
        team.id === teamId ? updater(team) : team
      );
    });
  };
  
  return { updateTeamOptimistic };
}

// Hook combinato per tutte le operazioni team
export function useTeamOperations() {
  const teams = useTeams();
  const teamCount = useTeamCount();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  
  return {
    // Queries
    teams: teams.data || [],
    isLoading: teams.isLoading || teamCount.isLoading,
    error: teams.error || teamCount.error,
    teamCount: teamCount.data || 0,
    
    // Mutations
    createTeam: createTeam.mutate,
    updateTeam: updateTeam.mutate,
    deleteTeam: deleteTeam.mutate,
    
    // States
    isCreating: createTeam.isPending,
    isUpdating: updateTeam.isPending,
    isDeleting: deleteTeam.isPending,
    
    // Helpers
    canCreateTeam: (teamCount.data || 0) < 2,
    refetch: teams.refetch,
  };
}