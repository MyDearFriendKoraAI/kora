'use client';

import { useActiveTeamOperations } from '@/hooks/queries/useActiveTeam';
import { usePendingInvites } from '@/hooks/queries/useTeamInvites';

export function useUserAccess() {
  const { activeTeam, hasTeams, isLoading: teamsLoading } = useActiveTeamOperations();
  const { data: invites = [], isLoading: invitesLoading } = usePendingInvites();
  
  const isLoading = teamsLoading || invitesLoading;
  const hasInvites = invites && invites.length > 0;
  const hasAccess = hasTeams || hasInvites;
  
  // Determina quali route sono accessibili
  const canAccessTeams = true; // Sempre accessibile per vedere inviti o creare squadre
  const canAccessPlayers = !!activeTeam; // Solo se ha una squadra attiva
  const canAccessTrainings = !!activeTeam; // Solo se ha una squadra attiva
  const canAccessAICoach = !!activeTeam; // Solo se ha una squadra attiva
  
  return {
    isLoading,
    hasTeams,
    hasInvites,
    hasAccess,
    activeTeam,
    canAccessTeams,
    canAccessPlayers,
    canAccessTrainings,
    canAccessAICoach,
    invitesCount: invites?.length || 0,
  };
}