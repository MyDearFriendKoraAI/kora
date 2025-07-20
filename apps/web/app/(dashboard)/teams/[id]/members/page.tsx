import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTeamById } from '@/lib/supabase/team';
import { getTeamAssistants, getTeamInvites, getUserTeamRole } from '@/lib/supabase/team-assistant';
import { TeamMembersContent } from '@/components/features/team/TeamMembersContent';

interface TeamMembersPageProps {
  params: { id: string };
}

async function TeamMembersData({ teamId }: { teamId: string }) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/login');
  }

  // Get team data
  const team = await getTeamById(teamId, user.id);
  
  if (!team) {
    redirect('/teams');
  }

  // Get user role
  const userRole = await getUserTeamRole(teamId, user.id);
  
  if (!userRole) {
    redirect('/teams');
  }

  // Get assistants and invites
  const [assistants, invites] = await Promise.all([
    getTeamAssistants(teamId),
    getTeamInvites(teamId),
  ]);

  return (
    <TeamMembersContent
      team={team}
      assistants={assistants}
      invites={invites}
      userRole={userRole}
      currentUser={user}
    />
  );
}

function TeamMembersLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 1 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamMembersPage({ params }: TeamMembersPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<TeamMembersLoading />}>
          <TeamMembersData teamId={params.id} />
        </Suspense>
      </div>
    </div>
  );
}