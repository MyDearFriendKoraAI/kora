'use client';

import { useEffect } from 'react';
import { useTeamStore } from '@/stores/team-store';
import { getUserTeamsAction } from '@/app/actions/team';

/**
 * Hook to load and sync user teams data with the store
 */
export function useTeamData() {
  const { setUserTeams, setLoading, userTeams, isLoading } = useTeamStore();

  useEffect(() => {
    async function loadTeams() {
      setLoading(true);
      
      try {
        const result = await getUserTeamsAction();
        
        if (result.success && result.teams) {
          setUserTeams(result.teams);
        } else {
          console.error('Failed to load teams:', result.error);
          setUserTeams([]);
        }
      } catch (error) {
        console.error('Error loading teams:', error);
        setUserTeams([]);
      } finally {
        setLoading(false);
      }
    }

    // Only load if we don't have teams yet
    if (userTeams.length === 0 && !isLoading) {
      loadTeams();
    }
  }, [setUserTeams, setLoading, userTeams.length, isLoading]);

  return {
    userTeams,
    isLoading,
    refetch: async () => {
      setLoading(true);
      try {
        const result = await getUserTeamsAction();
        if (result.success && result.teams) {
          setUserTeams(result.teams);
        }
      } finally {
        setLoading(false);
      }
    },
  };
}