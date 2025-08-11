'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Calendar, TrendingUp, Crown, Shield, 
  Clock, MapPin, Award, UserCheck, Settings, Plus,
  Edit3, Trash2, Share2, MessageSquare, BarChart3
} from 'lucide-react';
import { ButtonModern } from '@/components/ui/ButtonModern';
import { SportIcon } from '@/components/features/team/SportIcon';
import { useActiveTeamOperations } from '@/hooks/queries/useActiveTeam';
import { usePendingInvites, useHandleInvite } from '@/hooks/queries/useTeamInvites';
import { SPORT_LABELS, SportTypeEnum } from '@/lib/validations/team';
import { cn } from '@kora/shared/utils';

// Sport Colors Mapping
const SPORT_COLORS = {
  CALCIO: {
    bg: 'from-green-500 to-green-600',
    accent: 'text-green-500',
    light: 'bg-green-50 border-green-200 text-green-700'
  },
  BASKET: {
    bg: 'from-orange-500 to-orange-600', 
    accent: 'text-orange-500',
    light: 'bg-orange-50 border-orange-200 text-orange-700'
  },
  PALLAVOLO: {
    bg: 'from-blue-500 to-blue-600',
    accent: 'text-blue-500', 
    light: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  TENNIS: {
    bg: 'from-yellow-500 to-yellow-600',
    accent: 'text-yellow-600',
    light: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  },
  RUGBY: {
    bg: 'from-purple-500 to-purple-600',
    accent: 'text-purple-500',
    light: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  ALTRO: {
    bg: 'from-gray-500 to-gray-600',
    accent: 'text-gray-500',
    light: 'bg-gray-50 border-gray-200 text-gray-700'
  }
};

// Pending Invites Section
function PendingInvites() {
  const { data: invites = [], isLoading } = usePendingInvites();
  const handleInvite = useHandleInvite();

  if (isLoading) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
          Inviti in Sospeso
        </h3>
        <div className="animate-pulse bg-neutral-200 dark:bg-neutral-800 h-24 rounded-2xl" />
      </div>
    );
  }

  if (invites.length === 0) return null;

  // Calcola giorni rimanenti
  const calculateDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 'Scaduto';
    if (days === 1) return '1 giorno';
    return `${days} giorni`;
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-500" />
        Inviti in Sospeso ({invites.length})
      </h3>
      
      <div className="grid gap-3">
        {invites.map((invite: any) => (
          <div
            key={invite.id}
            className={cn(
              'flex items-center justify-between p-4 rounded-xl',
              'bg-gradient-to-r from-amber-50 to-orange-50',
              'border border-amber-200 dark:border-amber-800',
              'dark:from-amber-900/20 dark:to-orange-900/20'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <SportIcon sport={invite.team.sport as SportTypeEnum} size="sm" className="w-4 h-4 text-amber-600" />
              </div>
              
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-white">
                  {invite.team.name}
                </h4>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Scade tra {calculateDaysRemaining(invite.expiresAt)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <ButtonModern
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleInvite.mutate({ inviteId: invite.id, action: 'reject' })}
                disabled={handleInvite.isPending}
              >
                Rifiuta
              </ButtonModern>
              <ButtonModern
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={() => handleInvite.mutate({ inviteId: invite.id, action: 'accept' })}
                disabled={handleInvite.isPending}
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

// Team Header Component
function TeamHeader({ team }: { team: any }) {
  const sportColors = SPORT_COLORS[team.sport as keyof typeof SPORT_COLORS] || SPORT_COLORS.ALTRO;

  return (
    <div className="mb-8">
      {/* Hero Section */}
      <div className={cn(
        'relative overflow-hidden rounded-3xl p-8',
        'bg-gradient-to-r',
        sportColors.bg
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="field-pattern h-full w-full" />
        </div>
        
        {/* Sport Icon Background */}
        <div className="absolute top-6 right-6 opacity-30">
          <SportIcon sport={team.sport} size="xl" className="w-16 h-16 text-white" />
        </div>

        {/* Content */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold',
              'bg-white/90 backdrop-blur-sm shadow-sm',
              team.role === 'owner' ? 'text-amber-700' : 'text-purple-700'
            )}>
              {team.role === 'owner' ? (
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

          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            {team.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <SportIcon sport={team.sport} size="sm" className="w-4 h-4" />
              <span>{SPORT_LABELS[team.sport as SportTypeEnum]}</span>
            </div>
            
            {team.category && (
              <>
                <span>•</span>
                <span>{team.category}</span>
              </>
            )}
            
            <span>•</span>
            <span>{team.season}</span>
            
            {team.homeField && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{team.homeField}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Team Stats Component
function TeamStats({ team }: { team: any }) {
  const stats = {
    players: team._count?.players || 0,
    trainings: team._count?.trainings || 0,
    nextEvent: 'Allenamento • Domani 18:30', // TODO: Da implementare
    attendance: Math.floor(Math.random() * 30) + 70, // TODO: Da implementare
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Players */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.players}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Giocatori</p>
          </div>
        </div>
      </div>

      {/* Trainings */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.trainings}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Allenamenti</p>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.attendance}%</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Presenze</p>
          </div>
        </div>
      </div>

      {/* Next Event */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">Prossimo</p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">{stats.nextEvent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions({ team }: { team: any }) {
  const actions = [
    {
      icon: Users,
      title: "Gestisci Giocatori",
      description: `${team._count?.players || 0} giocatori nel roster`,
      color: "bg-blue-500",
      href: `/teams/${team.id}/players`
    },
    {
      icon: Calendar,
      title: "Pianifica Allenamenti",
      description: "Crea e gestisci sessioni",
      color: "bg-green-500",
      href: '/trainings'
    },
    {
      icon: TrendingUp,
      title: "Statistiche",
      description: "Analizza performance",
      color: "bg-purple-500",
      href: `/teams/${team.id}/stats`
    },
    {
      icon: Settings,
      title: "Impostazioni",
      description: "Configura squadra",
      color: "bg-gray-500",
      href: `/teams/${team.id}/settings`
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
        Azioni Rapide
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className={cn(
              "group relative overflow-hidden",
              "bg-white dark:bg-neutral-900 rounded-2xl p-6",
              "border border-neutral-200 dark:border-neutral-800",
              "hover:border-primary-300 dark:hover:border-primary-700",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-300 hover:-translate-y-1",
              "cursor-pointer"
            )}>
              <div className={cn(
                "inline-flex p-3 rounded-xl mb-4",
                action.color,
                "group-hover:scale-110 transition-transform duration-300"
              )}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
                {action.title}
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Empty State for No Teams - Enhanced with AI Coach Examples
function EmptyTeamsState() {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-2xl">
        <Users className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
        La Tua Squadra Ti Aspetta! ⚽
      </h2>
      
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed">
        Scopri come Kora trasforma la gestione sportiva con intelligenza artificiale. 
        Dalla tattica alle prestazioni, tutto sotto controllo.
      </p>

      {/* Enhanced Features with AI Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {/* Gestione Intelligente Roster */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-3">
            📊 Gestione Intelligente
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Organizza giocatori, ruoli e formazioni con suggerimenti automatici
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>AI Tip:</strong> "Marco è il tuo miglior difensore centrale questa settimana"
          </div>
        </div>

        {/* Allenamenti Ottimizzati */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-3">
            🎯 Allenamenti Mirati
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Pianifica sessioni personalizzate basate sui dati delle performance
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-xs text-green-700 dark:text-green-300">
            🏃‍♂️ <strong>AI Coach:</strong> "Focalizza su resistenza aerobica per i prossimi 3 allenamenti"
          </div>
        </div>

        {/* AI Coach Strategico */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-3">
            🤖 AI Coach Avanzato
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Analisi tattica, consigli strategici e predizioni delle performance
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-xs text-purple-700 dark:text-purple-300">
            🔮 <strong>Strategia:</strong> "Modulo 4-3-3 ottimale contro squadre difensive"
          </div>
        </div>
      </div>

      {/* AI Coach Use Cases Showcase */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl p-8 mb-12 max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center justify-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-500" />
          Esempi di AI Coach in Azione
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analisi Tattica */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Analisi Tattica</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                  "La tua squadra ha vinto l'85% delle partite quando Luca gioca centrocampo. 
                  Considera di utilizzarlo come titolare nelle prossime partite importanti."
                </p>
              </div>
            </div>
          </div>

          {/* Gestione Infortuni */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Prevenzione Infortuni</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                  "Andrea ha saltato 3 allenamenti. Ti consiglio esercizi di recupero 
                  e un controllo medico prima della prossima partita."
                </p>
              </div>
            </div>
          </div>

          {/* Motivazione Squadra */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Motivazione Team</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                  "La squadra mostra calo motivazionale dopo 2 sconfitte. 
                  Organizza un team building o allenamento più leggero."
                </p>
              </div>
            </div>
          </div>

          {/* Ottimizzazione Performance */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Performance Analytics</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                  "Il rendimento della squadra migliora del 23% negli allenamenti serali. 
                  Considera di spostare le sessioni dopo le 18:00."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Button */}
      <Link href="/teams/new">
        <div className={cn(
          "inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold",
          "bg-gradient-to-r from-primary-500 via-purple-500 to-primary-600",
          "hover:from-primary-600 hover:via-purple-600 hover:to-primary-700",
          "text-white rounded-2xl shadow-2xl hover:shadow-3xl",
          "transition-all duration-500 hover:-translate-y-1 hover:scale-105",
          "group relative overflow-hidden"
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
          <Plus className="w-6 h-6 relative z-10" />
          <span className="relative z-10">Inizia il Tuo Viaggio Sportivo</span>
          <Award className="w-5 h-5 relative z-10 opacity-75" />
        </div>
      </Link>
      
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6">
        🚀 AI Coach incluso • 📈 Analytics avanzate • 🎯 Risultati garantiti
      </p>
    </div>
  );
}

// Main Page Component
export default function TeamPage() {
  const { activeTeam, isLoading, hasTeams } = useActiveTeamOperations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-neutral-600 dark:text-neutral-400">Caricamento squadra...</p>
        </div>
      </div>
    );
  }

  if (!hasTeams || !activeTeam) {
    return (
      <div className="min-h-screen pb-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PendingInvites />
          <EmptyTeamsState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PendingInvites />
        <TeamHeader team={activeTeam} />
        <TeamStats team={activeTeam} />
        <QuickActions team={activeTeam} />
      </div>
    </div>
  );
}