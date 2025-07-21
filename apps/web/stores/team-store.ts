'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Team } from '@/lib/supabase/team';

interface TeamStore {
  currentTeam: Team | null;
  userTeams: Team[];
  isLoading: boolean;
  
  // Actions
  setCurrentTeam: (team: Team | null) => void;
  setUserTeams: (teams: Team[]) => void;
  setLoading: (loading: boolean) => void;
  
  // Helper getters
  canCreateTeam: () => boolean;
  teamLimit: () => { used: number; max: number; canCreate: boolean };
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      currentTeam: null,
      userTeams: [],
      isLoading: false,

      setCurrentTeam: (team) => {
        set({ currentTeam: team });
      },

      setUserTeams: (teams) => {
        set({ userTeams: teams });
        
        // Auto-select first team if no current team is set
        const { currentTeam } = get();
        if (!currentTeam && teams.length > 0) {
          set({ currentTeam: teams[0] });
        }
        
        // Clear current team if it's no longer in user teams
        if (currentTeam && !teams.find(t => t.id === currentTeam.id)) {
          set({ currentTeam: teams.length > 0 ? teams[0] : null });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      canCreateTeam: () => {
        const { userTeams } = get();
        return userTeams.length < 2;
      },

      teamLimit: () => {
        const { userTeams } = get();
        return {
          used: userTeams.length,
          max: 2,
          canCreate: userTeams.length < 2,
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