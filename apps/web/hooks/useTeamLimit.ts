'use client';

import { useTeamStore } from '@/stores/team-store';

interface TeamLimitHook {
  limit: number;
  used: number;
  canCreate: boolean;
  remaining: number;
  isAtLimit: boolean;
  progressPercentage: number;
}

/**
 * Hook to manage team creation limits
 */
export function useTeamLimit(): TeamLimitHook {
  const { teams } = useTeamStore();

  const limit = 2;
  const used = teams.length;
  const canCreate = used < limit;
  const remaining = Math.max(0, limit - used);
  const isAtLimit = used >= limit;
  const progressPercentage = Math.min(100, (used / limit) * 100);

  return {
    limit,
    used,
    canCreate,
    remaining,
    isAtLimit,
    progressPercentage,
  };
}