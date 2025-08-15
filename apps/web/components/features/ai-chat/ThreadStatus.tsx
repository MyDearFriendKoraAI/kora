"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { 
  MessageSquare, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Zap,
  Pause
} from 'lucide-react';
import { ChatState } from '@/hooks/useAssistantChat';
import { cn } from '@/lib/utils';

interface ThreadStatusProps {
  state: ChatState;
  threadId: string | null;
  messageCount?: number;
  onResetThread?: () => void;
  className?: string;
}

const STATE_CONFIG = {
  idle: {
    label: 'Pronto',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  sending: {
    label: 'Invio messaggio...',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  'assistant-processing': {
    label: 'AI sta pensando...',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  receiving: {
    label: 'Ricevendo risposta...',
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  error: {
    label: 'Errore',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  'rate-limited': {
    label: 'Limite raggiunto',
    icon: Pause,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  }
};

export function ThreadStatus({ 
  state, 
  threadId, 
  messageCount = 0, 
  onResetThread,
  className 
}: ThreadStatusProps) {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;
  const isActive = state !== 'idle' && state !== 'error' && state !== 'rate-limited';

  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg border',
      config.bgColor,
      config.borderColor,
      className
    )}>
      {/* Status info */}
      <div className="flex items-center gap-3">
        <div className={cn('p-1.5 rounded-full', isActive && 'animate-pulse')}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', config.color)}>
              {config.label}
            </span>
            
            {state === 'assistant-processing' && (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {threadId && (
              <span className="font-mono">
                Thread: {threadId.slice(-8)}
              </span>
            )}
            
            {messageCount > 0 && (
              <span>
                {messageCount} messaggi
              </span>
            )}
            
            <Badge variant="outline" className="text-xs h-5">
              {state === 'idle' ? '🟢 Online' : '🔄 Attivo'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {threadId && onResetThread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetThread}
            disabled={isActive}
            className="h-8 px-2 text-xs"
            title="Inizia una nuova conversazione"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}