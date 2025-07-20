import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AcceptInviteContent } from '@/components/features/team/AcceptInviteContent';
import { prisma } from '@/lib/prisma';

interface AcceptInvitePageProps {
  searchParams: { token?: string };
}

async function AcceptInviteData({ token }: { token: string }) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Get invite details
  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          sport: true,
          category: true,
          season: true,
          logo: true,
        },
      },
      inviter: {
        select: {
          nome: true,
          cognome: true,
        },
      },
    },
  });

  if (!invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invito non trovato</h2>
          <p className="text-gray-600 mb-4">
            Il link di invito non è valido o è scaduto.
          </p>
        </div>
      </div>
    );
  }

  // Check if invite is expired
  if (invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invito scaduto</h2>
          <p className="text-gray-600 mb-4">
            Questo invito è scaduto. Contatta {invite.inviter.nome} {invite.inviter.cognome} per ricevere un nuovo invito.
          </p>
        </div>
      </div>
    );
  }

  // Check if invite is already used
  if (invite.status !== 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invito già utilizzato</h2>
          <p className="text-gray-600 mb-4">
            Questo invito è già stato accettato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AcceptInviteContent 
      invite={{
        id: invite.id,
        email: invite.email,
        teamId: invite.teamId,
        inviterId: invite.inviterId,
        role: invite.role as 'ASSISTANT',
        status: invite.status as 'PENDING',
        token: invite.token,
        message: invite.message || undefined,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString(),
        inviter: invite.inviter,
        team: {
          ...invite.team,
          category: invite.team.category || undefined,
          logo: invite.team.logo || undefined,
        },
      }}
      currentUser={user}
    />
  );
}

function AcceptInviteLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full"></div>
          <div className="h-6 bg-gray-200 rounded mx-auto w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-10 bg-gray-200 rounded mt-6"></div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const token = searchParams.token;

  if (!token) {
    redirect('/login');
  }

  return (
    <Suspense fallback={<AcceptInviteLoading />}>
      <AcceptInviteData token={token} />
    </Suspense>
  );
}