"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { BarChart3, Zap, TrendingDown } from 'lucide-react';

interface OptimizationMetadata {
  requestType: string;
  promptTokens: number;
  optimization: {
    tokensUsed: number;
    tokensOverhead: number;
    efficiency: string;
  };
}

interface OptimizationStatsProps {
  metadata?: OptimizationMetadata;
  className?: string;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  training: 'Allenamento',
  tactical: 'Tattica',
  injury: 'Infortuni',
  motivation: 'Motivazione',
  match: 'Partita',
  general: 'Generale',
};

const REQUEST_TYPE_COLORS: Record<string, string> = {
  training: 'bg-blue-500',
  tactical: 'bg-green-500',
  injury: 'bg-red-500',
  motivation: 'bg-purple-500',
  match: 'bg-orange-500',
  general: 'bg-gray-500',
};

export function OptimizationStats({ metadata, className }: OptimizationStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!metadata) return null;

  const { requestType, optimization } = metadata;
  const efficiencyNum = parseInt(optimization.efficiency.replace('%', ''));
  const isHighEfficiency = efficiencyNum >= 70;

  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-6 px-2 text-xs"
      >
        <BarChart3 className="h-3 w-3 mr-1" />
        {optimization.tokensUsed} token
        {isHighEfficiency && <Zap className="h-3 w-3 ml-1 text-green-500" />}
      </Button>

      {isExpanded && (
        <div className="mt-2 p-2 bg-muted/50 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span>Tipo richiesta:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${REQUEST_TYPE_COLORS[requestType] || 'bg-gray-500'}`} />
              <span className="font-medium">{REQUEST_TYPE_LABELS[requestType] || requestType}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Token utilizzati:</span>
            <span className="font-mono">{optimization.tokensUsed}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Overhead sistema:</span>
            <span className="font-mono">{optimization.tokensOverhead}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Efficienza:</span>
            <div className="flex items-center gap-1">
              <span className={`font-mono ${isHighEfficiency ? 'text-green-600' : 'text-orange-600'}`}>
                {optimization.efficiency}
              </span>
              {isHighEfficiency ? (
                <TrendingDown className="h-3 w-3 text-green-500" />
              ) : (
                <div className="h-3 w-3" />
              )}
            </div>
          </div>

          {isHighEfficiency && (
            <div className="text-green-600 text-xs flex items-center gap-1 mt-1">
              <Zap className="h-3 w-3" />
              Prompt ottimizzato per risparmio token
            </div>
          )}
        </div>
      )}
    </div>
  );
}