'use client';

import { useEffect, useRef } from 'react';
import { useTeamStore } from '@/stores/team-store';
import { getUserTeamsAction } from '@/app/actions/team';

// Global promise to track in-flight requests
let fetchPromise: Promise<void> | null = null;

/**
 * Hook to load and sync user teams data with the store
 * Implements cache and deduplication to prevent multiple parallel requests
 */
export function useTeamData() {
  const { setUserTeams, setLoading, teams, isLoading, hasLoaded } = useTeamStore();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    async function loadTeams() {
      // Skip if already loaded or currently loading
      if (hasLoaded || fetchPromise) {
        return;
      }

      // Create a new fetch promise to prevent duplicate requests
      fetchPromise = (async () => {
        setLoading(true);
        
        try {
          const result = await getUserTeamsAction();
          
          if (isMountedRef.current) {
            if (result.success && result.teams) {
              setUserTeams(result.teams);
            } else {
              console.error('Failed to load teams:', result.error);
              setUserTeams([]);
            }
          }
        } catch (error) {
          if (isMountedRef.current) {
            console.error('Error loading teams:', error);
            setUserTeams([]);
          }
        } finally {
          if (isMountedRef.current) {
            setLoading(false);
          }
          fetchPromise = null;
        }
      })();

      await fetchPromise;
    }

    loadTeams();

    return () => {
      isMountedRef.current = false;
    };
  }, [hasLoaded, setUserTeams, setLoading]);

  return {
    userTeams: teams,
    isLoading,
    refetch: async () => {
      // Reset hasLoaded to force a new fetch
      useTeamStore.setState({ hasLoaded: false });
      fetchPromise = null;
      
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