'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Calendar, Trophy, Activity, Target } from 'lucide-react';
import { cn } from '@kora/shared/utils';

interface DashboardStats {
  players: number;
  nextTraining: string;
  attendance: number;
  wins: string;
  playersChange?: number;
  attendanceChange?: number;
  winsChange?: number;
}

interface DashboardHeroProps {
  userName?: string;
  teamName?: string;
  teamCategory?: string;
  teamSeason?: string;
  teamSport?: string;
  stats?: DashboardStats;
  className?: string;
}

const sportGradients = {
  soccer: 'from-green-500 to-green-700',
  basketball: 'from-orange-500 to-orange-700',
  volleyball: 'from-blue-500 to-blue-700',
  tennis: 'from-yellow-500 to-yellow-700',
  swimming: 'from-cyan-500 to-cyan-700',
  athletics: 'from-pink-500 to-pink-700',
  rugby: 'from-purple-500 to-purple-700',
  baseball: 'from-red-500 to-red-700',
  default: 'from-primary-600 to-primary-800'
};

const defaultStats: DashboardStats = {
  players: 0,
  nextTraining: 'Non programmato',
  attendance: 0,
  wins: '0/0',
  playersChange: 0,
  attendanceChange: 0,
  winsChange: 0
};

export function DashboardHero({
  userName = 'Coach',
  teamName,
  teamCategory,
  teamSeason = new Date().getFullYear().toString(),
  teamSport = 'default',
  stats = defaultStats,
  className
}: DashboardHeroProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setIsAnimated(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const gradientClass = sportGradients[teamSport as keyof typeof sportGradients] || sportGradients.default;

  const statCards = [
    {
      icon: Users,
      label: 'Giocatori',
      value: stats.players,
      trend: stats.playersChange,
      color: 'text-blue-200',
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: Calendar,
      label: 'Prossimo',
      value: stats.nextTraining,
      trend: null,
      color: 'text-green-200',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: Activity,
      label: 'Presenze',
      value: `${stats.attendance}%`,
      trend: stats.attendanceChange,
      color: 'text-purple-200',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: Trophy,
      label: 'Vittorie',
      value: stats.wins,
      trend: stats.winsChange,
      color: 'text-yellow-200',
      bgColor: 'bg-yellow-500/20'
    }
  ];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl p-8 text-white',
        'bg-gradient-to-br shadow-2xl',
        gradientClass,
        'transition-all duration-500',
        isAnimated && 'animate-fade-in',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="field-pattern h-full w-full" />
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className={cn(
          'mb-8 space-y-2',
          'transition-all duration-700 delay-100',
          isAnimated && 'animate-slide-in'
        )}>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            {getGreeting()}, {userName}! 👋
          </h1>
          
          {teamName && (
            <div className="flex flex-wrap items-center gap-2 text-white/90">
              <span className="text-lg font-medium">{teamName}</span>
              {teamCategory && (
                <>
                  <span className="text-white/60">•</span>
                  <span className="text-sm px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    {teamCategory}
                  </span>
                </>
              )}
              <span className="text-white/60">•</span>
              <span className="text-sm">Stagione {teamSeason}</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'group relative overflow-hidden',
                'bg-white/10 backdrop-blur-md rounded-2xl p-4',
                'border border-white/20 hover:border-white/40',
                'transition-all duration-300 hover:scale-105 hover:bg-white/15',
                'cursor-pointer',
                isAnimated && 'animate-bounce-in'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                'inline-flex p-2 rounded-xl mb-3',
                stat.bgColor,
                'group-hover:scale-110 transition-transform duration-300'
              )}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              
              {/* Label */}
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              
              {/* Value */}
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {stat.value}
                </p>
                
                {/* Trend */}
                {stat.trend !== null && stat.trend !== undefined && (
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    stat.trend > 0 
                      ? 'bg-green-500/20 text-green-300' 
                      : stat.trend < 0 
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-white/20 text-white/60'
                  )}>
                    {stat.trend > 0 && '+'}
                    {stat.trend}
                    {stat.trend !== 0 && (
                      <TrendingUp className={cn(
                        'inline w-3 h-3 ml-1',
                        stat.trend < 0 && 'rotate-180'
                      )} />
                    )}
                  </span>
                )}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-sport bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 px-4 py-2 text-sm">
            <Target className="w-4 h-4 mr-2" />
            Obiettivi Settimana
          </button>
          <button className="btn-sport bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 px-4 py-2 text-sm">
            <Activity className="w-4 h-4 mr-2" />
            Report Mensile
          </button>
        </div>
      </div>
    </div>
  );
}