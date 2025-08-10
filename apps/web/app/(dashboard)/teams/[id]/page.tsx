import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTeamById, getTeamStats } from '@/lib/supabase/team';
import { TeamDashboard } from '@/components/features/team/TeamDashboard';
import { cn } from '@kora/shared/utils';

interface TeamPageProps {
  params: {
    id: string;
  };
}

async function TeamContent({ teamId }: { teamId: string }) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const team = await getTeamById(teamId, user.id);
  
  if (!team) {
    notFound();
  }

  const stats = await getTeamStats(teamId, user.id);

  // Mock data - in produzione da API reali
  const dashboardData = {
    team,
    stats,
    userRole: 'owner' as 'owner' | 'assistant', // Mock - da determinare dall'API
    upcomingEvent: {
      id: '1',
      type: 'training' as 'training' | 'match',
      title: 'Allenamento Tattico',
      date: new Date(Date.now() + 86400000), // Domani
      location: 'Campo Comunale',
      opponent: null,
      status: 'scheduled'
    },
    attendanceChart: {
      last30Days: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000),
        attendance: Math.floor(Math.random() * 40) + 60
      }))
    },
    playersNeedingAttention: [
      {
        id: '1',
        name: 'Marco Rossi',
        issue: 'absent' as const,
        days: 3,
        avatar: null
      },
      {
        id: '2', 
        name: 'Luca Bianchi',
        issue: 'injured' as const,
        days: 7,
        avatar: null
      }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'player_added',
        message: 'Marco Verdi aggiunto alla rosa',
        time: '2 ore fa',
        actor: 'Andrea Rossi'
      },
      {
        id: '2',
        type: 'training_completed', 
        message: 'Allenamento completato con 18/20 presenti',
        time: '1 giorno fa',
        actor: 'Sistema'
      }
    ],
    teamStats: {
      totalPlayers: team._count?.players || 0,
      activePlayers: Math.floor((team._count?.players || 0) * 0.9),
      attendanceRate: Math.floor(Math.random() * 20) + 80,
      attendanceTrend: Math.random() > 0.5 ? 'up' as const : 'down' as const,
      nextEventDate: 'Domani 18:30',
      recentResults: {
        wins: 5,
        draws: 2, 
        losses: 1
      }
    }
  };

  return <TeamDashboard {...dashboardData} />;
}

// Loading Skeleton per la dashboard
function TeamDashboardSkeleton() {
  return (
    <div className="min-h-screen pb-safe">
      {/* Header Skeleton */}
      <div className={cn(
        'relative overflow-hidden h-48',
        'bg-gradient-to-br from-primary-500 to-accent-500',
        'field-pattern'
      )}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex items-end p-6 lg:p-8">
          <div className="flex items-center gap-6 animate-pulse">
            <div className="w-20 h-20 bg-white/20 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-8 w-64 bg-white/20 rounded-lg" />
              <div className="h-4 w-48 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar Skeleton */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto" />
              <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Next Event Skeleton */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-lg border-2 border-neutral-200 dark:border-neutral-800">
              <div className="animate-pulse">
                <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  <div className="flex gap-3 mt-4">
                    <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
                    <div className="h-10 w-28 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Skeleton */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-lg border-2 border-neutral-200 dark:border-neutral-800">
              <div className="animate-pulse">
                <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-6" />
                <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions Skeleton */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-lg border-2 border-neutral-200 dark:border-neutral-800">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Activity Feed Skeleton */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-lg border-2 border-neutral-200 dark:border-neutral-800">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
                      <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage({ params }: TeamPageProps) {
  return (
    <Suspense fallback={<TeamDashboardSkeleton />}>
      <TeamContent teamId={params.id} />
    </Suspense>
  );
}