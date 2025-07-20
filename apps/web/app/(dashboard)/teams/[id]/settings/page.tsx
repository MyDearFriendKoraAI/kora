import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTeamById } from '@/lib/supabase/team';
import { TeamSettingsContent } from '@/components/features/team/TeamSettingsContent';

interface TeamSettingsPageProps {
  params: {
    id: string;
  };
}

async function TeamSettingsData({ teamId }: { teamId: string }) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  const team = await getTeamById(teamId, user.id);
  
  if (!team) {
    notFound();
  }

  return <TeamSettingsContent team={team} />;
}

function TeamSettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
      
      {/* Settings sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-40"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  return (
    <div className="space-y-6 pb-safe">
      <Suspense fallback={<TeamSettingsSkeleton />}>
        <TeamSettingsData teamId={params.id} />
      </Suspense>
    </div>
  );
}