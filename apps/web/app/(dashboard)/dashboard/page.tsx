'use client';

import { DashboardHero } from '@/components/features/dashboard/DashboardHero';
import { InvitePopup } from '@/components/features/team/InvitePopup';
import { useAuth } from '@/hooks/useAuth';
import { useActiveTeamOperations } from '@/hooks/queries/useActiveTeam';
import { useUpcomingTrainings } from '@/hooks/queries/useTrainings';
import { usePlayers } from '@/hooks/queries/usePlayers';
import { usePendingInvites } from '@/hooks/queries/useTeamInvites';
import { 
  Calendar, Users, TrendingUp, MessageSquare, 
  Target, Award, Clock, BarChart3, Loader2, Plus
} from 'lucide-react';
import { cn } from '@kora/shared/utils';

// Quick Action Card Component
function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  href 
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group relative overflow-hidden",
        "bg-white dark:bg-neutral-900 rounded-2xl p-6",
        "border-2 border-neutral-200 dark:border-neutral-700",
        "hover:border-primary-300 dark:hover:border-primary-700",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 hover:-translate-y-1"
      )}
    >
      <div className={cn(
        "inline-flex p-3 rounded-xl mb-4",
        color,
        "group-hover:scale-110 transition-transform duration-300"
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}

// Activity Item Component
function ActivityItem({ 
  icon: Icon, 
  title, 
  time, 
  color 
}: {
  icon: any;
  title: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition-colors">
      <div className={cn(
        "p-2 rounded-lg",
        color
      )}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {time}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { activeTeam, isLoading: teamsLoading, hasTeams, error, refetchActiveTeam } = useActiveTeamOperations();
  const { data: invites = [] } = usePendingInvites();
  
  // Use active team as primary team
  const primaryTeam = activeTeam;
  
  // Fetch real data for the primary team
  const { data: upcomingTrainings, isLoading: trainingsLoading, error: trainingsError } = useUpcomingTrainings(primaryTeam?.id, 3);
  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers(primaryTeam?.id || '', { status: 'active' });
  
  // Calculate real stats from fetched data
  const totalPlayers = players?.length || 0;
  const activePlayers = players?.filter((p: any) => p.status === 'active')?.length || 0;
  const nextTrainingData = upcomingTrainings?.[0];
  
  const dashboardStats = {
    players: totalPlayers,
    nextTraining: nextTrainingData 
      ? `${new Date(nextTrainingData.date).toLocaleDateString('it-IT', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}`
      : 'Nessun allenamento',
    attendance: Math.floor(Math.random() * 20 + 75), // TODO: Implement real attendance calculation
    wins: '8/10', // TODO: Implement real wins/losses from matches
    playersChange: activePlayers - totalPlayers > 0 ? activePlayers - totalPlayers : 0,
    attendanceChange: 5, // TODO: Calculate real attendance trend
    winsChange: 3 // TODO: Calculate real wins trend
  };
  
  // Loading state
  const isLoading = authLoading || teamsLoading || (primaryTeam && (trainingsLoading || playersLoading));

  const quickActions = [
    {
      icon: Users,
      title: "Gestisci Roster",
      description: `${totalPlayers} giocatori attivi`,
      color: "bg-blue-500",
      href: primaryTeam ? `/teams/${primaryTeam.id}/players` : '/teams'
    },
    {
      icon: Calendar,
      title: "Pianifica Allenamento",
      description: upcomingTrainings?.length 
        ? `${upcomingTrainings.length} prossimi eventi`
        : "Nessun evento programmato",
      color: "bg-green-500",
      href: primaryTeam ? `/teams/${primaryTeam.id}/trainings` : '/teams'
    },
    {
      icon: MessageSquare,
      title: "AI Coach",
      description: "Ottieni consigli personalizzati",
      color: "bg-purple-500",
      href: "/ai-coach"
    },
    {
      icon: BarChart3,
      title: "Statistiche Squadra",
      description: "Analizza performance e trend",
      color: "bg-orange-500",
      href: primaryTeam ? `/teams/${primaryTeam.id}` : '/teams'
    }
  ];

  // Generate real recent activities based on actual data
  const recentActivities = [
    // Recent player additions
    ...players?.slice(-2).map((player: any) => ({
      icon: Users,
      title: `${player.firstName} ${player.lastName} aggiunto al roster`,
      time: new Date(player.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
      color: "bg-blue-500"
    })) || [],
    
    // Upcoming trainings
    ...upcomingTrainings?.slice(0, 2).map((training: any) => ({
      icon: Calendar,
      title: `${training.title} programmato`,
      time: new Date(training.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
      color: "bg-green-500"
    })) || [],
    
    // Placeholder for team creation if no other activities
    ...((!players?.length && !upcomingTrainings?.length) ? [{
      icon: Award,
      title: `Squadra ${primaryTeam?.name} creata`,
      time: primaryTeam ? new Date(primaryTeam.createdAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : 'Recentemente',
      color: "bg-yellow-500"
    }] : [])
  ].slice(0, 4); // Limit to 4 activities

  // Show loading state while fetching initial data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
          <p className="text-neutral-600 dark:text-neutral-400">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Show connection error only if there's an actual error (API failure)
  if (error && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          Errore di Connessione
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Non riesco a caricare le tue squadre. Verifica la connessione.
        </p>
        <button onClick={() => refetchActiveTeam()} className="btn-primary">
          Riprova
        </button>
      </div>
    );
  }
  
  // Show empty state if no teams
  if (!primaryTeam) {
    return (
      <div className="space-y-8 pb-safe">
        {/* Popup Inviti */}
        {invites.length > 0 && (
          <InvitePopup showOnMount={true} />
        )}
        
        {/* Empty State Allineato con /teams */}
        <div className="text-center py-16 px-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-2xl">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Benvenuto in Kora! 🏆
          </h2>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            La piattaforma per gestire la tua squadra sportiva con intelligenza artificiale. 
            Crea la tua prima squadra e inizia a organizzare allenamenti, gestire giocatori e ricevere consigli dall'AI Coach.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {/* Gestione Giocatori */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
                Gestisci Giocatori
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Organizza il roster, traccia presenze e gestisci ruoli in modo semplice e intuitivo
              </p>
            </div>

            {/* Pianifica Allenamenti */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
                Pianifica Allenamenti
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Crea sessioni, monitora il progresso e tiene traccia degli obiettivi della squadra
              </p>
            </div>

            {/* AI Coach */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
                AI Coach Personalizzato
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Ricevi consigli strategici, suggerimenti tattici e analisi delle performance
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="/teams/new"
            className={cn(
              "inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold",
              "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700",
              "text-white rounded-2xl shadow-2xl hover:shadow-3xl",
              "transition-all duration-300 hover:-translate-y-1 hover:scale-105",
              "group relative overflow-hidden"
            )}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Crea la Tua Prima Squadra</span>
            <Award className="w-5 h-5 relative z-10 opacity-75" />
          </a>
          
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            🚀 Setup in meno di 2 minuti • 🎯 Strumenti professionali • 🤖 AI integrata
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-safe">
      {/* Popup Inviti */}
      {invites.length > 0 && (
        <InvitePopup showOnMount={true} />
      )}
      
      {/* Hero Section */}
      <DashboardHero
        userName={user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Coach'}
        teamName={primaryTeam?.name}
        teamCategory={primaryTeam?.category}
        teamSport={primaryTeam?.sport}
        stats={dashboardStats}
      />

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
          Azioni Rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border-2 border-neutral-200 dark:border-neutral-700">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Attività Recenti
              </h2>
            </div>
            <div className="p-2">
              {recentActivities.length > 0 ? (
                <div className="space-y-1">
                  {recentActivities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                    Nessuna attività
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Le tue attività appariranno qui
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Goals */}
        <div>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border-2 border-neutral-200 dark:border-neutral-700">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-500" />
                Obiettivi Settimana
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Training Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Allenamenti Settimana
                    </span>
                    <span className="text-sm text-neutral-500">
                      {Math.min(upcomingTrainings?.length || 0, 4)}/4
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((upcomingTrainings?.length || 0) / 4 * 100, 100)}%` }} 
                    />
                  </div>
                </div>
                
                {/* Attendance Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Presenze Medie
                    </span>
                    <span className="text-sm text-neutral-500">{dashboardStats.attendance}%</span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${dashboardStats.attendance}%` }} 
                    />
                  </div>
                </div>
                
                {/* Players Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Giocatori Attivi
                    </span>
                    <span className="text-sm text-neutral-500">
                      {activePlayers}/{totalPlayers}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500" 
                      style={{ width: totalPlayers > 0 ? `${(activePlayers / totalPlayers) * 100}%` : '0%' }} 
                    />
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 btn-primary text-sm">
                Visualizza Tutti gli Obiettivi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}