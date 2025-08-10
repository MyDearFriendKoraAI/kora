'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Calendar, TrendingUp, MoreVertical, 
  Edit, Trash2, Share2, Settings, Trophy, Target 
} from 'lucide-react';
import { SportIcon } from './SportIcon';
import { SPORT_LABELS, SportTypeEnum, TeamColors } from '@/lib/validations/team';
import { cn } from '@kora/shared/utils';

interface TeamCardModernProps {
  id: string;
  name: string;
  sport: SportTypeEnum;
  category?: string;
  logo?: string;
  colors?: TeamColors;
  playerCount: number;
  nextTraining?: string;
  winRate?: number;
  role?: 'owner' | 'assistant';
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
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
  default: 'from-primary-500 to-primary-700'
};

export function TeamCardModern({
  id,
  name,
  sport,
  category,
  logo,
  colors,
  playerCount,
  nextTraining = 'Non programmato',
  winRate = 0,
  role = 'owner',
  className,
  onEdit,
  onDelete,
  onShare
}: TeamCardModernProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const gradientClass = sportGradients[sport as keyof typeof sportGradients] || sportGradients.default;
  
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleMenuClick = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (action) action();
    setIsMenuOpen(false);
  };

  return (
    <Link href={`/teams/${id}`}>
      <div
        className={cn(
          'group relative overflow-hidden',
          'bg-white dark:bg-neutral-900 rounded-2xl',
          'border-2 border-neutral-200 dark:border-neutral-700',
          'shadow-lg hover:shadow-2xl',
          'transition-all duration-300 transform',
          'hover:scale-[1.02] hover:-translate-y-1',
          'cursor-pointer',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gradient Header */}
        <div className={cn(
          'relative h-32 bg-gradient-to-br',
          gradientClass,
          'transition-all duration-500'
        )}>
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="field-pattern h-full w-full" />
          </div>

          {/* Floating Shapes */}
          <div className={cn(
            'absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl',
            'transition-transform duration-700',
            isHovered && 'scale-150'
          )} />
          
          {/* Sport Icon Background */}
          <div className="absolute top-4 right-4 opacity-30">
            <SportIcon sport={sport} size="lg" className="w-16 h-16 text-white" />
          </div>

          {/* Team Logo */}
          <div className="absolute -bottom-8 left-6">
            {logo ? (
              <img
                src={logo}
                alt={`Logo ${name}`}
                className={cn(
                  'w-20 h-20 rounded-2xl object-cover',
                  'border-4 border-white dark:border-neutral-900',
                  'shadow-xl transition-transform duration-300',
                  isHovered && 'scale-110 rotate-3'
                )}
              />
            ) : (
              <div 
                className={cn(
                  'w-20 h-20 rounded-2xl flex items-center justify-center',
                  'text-white font-bold text-2xl',
                  'border-4 border-white dark:border-neutral-900',
                  'shadow-xl transition-transform duration-300',
                  'bg-gradient-to-br',
                  gradientClass,
                  isHovered && 'scale-110 rotate-3'
                )}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Menu Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className={cn(
                'p-2 rounded-xl',
                'bg-white/20 backdrop-blur-sm',
                'text-white hover:bg-white/30',
                'transition-all duration-200',
                'touch-target'
              )}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className={cn(
                'absolute right-0 mt-2 w-48',
                'bg-white dark:bg-neutral-800 rounded-xl',
                'shadow-xl border border-neutral-200 dark:border-neutral-700',
                'z-50 animate-slide-in'
              )}>
                <div className="py-2">
                  <button
                    onClick={(e) => handleMenuClick(e, onEdit)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3"
                  >
                    <Edit className="w-4 h-4" />
                    Modifica
                  </button>
                  <button
                    onClick={(e) => handleMenuClick(e, onShare)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3"
                  >
                    <Share2 className="w-4 h-4" />
                    Condividi
                  </button>
                  <button
                    onClick={(e) => handleMenuClick(e)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    Impostazioni
                  </button>
                  <hr className="my-2 border-neutral-200 dark:border-neutral-700" />
                  <button
                    onClick={(e) => handleMenuClick(e, onDelete)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                  >
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-14">
          {/* Team Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                {name}
              </h3>
              {role === 'owner' && (
                <span className="badge-sport bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xxs">
                  Mister
                </span>
              )}
              {role === 'assistant' && (
                <span className="badge-sport bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xxs">
                  Vice
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <SportIcon sport={sport} size="sm" className="w-4 h-4" />
              <span>{SPORT_LABELS[sport]}</span>
              {category && (
                <>
                  <span>•</span>
                  <span>{category}</span>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{playerCount}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Giocatori</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                {nextTraining.split(' ')[0]}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Prossimo</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{winRate}%</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Vittorie</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>Completamento Roster</span>
              <span>{Math.min(100, (playerCount / 25) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full bg-gradient-to-r rounded-full transition-all duration-500',
                  gradientClass
                )}
                style={{ width: `${Math.min(100, (playerCount / 25) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/20 to-transparent',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-300 pointer-events-none'
        )} />
      </div>
    </Link>
  );
}