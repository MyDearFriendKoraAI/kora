"use client";

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Crown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RateLimitIndicatorProps {
  remainingRequests?: number;
  userTier: 'FREE' | 'LEVEL1' | 'PREMIUM';
  className?: string;
}

const TIER_LIMITS = {
  FREE: { daily: 5, label: 'Gratuito', color: 'bg-gray-500', icon: Clock },
  LEVEL1: { daily: 20, label: 'Level 1', color: 'bg-blue-500', icon: Zap },
  PREMIUM: { daily: 100, label: 'Premium', color: 'bg-yellow-500', icon: Crown },
};

export function RateLimitIndicator({ 
  remainingRequests, 
  userTier,
  className 
}: RateLimitIndicatorProps) {
  const tierInfo = TIER_LIMITS[userTier];
  const usedRequests = remainingRequests !== undefined ? tierInfo.daily - remainingRequests : 0;
  const usagePercentage = (usedRequests / tierInfo.daily) * 100;
  
  const status = useMemo(() => {
    if (remainingRequests === undefined) return 'loading';
    if (remainingRequests === 0) return 'exhausted';
    if (remainingRequests <= 2) return 'warning';
    return 'normal';
  }, [remainingRequests]);

  const getProgressColor = () => {
    if (status === 'exhausted') return 'bg-red-500';
    if (status === 'warning') return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (status === 'exhausted' || status === 'warning') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    const Icon = tierInfo.icon;
    return <Icon className="h-3 w-3" />;
  };

  return (
    <div className={cn('p-3 border rounded-lg bg-card', className)}>
      {/* Header with tier badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn('text-xs', `border-${tierInfo.color.replace('bg-', '')}`)}
          >
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span>{tierInfo.label}</span>
            </div>
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {remainingRequests !== undefined ? (
            <span>
              {remainingRequests}/{tierInfo.daily} rimaste
            </span>
          ) : (
            <span>Caricamento...</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress 
          value={usagePercentage} 
          className="h-2"
          indicatorClassName={getProgressColor()}
        />
        
        {/* Status message */}
        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            'font-medium',
            status === 'exhausted' && 'text-red-600',
            status === 'warning' && 'text-orange-600',
            status === 'normal' && 'text-green-600',
            status === 'loading' && 'text-muted-foreground'
          )}>
            {status === 'exhausted' && '🚫 Limite raggiunto'}
            {status === 'warning' && '⚠️ Poche richieste rimaste'}
            {status === 'normal' && '✅ Tutto ok'}
            {status === 'loading' && '⏳ Controllo limite...'}
          </span>
          
          <span className="text-muted-foreground">
            Reset: {getResetTime()}
          </span>
        </div>
      </div>

      {/* Upgrade suggestion for FREE users */}
      {userTier === 'FREE' && status === 'warning' && (
        <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Suggerimento:</strong> Passa a Level 1 per 20 richieste al giorno!
          </p>
        </div>
      )}
      
      {userTier === 'LEVEL1' && status === 'warning' && (
        <div className="mt-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            👑 <strong>Suggerimento:</strong> Upgrade a Premium per 100 richieste!
          </p>
        </div>
      )}
    </div>
  );
}

function getResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const now = new Date();
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}