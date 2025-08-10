'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, Users, Calendar, TrendingUp, Crown, Shield, 
  Clock, MapPin, Award, UserCheck, MoreVertical 
} from 'lucide-react';
import { ButtonModern } from '@/components/ui/ButtonModern';
import { SportIcon } from '@/components/features/team/SportIcon';
import { useTeamLimit } from '@/hooks/useTeamLimit';
import { useTeams } from '@/hooks/queries/useTeams';
import { SPORT_LABELS, SportTypeEnum } from '@/lib/validations/team';
import { cn } from '@kora/shared/utils';

// Sport Colors Mapping
const SPORT_COLORS = {
  soccer: {
    bg: 'from-green-500 to-green-600',
    accent: 'text-green-500',
    light: 'bg-green-50 border-green-200 text-green-700'
  },
  basketball: {
    bg: 'from-orange-500 to-orange-600', 
    accent: 'text-orange-500',
    light: 'bg-orange-50 border-orange-200 text-orange-700'
  },
  volleyball: {
    bg: 'from-blue-500 to-blue-600',
    accent: 'text-blue-500', 
    light: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  tennis: {
    bg: 'from-yellow-500 to-yellow-600',
    accent: 'text-yellow-600',
    light: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  },
  swimming: {
    bg: 'from-cyan-500 to-cyan-600',
    accent: 'text-cyan-500',
    light: 'bg-cyan-50 border-cyan-200 text-cyan-700'
  }
};

// Header Component
function TeamsPageHeader() {
  const { teams } = useTeams();
  const { isAtLimit } = useTeamLimit();
  
  // Mock data - in produzione verrebbero da API
  const ownerTeams = teams.filter(() => true); // Tutte owner per ora
  const assistantTeams: any[] = []; // Mock vice allenatore teams

  return (
    <div className="mb-12">
      {/* Main Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-white mb-4">
          Le Mie Squadre
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          {ownerTeams.length === 0 && assistantTeams.length === 0 
            ? 'Inizia il tuo percorso da allenatore creando la prima squadra'
            : `Gestisci ${ownerTeams.length} squadre come allenatore${assistantTeams.length > 0 ? ` e ${assistantTeams.length} come vice` : ''}`
          }
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        {isAtLimit ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
              <Award className="w-5 h-5" />
              <span className="font-medium">Limite di 2 squadre raggiunto</span>
            </div>
            <ButtonModern
              variant="accent"
              size="lg"
              className="shadow-xl"
              leftIcon={<Crown className="w-5 h-5" />}
            >
              Scopri i Piani Premium
            </ButtonModern>
          </div>
        ) : (
          <Link href="/teams/new">
            <ButtonModern
              variant="sport" 
              size="xl"
              className="shadow-2xl hover:shadow-3xl text-lg px-8 py-4"
              leftIcon={<Plus className="w-6 h-6" />}
            >
              Crea Nuova Squadra
            </ButtonModern>
          </Link>
        )}
      </div>
    </div>
  );
}

// Team Card Component
function TeamCard({ team, role = 'owner' }: { team: any; role?: 'owner' | 'assistant' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const sportColors = SPORT_COLORS[team.sport as keyof typeof SPORT_COLORS] || SPORT_COLORS.soccer;
  
  // Mock statistics - in produzione da API
  const stats = {
    players: team._count?.players || Math.floor(Math.random() * 25) + 5,
    nextEvent: 'Allenamento • Domani 18:30',
    attendance: Math.floor(Math.random() * 30) + 70,
    assistants: role === 'owner' ? Math.floor(Math.random() * 3) : 0
  };

  return (
    <Link href={`/teams/${team.id}`}>
      <div
        className={cn(
          'group relative overflow-hidden rounded-3xl',
          'bg-white dark:bg-neutral-900 shadow-lg hover:shadow-2xl',
          'border-2 border-neutral-100 dark:border-neutral-800',
          'transition-all duration-500 hover:-translate-y-2',
          'cursor-pointer'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sport-themed Header */}
        <div className={cn(
          'relative h-24 bg-gradient-to-r',
          sportColors.bg
        )}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="field-pattern h-full w-full" />
          </div>
          
          {/* Sport Icon Background */}
          <div className="absolute top-3 right-4 opacity-30">
            <SportIcon sport={team.sport} size="lg" className="w-12 h-12 text-white" />
          </div>

          {/* Role Badge */}
          <div className="absolute top-3 left-4">
            <div className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold',
              'bg-white/90 backdrop-blur-sm shadow-sm',
              role === 'owner' 
                ? 'text-amber-700' 
                : 'text-purple-700'
            )}>
              {role === 'owner' ? (
                <>
                  <Crown className="w-3.5 h-3.5" />
                  PROPRIETARIO
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  VICE ALLENATORE
                </>
              )}
            </div>
          </div>

          {/* Menu Button */}
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className={cn(
                'p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white',
                'hover:bg-white/30 transition-colors duration-200',
                'opacity-0 group-hover:opacity-100'
              )}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border z-50">
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                    Modifica Squadra
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                    Condividi
                  </button>
                  {role === 'owner' && (
                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      Elimina
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Team Name & Info */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
              {team.name}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <SportIcon sport={team.sport} size="sm" className="w-4 h-4" />
              <span>{SPORT_LABELS[team.sport as SportTypeEnum]}</span>
              {team.category && (
                <>
                  <span>•</span>
                  <span>{team.category}</span>
                </>
              )}
              <span>•</span>
              <span>2024/2025</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Players */}
            <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <Users className={cn('w-5 h-5 mx-auto mb-1', sportColors.accent)} />
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{stats.players}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Giocatori</p>
            </div>

            {/* Attendance */}
            <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <TrendingUp className={cn(
                'w-5 h-5 mx-auto mb-1',
                stats.attendance >= 80 ? 'text-green-500' : 
                stats.attendance >= 60 ? 'text-yellow-500' : 'text-red-500'
              )} />
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{stats.attendance}%</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Presenze</p>
            </div>
          </div>

          {/* Next Event */}
          <div className="mb-4 p-3 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-750 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                Prossimo
              </span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {stats.nextEvent}
            </p>
          </div>

          {/* Assistant Count (only for owners) */}
          {role === 'owner' && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <UserCheck className="w-4 h-4" />
                <span>Vice Allenatori</span>
              </div>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {stats.assistants}
              </span>
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        )} />
      </div>
    </Link>
  );
}

// Pending Invites Section
function PendingInvites() {
  // Mock invites data - in produzione da API
  const invites = [
    {
      id: '1',
      teamName: 'Juventus Under 17',
      inviterName: 'Marco Bianchi',
      role: 'Vice Allenatore',
      expiresIn: '3 giorni',
      sport: 'soccer'
    }
  ];

  if (invites.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-amber-500" />
        Inviti in Sospeso
      </h2>
      
      <div className="grid gap-4">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className={cn(
              'flex items-center justify-between p-6 rounded-2xl',
              'bg-gradient-to-r from-amber-50 to-orange-50',
              'border-2 border-amber-200 dark:border-amber-800',
              'dark:from-amber-900/20 dark:to-orange-900/20'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <SportIcon sport={invite.sport as SportTypeEnum} size="md" className="w-6 h-6 text-amber-600" />
              </div>
              
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white">
                  {invite.teamName}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium">{invite.inviterName}</span> ti invita come{' '}
                  <span className="font-medium text-purple-600">{invite.role}</span>
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Scade tra {invite.expiresIn}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <ButtonModern
                variant="outline"
                size="sm"
                className="text-neutral-600 border-neutral-300"
              >
                Rifiuta
              </ButtonModern>
              <ButtonModern
                variant="primary"
                size="sm"
              >
                Accetta
              </ButtonModern>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyTeamsState() {
  return (
    <div className="text-center py-16 px-6">
      {/* Animated Field Illustration */}
      <div className="relative w-80 h-48 mx-auto mb-12">
        <div className={cn(
          'w-full h-full rounded-3xl',
          'bg-gradient-to-br from-green-400 to-green-600',
          'relative overflow-hidden shadow-2xl'
        )}>
          {/* Field Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="field-pattern h-full w-full" />
          </div>
          
          {/* Field Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 192">
            <rect x="10" y="10" width="300" height="172" fill="none" stroke="white" strokeWidth="2" opacity="0.6" rx="20" />
            <line x1="160" y1="10" x2="160" y2="182" stroke="white" strokeWidth="2" opacity="0.6" />
            <circle cx="160" cy="96" r="40" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
            <circle cx="160" cy="96" r="3" fill="white" opacity="0.8" />
          </svg>
          
          {/* Floating Ball */}
          <div className="absolute top-20 left-32 w-4 h-4 bg-white rounded-full animate-bounce opacity-80" />
          
          {/* Goal Posts */}
          <div className="absolute left-2 top-16 w-1 h-16 bg-white/60" />
          <div className="absolute right-2 top-16 w-1 h-16 bg-white/60" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
        Inizia la Tua Stagione!
      </h2>
      
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
        Crea la tua prima squadra e inizia a gestire giocatori, allenamenti e partite. 
        Kora ti aiuterà a diventare un allenatore più organizzato ed efficace.
      </p>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
        {[
          {
            icon: Users,
            title: 'Gestione Roster',
            description: 'Organizza i tuoi giocatori, ruoli e formazioni in modo intuitivo'
          },
          {
            icon: Calendar, 
            title: 'Allenamenti Smart',
            description: 'Pianifica sessioni, traccia presenze e monitora i progressi'
          },
          {
            icon: TrendingUp,
            title: 'Statistiche Avanzate', 
            description: 'Analizza performance e migliora le strategie con i dati'
          }
        ].map((benefit, index) => (
          <div key={index} className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
              <benefit.icon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">
              {benefit.title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      <Link href="/teams/new">
        <ButtonModern
          variant="sport"
          size="xl"
          className="shadow-2xl text-lg px-8 py-4"
          leftIcon={<Plus className="w-6 h-6" />}
        >
          Crea la Tua Prima Squadra
        </ButtonModern>
      </Link>
    </div>
  );
}

// Teams Grid
function TeamsGrid() {
  const { teams, isLoading } = useTeams();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return <EmptyTeamsState />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8 flex items-center gap-2">
        <Award className="w-6 h-6 text-primary-500" />
        Le Tue Squadre
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team: any) => (
          <TeamCard key={team.id} team={team} role="owner" />
        ))}
      </div>
    </div>
  );
}

// Main Page Component
export default function TeamsPage() {
  return (
    <div className="min-h-screen pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamsPageHeader />
        <PendingInvites />
        <TeamsGrid />
      </div>
    </div>
  );
}