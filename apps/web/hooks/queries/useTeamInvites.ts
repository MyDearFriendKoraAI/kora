import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserPendingInvites, 
  handleTeamInvite, 
  getTeamSentInvites,
  createTeamInvite,
  cancelTeamInvite 
} from '@/lib/actions/team-invites';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Query keys
export const inviteKeys = {
  all: () => ['invites'] as const,
  pending: () => [...inviteKeys.all(), 'pending'] as const,
  sent: (teamId: string) => [...inviteKeys.all(), 'sent', teamId] as const,
};

// Hook per ottenere inviti pendenti dell'utente
export function usePendingInvites() {
  return useQuery({
    queryKey: inviteKeys.pending(),
    queryFn: async () => {
      const result = await getUserPendingInvites();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
  });
}

// Hook per accettare/rifiutare invito
export function useHandleInvite() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: handleTeamInvite,
    onSuccess: (result, variables) => {
      if (result?.success) {
        // Aggiorna immediatamente la cache rimuovendo l'invito gestito
        queryClient.setQueryData(inviteKeys.pending(), (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((invite: any) => invite.id !== variables.inviteId);
        });

        // Invalida le query correlate
        queryClient.invalidateQueries({ queryKey: inviteKeys.pending() });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        
        toast.success(result.message);
        
        // Se accettato, naviga alla squadra
        if (variables.action === 'accept' && result.teamId) {
          router.push(`/teams/${result.teamId}`);
        }
      } else {
        toast.error(result?.error || 'Errore durante la gestione dell\'invito');
      }
    },
    onError: (error) => {
      console.error('Errore gestione invito:', error);
      toast.error('Si è verificato un errore');
    },
  });
}

// Hook per ottenere inviti inviati da una squadra
export function useTeamSentInvites(teamId: string) {
  return useQuery({
    queryKey: inviteKeys.sent(teamId),
    queryFn: async () => {
      const result = await getTeamSentInvites(teamId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    enabled: !!teamId,
  });
}

// Hook per creare un invito
export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeamInvite,
    onSuccess: (result, variables) => {
      if (result?.success) {
        // Invalida la lista degli inviti inviati
        queryClient.invalidateQueries({ 
          queryKey: inviteKeys.sent(variables.teamId) 
        });
        
        toast.success(result.message);
      } else {
        toast.error(result?.error || 'Errore durante la creazione dell\'invito');
      }
    },
    onError: (error) => {
      console.error('Errore creazione invito:', error);
      toast.error('Si è verificato un errore');
    },
  });
}

// Hook per cancellare un invito
export function useCancelInvite(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelTeamInvite,
    onSuccess: (result, variables) => {
      if (result?.success) {
        // Aggiorna immediatamente la cache
        queryClient.setQueryData(inviteKeys.sent(teamId), (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((invite: any) => invite.id !== variables);
        });

        // Invalida per refresh futuro
        queryClient.invalidateQueries({ 
          queryKey: inviteKeys.sent(teamId) 
        });
        
        toast.success(result.message);
      } else {
        toast.error(result?.error || 'Errore durante la cancellazione dell\'invito');
      }
    },
    onError: (error) => {
      console.error('Errore cancellazione invito:', error);
      toast.error('Si è verificato un errore');
    },
  });
}