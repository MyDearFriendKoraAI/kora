import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY non configurata. Le funzionalità AI Coach non saranno disponibili.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const OPENAI_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: `Sei un AI coach esperto per squadre sportive italiane. 
Fornisci consigli pratici, specifici e attuabili per allenatori e squadre.
Rispondi sempre in italiano con un tono professionale ma amichevole.
Basa i tuoi suggerimenti su principi scientifici dello sport e best practices.`,
} as const;

export interface CoachSuggestionOptions {
  teamContext?: {
    sport: string;
    category: string;
    playersCount: number;
    recentPerformance?: string;
  };
  sessionType?: 'training' | 'tactical' | 'motivational' | 'recovery' | 'general';
  maxTokens?: number;
  temperature?: number;
}

export async function generateCoachSuggestion(
  prompt: string,
  options: CoachSuggestionOptions = {}
): Promise<{ success: boolean; content: string; error?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      content: 'AI Coach non disponibile. Configura OPENAI_API_KEY nelle impostazioni.',
      error: 'API key mancante',
    };
  }

  try {
    // Costruisci il contesto basato sulle opzioni
    let contextPrompt = OPENAI_CONFIG.systemPrompt;
    
    if (options.teamContext) {
      const { sport, category, playersCount, recentPerformance } = options.teamContext;
      contextPrompt += `\n\nContesto della squadra:
- Sport: ${sport}
- Categoria: ${category}  
- Numero giocatori: ${playersCount}
${recentPerformance ? `- Performance recenti: ${recentPerformance}` : ''}`;
    }

    if (options.sessionType) {
      const sessionTypes = {
        training: 'Concentrati su aspetti tecnici e fisici dell\'allenamento.',
        tactical: 'Fornisci consigli tattici e strategici per la squadra.',
        motivational: 'Dai suggerimenti per motivare e coinvolgere i giocatori.',
        recovery: 'Concentrati su recupero, prevenzione infortuni e benessere.',
        general: 'Fornisci consigli generali per la gestione della squadra.',
      };
      contextPrompt += `\n\nTipo di sessione: ${sessionTypes[options.sessionType]}`;
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: contextPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature ?? OPENAI_CONFIG.temperature,
      max_tokens: options.maxTokens ?? OPENAI_CONFIG.maxTokens,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return {
        success: false,
        content: 'Spiacente, non riesco a generare un suggerimento al momento.',
        error: 'Risposta vuota da OpenAI',
      };
    }

    return {
      success: true,
      content: content.trim(),
    };
    
  } catch (error: any) {
    console.error('Errore OpenAI:', error);
    
    // Gestisci errori specifici
    let errorMessage = 'Si è verificato un errore nel generare il suggerimento.';
    
    if (error.error?.code === 'rate_limit_exceeded') {
      errorMessage = 'Limite di richieste raggiunto. Riprova tra qualche minuto.';
    } else if (error.error?.code === 'insufficient_quota') {
      errorMessage = 'Quota API esaurita. Contatta l\'amministratore.';
    } else if (error.error?.code === 'invalid_api_key') {
      errorMessage = 'Chiave API non valida. Verifica la configurazione.';
    }
    
    return {
      success: false,
      content: errorMessage,
      error: error.message || 'Errore sconosciuto',
    };
  }
}

export async function generateTrainingPlan(
  sport: string,
  duration: number,
  focus: string,
  playersCount: number
): Promise<{ success: boolean; content: string; error?: string }> {
  const prompt = `Crea un piano di allenamento dettagliato per una squadra di ${sport}.
  
Parametri:
- Durata: ${duration} minuti
- Focus: ${focus}
- Numero giocatori: ${playersCount}

Includi:
1. Riscaldamento (tempo e esercizi)
2. Parte centrale (esercizi specifici)
3. Defaticamento
4. Materiali necessari
5. Variazioni per diversi livelli di abilità`;

  return generateCoachSuggestion(prompt, {
    teamContext: { sport, category: 'Standard', playersCount },
    sessionType: 'training',
  });
}

export async function analyzeTacticalFormation(
  sport: string,
  formation: string,
  opponents?: string
): Promise<{ success: boolean; content: string; error?: string }> {
  const prompt = `Analizza la formazione ${formation} per il ${sport}.
  
${opponents ? `Avversario: ${opponents}` : ''}

Fornisci:
1. Punti di forza della formazione
2. Possibili debolezze
3. Suggerimenti tattici
4. Consigli per l'allenamento
5. Variazioni durante la partita`;

  return generateCoachSuggestion(prompt, {
    teamContext: { sport, category: 'Tattica', playersCount: 11 },
    sessionType: 'tactical',
  });
}