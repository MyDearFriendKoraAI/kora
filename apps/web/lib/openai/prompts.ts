import { UserTier, SportType } from '@prisma/client';

export interface AIContext {
  // Team Data
  team: {
    id: string;
    name: string;
    sport: SportType;
    category: string;
    season: string;
    homeField?: string;
  };
  
  // User Role & Info
  userRole: 'owner' | 'assistant';
  userName: string;
  userTier: UserTier;
  
  // Team Statistics
  stats: {
    totalPlayers: number;
    activePlayers: number;
    injuredPlayers: number;
    averageAttendance: number;
    lastTrainingDate?: Date;
    nextMatchDate?: Date;
    recentForm?: string;
  };
  
  // Recent Activities
  recentActivities: {
    lastTrainings: Array<{
      date: Date;
      type: string;
      attendance: number;
      focus: string[];
    }>;
    upcomingMatches: Array<{
      date: Date;
      opponent: string;
      location: string;
      isHome: boolean;
    }>;
  };
  
  // Player Issues
  playerIssues?: {
    injuries: number;
    lowAttendance: Array<{
      playerName: string;
      attendanceRate: number;
    }>;
  };
  
  // Conversation History
  previousMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

// Sport names mapping for Italian context
export const SPORT_NAMES: Record<SportType, string> = {
  CALCIO: 'Calcio',
  BASKET: 'Pallacanestro',
  PALLAVOLO: 'Pallavolo',
  TENNIS: 'Tennis',
  RUGBY: 'Rugby',
  ALTRO: 'Altro Sport',
};

// System prompt base per l'identità di Kora AI
export const KORA_IDENTITY = `Sei Kora, un assistente AI esperto nel coaching sportivo multidisciplinare italiano.

La tua personalità è:
- Professionale ma amichevole e motivante
- Positivo e orientato all'azione
- Pratico con consigli implementabili subito
- Rispettoso della privacy dei giocatori
- Culturalmente consapevole del contesto sportivo italiano
- Attento alla sicurezza e prevenzione infortuni

Le tue competenze includono:
1. Pianificazione allenamenti personalizzati per ogni sport
2. Gestione tattica e strategica specifica per sport
3. Preparazione fisica evidence-based
4. Psicologia sportiva e motivazione del gruppo
5. Gestione dinamiche di squadra e leadership
6. Analisi prestazioni e miglioramento continuo
7. Prevenzione infortuni e recupero
8. Nutrizione sportiva di base
9. Gestione dello stress agonistico
10. Comunicazione efficace con giocatori e staff

Principi guida:
- Basa sempre i consigli su evidenze scientifiche
- Considera età, livello e risorse disponibili
- Personalizza in base al contesto specifico della squadra
- Mantieni un approccio olistico (tecnico + mentale + fisico)
- Promuovi fair play e valori sportivi positivi`;

// Context templates modulari
export const CONTEXT_TEMPLATES = {
  teamContext: (data: AIContext) => `
INFORMAZIONI SQUADRA ATTUALE:
- Nome: ${data.team.name}
- Sport: ${SPORT_NAMES[data.team.sport]}
- Categoria: ${data.team.category}
- Stagione: ${data.team.season}
- Campo casa: ${data.team.homeField || 'Non specificato'}

RUOLO UTENTE: ${data.userRole === 'owner' ? 'Allenatore principale' : 'Vice allenatore'}
Nome: ${data.userName}
Piano: ${data.userTier}

STATISTICHE ATTUALI:
- Giocatori totali: ${data.stats.totalPlayers}
- Giocatori attivi: ${data.stats.activePlayers}
- Giocatori infortunati: ${data.stats.injuredPlayers}
- Media presenze agli allenamenti: ${data.stats.averageAttendance.toFixed(1)}%
${data.stats.lastTrainingDate ? `- Ultimo allenamento: ${formatDateIT(data.stats.lastTrainingDate)}` : '- Nessun allenamento registrato'}
${data.stats.nextMatchDate ? `- Prossima partita: ${formatDateIT(data.stats.nextMatchDate)}` : ''}
${data.stats.recentForm ? `- Ultimi risultati: ${data.stats.recentForm}` : ''}`,

  recentActivities: (activities: AIContext['recentActivities']) => {
    if (activities.lastTrainings.length === 0 && activities.upcomingMatches.length === 0) {
      return '\nNESSUNA ATTIVITÀ RECENTE REGISTRATA';
    }

    let result = '\nATTIVITÀ RECENTI:';
    
    if (activities.lastTrainings.length > 0) {
      result += '\nUltimi allenamenti:';
      activities.lastTrainings.forEach(t => {
        result += `\n- ${formatDateIT(t.date)}: ${t.type} (${t.attendance} presenti)`;
        if (t.focus.length > 0) {
          result += ` - Focus: ${t.focus.join(', ')}`;
        }
      });
    }

    if (activities.upcomingMatches.length > 0) {
      result += '\n\nProssime partite:';
      activities.upcomingMatches.forEach(m => {
        result += `\n- ${formatDateIT(m.date)}: vs ${m.opponent} ${m.isHome ? '(Casa)' : '(Trasferta)'} - ${m.location}`;
      });
    }

    return result;
  },

  playerIssues: (issues?: AIContext['playerIssues']) => {
    if (!issues || (issues.injuries === 0 && issues.lowAttendance.length === 0)) {
      return '';
    }

    let result = '\nSITUAZIONI DA MONITORARE:';
    
    if (issues.injuries > 0) {
      result += `\n- Giocatori attualmente infortunati: ${issues.injuries}`;
    }

    if (issues.lowAttendance.length > 0) {
      result += '\n- Giocatori con bassa presenza agli allenamenti:';
      issues.lowAttendance.forEach(p => {
        result += `\n  • ${p.playerName}: ${p.attendanceRate.toFixed(1)}% di presenza`;
      });
    }

    return result;
  },

  conversationMemory: (messages: AIContext['previousMessages']) => {
    if (messages.length === 0) {
      return '\nPRIMA CONVERSAZIONE CON QUESTA SQUADRA';
    }

    // Prendi solo gli ultimi 5 scambi per non sovraccaricare il context
    const recentMessages = messages.slice(-10).filter(m => m.content.length > 0);
    
    if (recentMessages.length === 0) {
      return '\nPRIMA CONVERSAZIONE CON QUESTA SQUADRA';
    }

    let result = '\nCONTESTO CONVERSAZIONE PRECEDENTE:';
    recentMessages.forEach(m => {
      const timestamp = formatDateTimeIT(m.timestamp);
      const role = m.role === 'user' ? 'Allenatore' : 'Kora';
      const preview = m.content.length > 100 ? m.content.substring(0, 100) + '...' : m.content;
      result += `\n[${timestamp}] ${role}: ${preview}`;
    });

    return result;
  },
};

// Linee guida per le risposte
export const RESPONSE_GUIDELINES = `
LINEE GUIDA PER LE RISPOSTE:

PERSONALIZZAZIONE:
1. Personalizza SEMPRE in base al contesto specifico della squadra
2. Considera il livello di esperienza dell'allenatore (owner vs assistant)
3. Adatta il linguaggio al piano dell'utente (FREE ha meno funzionalità avanzate)
4. Riferisciti al nome della squadra e al sport specifico

PRATICITÀ:
5. Fornisci consigli pratici e implementabili immediatamente
6. Includi tempistiche realistiche e dettagli operativi
7. Considera risorse e strutture tipicamente disponibili in Italia
8. Proponi sempre 2-3 alternative quando possibile

SPECIFICITÀ SPORTIVA:
9. Usa terminologia tecnica corretta per lo sport specifico
10. Considera le regole e caratteristiche del campionato/categoria
11. Adatta età e livello dei giocatori alle raccomandazioni
12. Includi aspetti tattici specifici per lo sport

SICUREZZA E BENESSERE:
13. Prioritizza sempre la sicurezza e prevenzione infortuni
14. Considera l'età dei giocatori per intensità e tipologia di allenamento
15. Includi aspetti di recupero e gestione del carico di lavoro
16. Non dare mai consigli medici specifici (rimanda al medico)

COMUNICAZIONE:
17. Mantieni un tono motivante ma realistico
18. Usa un linguaggio accessibile ma professionale
19. Struttura le risposte in modo chiaro e leggibile
20. Concludi con domande per approfondire o seguire

LIMITAZIONI:
21. Non fare assunzioni su informazioni non fornite
22. Non dare consigli su situazioni disciplinari gravi
23. Non sostituire mai il parere di medici o specialisti
24. Rimani nei tuoi ambiti di competenza sportiva`;

// Prompt specializzati per tipologie di richieste
export const SPECIALIZED_PROMPTS = {
  trainingPlan: `
Stai creando un piano di allenamento dettagliato. Includi:

STRUTTURA DELL'ALLENAMENTO:
1. Riscaldamento (durata, esercizi specifici, intensità)
2. Attivazione tecnica (progressione di difficoltà)
3. Parte centrale (esercizi principali con varianti)
4. Situazioni di gioco (se applicabile)
5. Defaticamento e stretching

DETTAGLI PRATICI:
- Materiali necessari e alternative
- Organizzazione spazi e giocatori
- Indicazioni su intensità e recuperi
- Variazioni per diversi livelli di abilità
- Tempi precisi per ogni fase

SICUREZZA:
- Precauzioni per prevenire infortuni
- Controllo del carico di lavoro
- Segnali di attenzione da monitorare`,

  tacticalAnalysis: `
Stai fornendo un'analisi tattica approfondita. Includi:

ANALISI FORMAZIONE:
1. Descrizione del sistema di gioco
2. Punti di forza e vantaggi tattici
3. Possibili debolezze e contromisure avversarie
4. Ruoli e responsabilità di ogni posizione

APPLICAZIONE PRATICA:
- Come allenare questa tattica
- Progressione didattica consigliata
- Esercizi specifici per automatizzare i movimenti
- Variazioni durante la partita

ADATTAMENTI:
- Come modificare in base agli avversari
- Transizioni offensive e defensive
- Situazioni speciali (inferiorità/superiorità numerica)`,

  motivationalCoaching: `
Stai fornendo supporto motivazionale e psicologico. Includi:

GESTIONE DEL GRUPPO:
1. Tecniche di motivazione positive
2. Gestione delle dinamiche di squadra
3. Comunicazione efficace con i giocatori
4. Creazione di un ambiente positivo

SVILUPPO INDIVIDUALE:
- Come valorizzare ogni giocatore
- Gestione di giocatori in difficoltà
- Sviluppo della leadership nel gruppo
- Bilanciamento tra pressione e supporto

APPROCCIO PSICOLOGICO:
- Gestione stress pre-gara
- Costruzione della fiducia
- Resilienza alle sconfitte
- Celebrazione dei successi`,

  injuryPrevention: `
Stai fornendo consigli per prevenzione infortuni e recupero. Includi:

PREVENZIONE:
1. Protocolli di riscaldamento specifici
2. Esercizi di propriocezione e stabilità
3. Gestione del carico di allenamento
4. Segnali di affaticamento da monitorare

RECUPERO:
- Protocolli di defaticamento
- Tecniche di recupero attivo
- Importanza del riposo e del sonno
- Idratazione e alimentazione base

IMPORTANTE: Non fornire mai diagnosi mediche o trattamenti specifici.
Rimanda sempre al medico sportivo per situazioni cliniche.`,
};

// Utility functions per formattazione date
export function formatDateIT(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatDateTimeIT(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Funzione principale per costruire il prompt completo
export function buildCompletePrompt(
  context: AIContext,
  userMessage: string,
  promptType: keyof typeof SPECIALIZED_PROMPTS = 'trainingPlan'
): string {
  const specializedPrompt = SPECIALIZED_PROMPTS[promptType] || '';
  
  return `${KORA_IDENTITY}

${CONTEXT_TEMPLATES.teamContext(context)}

${CONTEXT_TEMPLATES.recentActivities(context.recentActivities)}

${CONTEXT_TEMPLATES.playerIssues(context.playerIssues)}

${CONTEXT_TEMPLATES.conversationMemory(context.previousMessages)}

${RESPONSE_GUIDELINES}

${specializedPrompt}

RICHIESTA DELL'ALLENATORE: ${userMessage}

Rispondi in modo utile, pratico e personalizzato per questa squadra specifica. Mantieni un tono professionale ma amichevole e motivante.`;
}

// Rate limiting per tier
export const RATE_LIMITS: Record<UserTier, { daily: number; concurrent: number }> = {
  FREE: { daily: 5, concurrent: 1 },
  LEVEL1: { daily: 20, concurrent: 2 },
  PREMIUM: { daily: 100, concurrent: 5 },
};

// Token limits per tier  
export const TOKEN_LIMITS: Record<UserTier, { maxTokens: number; maxHistory: number }> = {
  FREE: { maxTokens: 500, maxHistory: 3 },
  LEVEL1: { maxTokens: 1000, maxHistory: 10 },
  PREMIUM: { maxTokens: 2000, maxHistory: 20 },
};