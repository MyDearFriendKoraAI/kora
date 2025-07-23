'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TeamCard, TeamCardSkeleton } from '@/components/features/team/TeamCard';
import { LimitBanner } from '@/components/features/team/LimitBanner';
import { useTeamStore } from '@/stores/team-store';
import { useTeamLimit } from '@/hooks/useTeamLimit';
import { useTeams } from '@/hooks/queries/useTeams';
import { useHoverPrefetch } from '@/hooks/queries/usePrefetch';

function TeamsHeader() {
  const { used: teamCount, limit: maxCount, isAtLimit } = useTeamLimit();

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Le mie squadre</h1>
          <p className="text-gray-600">
            {teamCount > 0 
              ? `${teamCount} di ${maxCount} squadre utilizzate`
              : 'Gestisci tutte le tue squadre in un posto'
            }
          </p>
        </div>
        
        {/* Desktop button */}
        <div className="hidden sm:block">
          {isAtLimit ? (
            <div className="relative group">
              <Button disabled className="bg-gray-400 cursor-not-allowed">
                Nuova Squadra
              </Button>
              <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Hai raggiunto il limite massimo di squadre
              </div>
            </div>
          ) : (
            <Link href="/teams/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Nuova Squadra
              </Button>
            </Link>
          )}
        </div>
      </div>


      {/* Mobile floating button */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40">
        {isAtLimit ? (
          <button 
            disabled
            className="bg-gray-400 text-white rounded-full p-4 shadow-lg cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        ) : (
          <Link href="/teams/new">
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </Link>
        )}
      </div>
    </>
  );
}

function TeamsGrid() {
  const { teams, isLoading } = useTeams();
  const { teamCardHover } = useHoverPrefetch();

  if (isLoading) {
    return <TeamsGridSkeleton />;
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna squadra ancora</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Inizia creando la tua prima squadra. Potrai aggiungere giocatori, programmare allenamenti e molto altro.
        </p>
        <Link href="/teams/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Crea prima squadra
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team: any) => (
        <div key={team.id} {...teamCardHover(team.id)}>
          <TeamCard
            id={team.id}
            name={team.name}
            sport={team.sport}
            category={team.category}
            logo={team.logo}
            colors={team.colors}
            playerCount={team._count?.players || 0}
            role="owner" // All teams in this view are owned by the user
          />
        </div>
      ))}
    </div>
  );
}

function TeamsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <TeamCardSkeleton key={i} />
      ))}
    </div>
  );
}

function TeamsHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="hidden sm:block">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      {/* Header with Limit Info */}
      <TeamsHeader />

      {/* Teams Grid */}
      <TeamsGrid />
    </div>
  );
}