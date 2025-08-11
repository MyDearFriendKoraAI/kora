'use client';

import { useMutation } from '@tanstack/react-query';
import { CoachSuggestionOptions } from '@/lib/openai/client';

interface AISuggestionRequest {
  prompt: string;
  teamContext?: CoachSuggestionOptions['teamContext'];
  sessionType?: CoachSuggestionOptions['sessionType'];
  maxTokens?: number;
  temperature?: number;
}

interface TrainingPlanRequest {
  sport: string;
  duration: number;
  focus: string;
  playersCount: number;
}

interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
}

export function useAICoachSuggestion() {
  return useMutation({
    mutationFn: async (request: AISuggestionRequest): Promise<AIResponse> => {
      const response = await fetch('/api/ai-coach/suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella richiesta');
      }

      return response.json();
    },
  });
}

export function useAITrainingPlan() {
  return useMutation({
    mutationFn: async (request: TrainingPlanRequest): Promise<AIResponse> => {
      const response = await fetch('/api/ai-coach/training-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella richiesta');
      }

      return response.json();
    },
  });
}

// Hook per suggerimenti rapidi predefiniti
export function useQuickSuggestions() {
  const mutation = useAICoachSuggestion();

  const getMotivationalTip = (teamContext?: AISuggestionRequest['teamContext']) =>
    mutation.mutate({
      prompt: 'Dammi un consiglio motivazionale per la squadra prima di una partita importante.',
      teamContext,
      sessionType: 'motivational',
    });

  const getTacticalAdvice = (formation: string, sport: string) =>
    mutation.mutate({
      prompt: `Analizza i vantaggi e svantaggi della formazione ${formation} nel ${sport}. Dammi 3 consigli tattici specifici.`,
      sessionType: 'tactical',
    });

  const getTrainingTip = (focus: string, sport: string) =>
    mutation.mutate({
      prompt: `Suggerisci 3 esercizi specifici per migliorare ${focus} nel ${sport}. Includi durata e intensità.`,
      sessionType: 'training',
    });

  const getRecoveryAdvice = (teamContext?: AISuggestionRequest['teamContext']) =>
    mutation.mutate({
      prompt: 'Consigli per il recupero post-allenamento e la prevenzione degli infortuni.',
      teamContext,
      sessionType: 'recovery',
    });

  return {
    ...mutation,
    getMotivationalTip,
    getTacticalAdvice,
    getTrainingTip,
    getRecoveryAdvice,
  };
}