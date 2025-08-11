'use client';

import { useState } from 'react';
import { ChevronDown, Check, Crown, Shield, Settings } from 'lucide-react';
import { SportIcon } from '@/components/features/team/SportIcon';
import { useActiveTeamOperations } from '@/hooks/queries/useActiveTeam';
import { SPORT_LABELS, SportTypeEnum } from '@/lib/validations/team';
import { cn } from '@kora/shared/utils';

interface TeamSwitcherProps {
  variant?: 'desktop' | 'mobile';
  showSettings?: boolean;
}

export function TeamSwitcher({ variant = 'desktop', showSettings = false }: TeamSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    activeTeam, 
    availableTeams, 
    hasMultipleTeams, 
    canSwitchTeams, 
    setActiveTeam,
    isSettingActiveTeam 
  } = useActiveTeamOperations();

  if (!activeTeam) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-xl',
        variant === 'desktop' ? 'h-12 px-4' : 'h-10 px-3',
        'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
      )}>
        <span className="text-sm">Nessuna squadra</span>
      </div>
    );
  }

  if (!hasMultipleTeams) {
    return (
      <div className={cn(
        'flex items-center gap-3 rounded-xl transition-colors',
        variant === 'desktop' 
          ? 'px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50' 
          : 'px-3 py-2 bg-neutral-100 dark:bg-neutral-800'
      )}>
        <div className="p-2 bg-white dark:bg-neutral-700 rounded-lg shadow-sm">
          <SportIcon sport={activeTeam.sport as SportTypeEnum} size="sm" className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              'font-semibold truncate',
              variant === 'desktop' ? 'text-sm' : 'text-xs',
              'text-neutral-900 dark:text-white'
            )}>
              {activeTeam.name}
            </p>
            {activeTeam.role === 'owner' ? (
              <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
            ) : (
              <Shield className="w-3 h-3 text-purple-500 flex-shrink-0" />
            )}
          </div>
          {variant === 'desktop' && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {SPORT_LABELS[activeTeam.sport as SportTypeEnum]}
              {activeTeam.category && ` • ${activeTeam.category}`}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!canSwitchTeams}
        className={cn(
          'flex items-center gap-3 w-full rounded-xl transition-all',
          variant === 'desktop' 
            ? 'px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50' 
            : 'px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'bg-neutral-50 dark:bg-neutral-800/50'
        )}
      >
        <div className="p-2 bg-white dark:bg-neutral-700 rounded-lg shadow-sm">
          <SportIcon sport={activeTeam.sport as SportTypeEnum} size="sm" className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className={cn(
              'font-semibold truncate',
              variant === 'desktop' ? 'text-sm' : 'text-xs',
              'text-neutral-900 dark:text-white'
            )}>
              {activeTeam.name}
            </p>
            {activeTeam.role === 'owner' ? (
              <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
            ) : (
              <Shield className="w-3 h-3 text-purple-500 flex-shrink-0" />
            )}
          </div>
          {variant === 'desktop' && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {SPORT_LABELS[activeTeam.sport as SportTypeEnum]}
              {activeTeam.category && ` • ${activeTeam.category}`}
            </p>
          )}
        </div>
        
        <ChevronDown className={cn(
          'w-4 h-4 text-neutral-400 transition-transform flex-shrink-0',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <div className={cn(
            'absolute top-full left-0 right-0 mt-2 z-20',
            'bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700',
            'max-h-80 overflow-y-auto'
          )}>
            <div className="py-2">
              {availableTeams.map((team: any) => (
                <button
                  key={team.id}
                  onClick={() => {
                    if (team.id !== activeTeam.id) {
                      setActiveTeam({ teamId: team.id });
                    }
                    setIsOpen(false);
                  }}
                  disabled={isSettingActiveTeam}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 text-left',
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    team.id === activeTeam.id && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                    <SportIcon sport={team.sport as SportTypeEnum} size="sm" className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        {team.name}
                      </p>
                      {team.role === 'owner' ? (
                        <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      ) : (
                        <Shield className="w-3 h-3 text-purple-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {SPORT_LABELS[team.sport as SportTypeEnum]}
                      {team.category && ` • ${team.category}`}
                    </p>
                  </div>
                  
                  {team.id === activeTeam.id && (
                    <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Settings Link (if enabled) */}
            {showSettings && variant === 'desktop' && (
              <>
                <div className="border-t border-neutral-200 dark:border-neutral-700" />
                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to settings
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Gestisci Squadre
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}