'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Users, TrendingUp, Shield, Crown, MapPin,
  Clock, Trophy, Target, UserPlus, CheckCircle, MessageSquare,
  AlertTriangle, Gift, Activity, Plus, Eye, Settings,
  ArrowRight, BarChart3, Lock, ChevronRight
} from 'lucide-react';
import { ButtonModern } from '@/components/ui/ButtonModern';
import { SportIcon } from './SportIcon';
import { SPORT_LABELS, SportTypeEnum } from '@/lib/validations/team';
import { Team } from '@/lib/supabase/team';
import { cn } from '@kora/shared/utils';

// Types
interface TeamStats {
  totalPlayers: number;
  activePlayers: number;
  attendanceRate: number;
  attendanceTrend: 'up' | 'down';
  nextEventDate: string;
  recentResults: {
    wins: number;
    draws: number;
    losses: number;
  };
}

interface UpcomingEvent {
  id: string;
  type: 'training' | 'match';
  title: string;
  date: Date;
  location: string;
  opponent?: string | null;
  status: string;
}

interface PlayerNeedingAttention {
  id: string;
  name: string;
  issue: 'absent' | 'injured' | 'birthday';
  days: number;
  avatar?: string | null;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
  actor: string;
}

interface TeamDashboardProps {
  team: Team;
  userRole: 'owner' | 'assistant';
  teamStats: TeamStats;
  upcomingEvent: UpcomingEvent;
  attendanceChart: {
    last30Days: Array<{
      date: Date;
      attendance: number;
    }>;
  };
  playersNeedingAttention: PlayerNeedingAttention[];
  recentActivity: ActivityItem[];
}

// Sport Colors
const SPORT_COLORS = {
  soccer: 'from-green-500 to-green-600',
  basketball: 'from-orange-500 to-orange-600',
  volleyball: 'from-blue-500 to-blue-600',
  tennis: 'from-yellow-500 to-yellow-600',
  swimming: 'from-cyan-500 to-cyan-600',
  athletics: 'from-pink-500 to-pink-600',
  rugby: 'from-purple-500 to-purple-600',
  baseball: 'from-red-500 to-red-600'
};

// Team Header Component
function TeamHeader({ team, userRole }: { team: Team; userRole: 'owner' | 'assistant' }) {
  const sportColor = SPORT_COLORS[team.sport as keyof typeof SPORT_COLORS] || SPORT_COLORS.soccer;
  
  return (
    <div className={cn(
      'relative overflow-hidden bg-gradient-to-br',
      sportColor,
      'text-white'
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="field-pattern h-full w-full" />
      </div>
      
      {/* Floating Sport Icon */}
      <div className="absolute top-6 right-6 opacity-20">
        <SportIcon sport={team.sport as SportTypeEnum} size="xl" className="w-24 h-24" />
      </div>

      <div className="relative z-10 px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          {/* Team Info */}
          <div className="flex items-center gap-6">
            {/* Team Logo */}
            <div className="relative">
              {team.logo ? (
                <img
                  src={team.logo}
                  alt={`Logo ${team.name}`}
                  className="w-20 h-20 rounded-2xl border-4 border-white/50 shadow-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-white/50 shadow-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {team.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              
              {/* Sport Badge */}
              <div className="absolute -bottom-2 -right-2 bg-white/90 backdrop-blur-sm rounded-xl p-2">
                <SportIcon sport={team.sport as SportTypeEnum} size="sm" className="w-5 h-5 text-neutral-700" />
              </div>
            </div>

            {/* Team Details */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-shadow">
                  {team.name}
                </h1>
                {userRole === 'assistant' && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-300/30">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Vice Allenatore</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <SportIcon sport={team.sport as SportTypeEnum} size="sm" className="w-4 h-4" />
                  {SPORT_LABELS[team.sport as SportTypeEnum]}
                </span>
                {team.category && (
                  <>
                    <span>•</span>
                    <span>{team.category}</span>
                  </>
                )}
                <span>•</span>
                <span>Stagione 2024/25</span>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation Button */}
          <div className="sm:hidden">
            <ButtonModern
              variant="ghost"
              size="sm"
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Menu
            </ButtonModern>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Bar Component
function StatsBar({ stats }: { stats: TeamStats }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Players */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary-500" />
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.totalPlayers}
              </span>
              <span className="text-sm text-neutral-500">
                ({stats.activePlayers} attivi)
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Giocatori Totali</p>
          </div>

          {/* Attendance Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className={cn(
                'w-5 h-5',
                stats.attendanceTrend === 'up' ? 'text-green-500' : 'text-red-500'
              )} />
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.attendanceRate}%
              </span>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                stats.attendanceTrend === 'up' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              )}>
                {stats.attendanceTrend === 'up' ? '↗' : '↘'}
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Presenze Medie</p>
          </div>

          {/* Next Event */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {stats.nextEventDate}
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Prossimo Evento</p>
          </div>

          {/* Recent Results */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div className="flex gap-1 text-sm">
                <span className="text-green-600 font-bold">{stats.recentResults.wins}V</span>
                <span className="text-neutral-500">-</span>
                <span className="text-yellow-600 font-bold">{stats.recentResults.draws}P</span>
                <span className="text-neutral-500">-</span>
                <span className="text-red-600 font-bold">{stats.recentResults.losses}S</span>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Risultati Recenti</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Next Event Widget
function NextEventWidget({ event, userRole }: { event: UpcomingEvent; userRole: 'owner' | 'assistant' }) {
  const isMatch = event.type === 'match';
  
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg border-2 border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'p-3 rounded-xl',
          isMatch ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        )}>
          {isMatch ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            {isMatch ? 'Prossima Partita' : 'Prossimo Allenamento'}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {event.date.toLocaleDateString('it-IT', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h4 className="text-xl font-bold text-neutral-900 dark:text-white">
          {event.title}
        </h4>
        
        {event.opponent && (
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            vs <span className="font-semibold">{event.opponent}</span>
          </p>
        )}
        
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <MapPin className="w-4 h-4" />
          <span>{event.location}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/teams/${event.id}/trainings/${event.id}`}>
          <ButtonModern
            variant="primary"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Vedi Dettagli
          </ButtonModern>
        </Link>
        
        <ButtonModern
          variant="secondary"
          size="sm"
          leftIcon={<Users className="w-4 h-4" />}
          disabled={userRole === 'assistant'}
        >
          {userRole === 'assistant' && <Lock className="w-3 h-3 mr-1" />}
          Convocazioni
        </ButtonModern>
      </div>
    </div>
  );
}

// Attendance Chart Component (Simplified)
function AttendanceChart({ data }: { data: { last30Days: Array<{ date: Date; attendance: number }> } }) {
  const averageAttendance = Math.round(
    data.last30Days.reduce((acc, day) => acc + day.attendance, 0) / data.last30Days.length
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg border-2 border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          Andamento Presenze (30 giorni)
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{averageAttendance}%</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Media</p>
        </div>
      </div>

      {/* Simplified Chart Visualization */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span>Presenze Basse (&lt;70%)</span>
          <span>Presenze Alte (&gt;90%)</span>
        </div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full transition-all duration-1000"
            style={{ width: `${averageAttendance}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Low Attendance Days */}
      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-800 dark:text-red-400">
            Attenzione Richiesta
          </span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400">
          {data.last30Days.filter(day => day.attendance < 70).length} giorni con presenze sotto il 70%
        </p>
      </div>
    </div>
  );
}

// Players Needing Attention
function PlayersNeedingAttention({ players }: { players: PlayerNeedingAttention[] }) {
  if (players.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg border-2 border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Tutto Sotto Controllo!
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Nessun giocatore necessita attenzione particolare al momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg border-2 border-neutral-200 dark:border-neutral-800 p-6">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Giocatori da Monitorare
      </h3>
      
      <div className="space-y-3">
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div className="w-10 h-10 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center text-sm font-bold">
              {player.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div className="flex-1">
              <p className="font-medium text-neutral-900 dark:text-white">
                {player.name}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {player.issue === 'absent' && `Assente da ${player.days} allenamenti`}
                {player.issue === 'injured' && `Infortunato da ${player.days} giorni`}
                {player.issue === 'birthday' && `Compleanno tra ${player.days} giorni`}
              </p>
            </div>
            
            <div className={cn(
              'w-3 h-3 rounded-full',
              player.issue === 'absent' ? 'bg-red-500' :
              player.issue === 'injured' ? 'bg-orange-500' :
              'bg-blue-500'
            )} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick Actions
function QuickActions({ userRole }: { userRole: 'owner' | 'assistant' }) {
  const actions = [
    {
      icon: CheckCircle,
      label: 'Segna Presenze',
      color: 'bg-green-500',
      disabled: false,
      href: '#'
    },
    {
      icon: Calendar,
      label: 'Nuovo Allenamento',
      color: 'bg-blue-500',
      disabled: userRole === 'assistant',
      href: '#'
    },
    {
      icon: UserPlus,
      label: 'Aggiungi Giocatore',
      color: 'bg-purple-500',
      disabled: false,
      href: '#'
    },
    {
      icon: MessageSquare,
      label: 'AI Coach',
      color: 'bg-orange-500',
      disabled: false,
      href: '/ai-coach'
    }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg border-2 border-neutral-200 dark:border-neutral-800 p-6">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary-500" />
        Azioni Rapide
      </h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <button 
              disabled={action.disabled}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200',
                'hover:scale-105 disabled:hover:scale-100',
                !action.disabled 
                  ? 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700' 
                  : 'bg-neutral-100 dark:bg-neutral-800 opacity-50 cursor-not-allowed'
              )}
            >
              <div className={cn('p-2 rounded-lg text-white', action.color)}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-neutral-900 dark:text-white">
                {action.label}
              </span>
              {action.disabled && <Lock className="w-4 h-4 ml-auto text-neutral-400" />}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Activity Feed
function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg border-2 border-neutral-200 dark:border-neutral-800 p-6">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary-500" />
        Attività Recenti
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-primary-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-900 dark:text-white">
                {activity.message}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
          Vedi tutto
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Main Dashboard Component
export function TeamDashboard(props: TeamDashboardProps) {
  return (
    <div className="min-h-screen pb-safe">
      {/* Team Header */}
      <TeamHeader team={props.team} userRole={props.userRole} />
      
      {/* Stats Bar */}
      <StatsBar stats={props.teamStats} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <NextEventWidget event={props.upcomingEvent} userRole={props.userRole} />
            <AttendanceChart data={props.attendanceChart} />
            <PlayersNeedingAttention players={props.playersNeedingAttention} />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            <QuickActions userRole={props.userRole} />
            <ActivityFeed activities={props.recentActivity} />
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button className="w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}