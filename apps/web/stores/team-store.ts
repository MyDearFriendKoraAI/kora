'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Team } from '@/lib/supabase/team';

interface TeamStore {
  currentTeam: Team | null;
  teams: Team[];
  isLoading: boolean;
  
  // Actions
  setCurrentTeam: (team: Team | null) => void;
  setTeams: (teams: Team[]) => void;
  setLoading: (loading: boolean) => void;
  setUserTeams: (teams: Team[]) => void;
  
  // Helper getters
  canCreateTeam: () => boolean;
  teamLimit: () => { used: number; max: number; canCreate: boolean };
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      currentTeam: null,
      teams: [],
      isLoading: true, // Start with loading true

      setCurrentTeam: (team) => {
        set({ currentTeam: team });
      },

      setTeams: (teams) => {
        set({ teams, isLoading: false }); // Set loading to false when teams are set
        
        // Auto-select first team if no current team is set
        const { currentTeam } = get();
        if (!currentTeam && teams.length > 0) {
          set({ currentTeam: teams[0] });
        }
        
        // Clear current team if it's no longer in teams
        if (currentTeam && !teams.find(t => t.id === currentTeam.id)) {
          set({ currentTeam: teams.length > 0 ? teams[0] : null });
        }
      },

      setUserTeams: (teams: Team[]) => {
        get().setTeams(teams);
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      canCreateTeam: () => {
        const { teams } = get();
        return teams.length < 2;
      },

      teamLimit: () => {
        const { teams } = get();
        return {
          used: teams.length,
          max: 2,
          canCreate: teams.length < 2,
        };
      },
    }),
    {
      name: 'team-store',
      partialize: (state) => ({
        currentTeam: state.currentTeam,
      }),
    }
  )
);