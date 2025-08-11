'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveTeam, setActiveTeam, getAvailableTeams } from '@/lib/actions/active-team';
import { toast } from 'sonner';

// Query keys
export const activeTeamKeys = {
  all: () => ['activeTeam'] as const,
  active: () => [...activeTeamKeys.all(), 'current'] as const,
  available: () => [...activeTeamKeys.all(), 'available'] as const,
};

// Hook per ottenere la squadra attiva
export function useActiveTeam() {
  return useQuery({
    queryKey: activeTeamKeys.active(),
    queryFn: async () => {
      const result = await getActiveTeam();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minuti
    retry: (failureCount, error: any) => {
      if (error.message?.includes('Non autorizzato')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook per ottenere le squadre disponibili
export function useAvailableTeams() {
  return useQuery({
    queryKey: activeTeamKeys.available(),
    queryFn: async () => {
      const result = await getAvailableTeams();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minuti
  });
}

// Hook per cambiare squadra attiva
export function useSetActiveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setActiveTeam,
    onMutate: async (variables) => {
      // Ottieni le squadre disponibili per l'update ottimistico
      const availableTeams = queryClient.getQueryData(activeTeamKeys.available()) as any[];
      const newActiveTeam = availableTeams?.find(team => team.id === variables.teamId);
      
      if (newActiveTeam) {
        // Update ottimistico - imposta immediatamente la nuova squadra
        queryClient.setQueryData(activeTeamKeys.active(), newActiveTeam);
      }

      return { newActiveTeam };
    },
    onSuccess: (result, variables) => {
      if (result?.success) {
        // Invalida le query per assicurare sincronizzazione
        queryClient.invalidateQueries({ queryKey: activeTeamKeys.active() });
        
        // Invalida anche altre query che dipendono dalla squadra attiva
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        queryClient.invalidateQueries({ queryKey: ['trainings'] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
        
        toast.success(result.message || 'Squadra cambiata con successo');
      } else {
        toast.error(result?.error || 'Errore durante il cambio squadra');
      }
    },
    onError: (error: any, variables, context) => {
      // Rollback in caso di errore
      if (context?.newActiveTeam) {
        queryClient.setQueryData(activeTeamKeys.active(), context.newActiveTeam);
      }
      
      console.error('Errore cambio squadra:', error);
      toast.error('Si è verificato un errore');
    },
  });
}

// Hook combinato per tutte le operazioni squadra attiva
export function useActiveTeamOperations() {
  const activeTeam = useActiveTeam();
  const availableTeams = useAvailableTeams();
  const setActiveTeamMutation = useSetActiveTeam();

  const hasMultipleTeams = (availableTeams.data?.length || 0) > 1;
  const hasTeams = (availableTeams.data?.length || 0) > 0;

  return {
    // Queries
    activeTeam: activeTeam.data,
    availableTeams: availableTeams.data || [],
    isLoading: activeTeam.isLoading || availableTeams.isLoading,
    error: activeTeam.error || availableTeams.error,
    
    // Mutations
    setActiveTeam: setActiveTeamMutation.mutate,
    isSettingActiveTeam: setActiveTeamMutation.isPending,
    
    // Helpers
    hasTeams,
    hasMultipleTeams,
    canSwitchTeams: hasMultipleTeams && !setActiveTeamMutation.isPending,
    
    // Refetch functions
    refetchActiveTeam: activeTeam.refetch,
    refetchAvailableTeams: availableTeams.refetch,
  };
}