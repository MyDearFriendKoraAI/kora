"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

const PROMPT_CATEGORIES = {
  allenamento: {
    label: 'Allenamento',
    icon: '🏃‍♂️',
    prompts: [
      'Crea un piano di allenamento per migliorare la resistenza',
      'Suggeriscimi esercizi per la preparazione fisica generale',
      'Come strutturare un allenamento pre-partita?',
      'Esercizi specifici per migliorare la tecnica individuale',
      'Piano di recupero dopo un allenamento intenso'
    ]
  },
  tattica: {
    label: 'Tattica',
    icon: '⚽',
    prompts: [
      'Analizza la formazione 4-3-3 e i suoi vantaggi',
      'Come contrastare una squadra che gioca in contropiede?',
      'Suggerimenti per migliorare il possesso palla',
      'Strategie per i calci piazzati in attacco',
      'Come organizzare la fase difensiva della squadra'
    ]
  },
  motivazione: {
    label: 'Motivazione',
    icon: '💪',
    prompts: [
      'Come motivare la squadra dopo una sconfitta?',
      'Tecniche per gestire l\'ansia pre-partita',
      'Come aiutare un giocatore con poca fiducia?',
      'Strategie per mantenere alta la concentrazione',
      'Come gestire le dinamiche di gruppo in squadra'
    ]
  },
  infortuni: {
    label: 'Prevenzione',
    icon: '🩹',
    prompts: [
      'Esercizi per prevenire infortuni muscolari',
      'Come ridurre il rischio di infortuni al ginocchio?',
      'Protocollo di riscaldamento pre-allenamento',
      'Esercizi di stretching post-allenamento',
      'Segnali di sovrallenamento da monitorare'
    ]
  },
  gestione: {
    label: 'Gestione',
    icon: '📋',
    prompts: [
      'Come gestire un giocatore con presenze irregolari?',
      'Strategie per comunicare efficacemente con i genitori',
      'Come organizzare al meglio gli allenamenti settimanali?',
      'Consigli per migliorare il coinvolgimento dei giocatori',
      'Come pianificare la stagione sportiva'
    ]
  }
};

export function QuickPrompts({ onSelectPrompt, disabled, className }: QuickPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePromptSelect = (prompt: string) => {
    onSelectPrompt(prompt);
    setSelectedCategory(null);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div className={cn('p-3 border-t bg-muted/30', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          disabled={disabled}
          className="w-full justify-between h-8"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Suggerimenti rapidi</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('border-t bg-background', className)}>
      {/* Header */}
      <div className="p-3 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="w-full justify-between h-8"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Suggerimenti rapidi</span>
          </div>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Categories */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(PROMPT_CATEGORIES).map(([key, category]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              disabled={disabled}
              className="text-xs h-8 justify-start"
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </div>

        {/* Prompts for selected category */}
        {selectedCategory && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {PROMPT_CATEGORIES[selectedCategory as keyof typeof PROMPT_CATEGORIES].label}:
            </p>
            {PROMPT_CATEGORIES[selectedCategory as keyof typeof PROMPT_CATEGORIES].prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptSelect(prompt)}
                disabled={disabled}
                className="w-full text-left p-2 text-xs rounded hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {!selectedCategory && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Seleziona una categoria per vedere i suggerimenti
          </p>
        )}
      </div>
    </div>
  );
}