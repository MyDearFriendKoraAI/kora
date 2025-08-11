'use client';

import { useTeams } from '@/hooks/queries/useTeams';
import { usePendingInvites } from '@/hooks/queries/useTeamInvites';

export function useUserAccess() {
  const { teams, isLoading: teamsLoading } = useTeams();
  const { data: invites = [], isLoading: invitesLoading } = usePendingInvites();
  
  const isLoading = teamsLoading || invitesLoading;
  const hasTeams = teams && teams.length > 0;
  const hasInvites = invites && invites.length > 0;
  const hasAccess = hasTeams || hasInvites;
  
  // Determina quali route sono accessibili
  const canAccessTeams = true; // Sempre accessibile per vedere inviti o creare squadre
  const canAccessPlayers = hasTeams; // Solo se ha squadre
  const canAccessTrainings = hasTeams; // Solo se ha squadre
  const canAccessAICoach = hasTeams; // Solo se ha squadre
  
  return {
    isLoading,
    hasTeams,
    hasInvites,
    hasAccess,
    canAccessTeams,
    canAccessPlayers,
    canAccessTrainings,
    canAccessAICoach,
    teamsCount: teams?.length || 0,
    invitesCount: invites?.length || 0,
  };
}