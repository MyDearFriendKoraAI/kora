import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTeamById, getTeamStats } from '@/lib/supabase/team';
import { TeamHeader } from '@/components/features/team/TeamHeader';
import { TeamTabs } from '@/components/features/team/TeamTabs';

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

  return (
    <div className="space-y-6">
      <TeamHeader team={team} />
      <TeamTabs team={team} stats={stats} />
    </div>
  );
}

function TeamPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex space-x-8">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage({ params }: TeamPageProps) {
  return (
    <Suspense fallback={<TeamPageSkeleton />}>
      <TeamContent teamId={params.id} />
    </Suspense>
  );
}