'use client';

import { useEffect, useState } from 'react';
import { getUserTeamRoleAction } from '@/app/actions/team-assistant';

interface UseTeamRoleReturn {
  role: 'owner' | 'assistant' | null;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
}

export function useTeamRole(teamId: string): UseTeamRoleReturn {
  const [role, setRole] = useState<'owner' | 'assistant' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await getUserTeamRoleAction(teamId);
        
        if (result.success) {
          setRole(result.role);
          setUserId(result.userId || null);
        } else {
          setError(result.error || 'Errore durante il recupero del ruolo');
          setRole(null);
        }
      } catch (err: any) {
        setError(err.message || 'Errore durante il recupero del ruolo');
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();
  }, [teamId]);

  return {
    role,
    isLoading,
    error,
    userId,
  };
}

// Hook to check specific permissions
export function useTeamPermissions(teamId: string) {
  const { role, isLoading, error, userId } = useTeamRole(teamId);

  const permissions = {
    canViewTeam: role !== null,
    canEditTeam: role === 'owner',
    canInviteAssistants: role === 'owner',
    canRemoveAssistants: role === 'owner',
    canEditSettings: role === 'owner',
    canViewPlayers: role !== null,
    canEditPlayers: role === 'owner',
    canViewTrainings: role !== null,
    canEditTrainings: role === 'owner',
    canViewStats: role !== null,
  };

  return {
    ...permissions,
    role,
    isLoading,
    error,
    userId,
  };
}