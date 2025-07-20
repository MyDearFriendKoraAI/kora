import Link from 'next/link';
import { Team } from '@/lib/supabase/team';

interface TeamOverviewProps {
  team: Team;
  stats: {
    playersCount: number;
    trainingsCount: number;
    upcomingTrainings: number;
    assistantsCount?: number;
    lastTraining?: string;
    nextTraining?: string;
  };
}

export function TeamOverview({ team, stats }: TeamOverviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  };

  const statCards = [
    {
      title: 'Giocatori',
      value: stats.playersCount,
      subtitle: 'nella rosa',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      action: stats.playersCount > 0 ? 'Gestisci' : 'Aggiungi giocatori',
      actionHref: `/teams/${team.id}/players`,
      color: 'blue',
    },
    {
      title: 'Allenamenti',
      value: stats.trainingsCount,
      subtitle: 'completati',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: 'Programma',
      actionHref: `/teams/${team.id}/trainings`,
      color: 'green',
    },
    {
      title: 'Staff Tecnico',
      value: (stats.assistantsCount || 0) + 1, // +1 for the mister
      subtitle: `1 mister + ${stats.assistantsCount || 0} vice`,
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      action: 'Gestisci Staff',
      actionHref: `/teams/${team.id}/members`,
      color: 'orange',
    },
    {
      title: 'Prossimi eventi',
      value: stats.upcomingTrainings,
      subtitle: 'in programma',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      action: 'Calendario',
      actionHref: `/teams/${team.id}/calendar`,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {card.icon}
                <div>
                  <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">{card.subtitle}</p>
            
            <Link
              href={card.actionHref}
              className={`
                inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                ${card.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                  card.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                  card.color === 'orange' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                  'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }
              `}
            >
              {card.action}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </div>

      {/* Recent activity and upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming events */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Prossimi eventi</h3>
          
          {stats.upcomingTrainings > 0 ? (
            <div className="space-y-3">
              {/* Mock upcoming events */}
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">Allenamento tecnico</p>
                  <p className="text-sm text-gray-600">
                    {stats.nextTraining ? formatDate(stats.nextTraining) : 'Domani'} • 18:00
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Confermato
                  </span>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">Partita amichevole</p>
                  <p className="text-sm text-gray-600">Sabato • 15:30</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    In attesa
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Nessun evento in programma</p>
              <Link
                href={`/teams/${team.id}/trainings/new`}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Programma primo allenamento →
              </Link>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Attività recenti</h3>
          
          <div className="space-y-3">
            {/* Mock recent activity */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Squadra creata con successo
                </p>
                <p className="text-xs text-gray-500">2 ore fa</p>
              </div>
            </div>
            
            {stats.playersCount > 0 && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {stats.playersCount} giocatori nella rosa
                  </p>
                  <p className="text-xs text-gray-500">1 giorno fa</p>
                </div>
              </div>
            )}
            
            {stats.trainingsCount > 0 && stats.lastTraining && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Ultimo allenamento completato
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(stats.lastTraining)}</p>
                </div>
              </div>
            )}
            
            {stats.playersCount === 0 && stats.trainingsCount === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Nessuna attività recente</p>
                <p className="text-xs text-gray-500">
                  Inizia aggiungendo giocatori o programmando allenamenti
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}