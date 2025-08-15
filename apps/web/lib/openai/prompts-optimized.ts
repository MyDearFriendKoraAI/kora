import { UserTier, SportType } from '@prisma/client';

// ===== TYPES =====
export type RequestType = 'training' | 'tactical' | 'injury' | 'motivation' | 'match' | 'general';

export interface TeamData {
  name: string;
  sport: SportType;
  category: string;
  totalPlayers: number;
  activePlayers: number;
  injuredCount: number;
  avgAge?: number;
  daysSinceTraining?: number;
  nextOpponent?: string;
  recentForm?: string;
  weeklyLoad?: string;
  lastIssue?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface PromptValidation {
  isValid: boolean;
  tokens: number;
  overhead: number;
  suggestion?: string;
}

// ===== CORE IDENTITY (ULTRA-CONCISO) =====
const KORA_IDENTITY_MINI = `Kora: AI coach sportivo per allenatori italiani.
Esperto in: allenamenti, tattica, preparazione fisica, psicologia sport.
Stile: pratico, motivante, professionale.
Mai diagnosi mediche. Priorità sicurezza.`;

// ===== SPORT NAMES (MINIMAL) =====
const SPORT_MINI: Record<SportType, string> = {
  CALCIO: 'Calcio',
  BASKET: 'Basket', 
  PALLAVOLO: 'Volley',
  TENNIS: 'Tennis',
  RUGBY: 'Rugby',
  ALTRO: 'Sport',
};

// ===== FOCUS DIRECTIVES (20-30 TOKEN MAX) =====
const FOCUS_DIRECTIVES: Record<RequestType, string> = {
  training: "Output: riscaldamento(10'), centrale(30'), defatic(10'). Includi: esercizi, tempi, varianti livello.",
  tactical: "Output: sistema gioco, pro/contro, 3 esercizi pratici, adattamenti partita.", 
  injury: "Output: analisi causa, prevenzione, piano recupero. NO diagnosi mediche.",
  motivation: "Output: strategie motivazione, gestione gruppo, comunicazione efficace.",
  match: "Output: preparazione pre-gara, tattica specifica, gestione stress.",
  general: "Output: consigli pratici e implementabili subito. Sii specifico."
};

// ===== REQUEST CLASSIFIER =====
export function classifyRequest(message: string): RequestType {
  const patterns: Record<RequestType, RegExp> = {
    training: /allenament|training|seduta|eserciz|riscaldament|preparaz|fisic/i,
    tactical: /tattic|modulo|schema|formazione|sistema|4-3-3|3-5-2|difes|attacc/i,
    injury: /infortun|recuper|prevenzion|dolore|male|fisio|terapia/i,
    motivation: /motivaz|moral|gruppo|team building|confident|mental|psicolog/i,
    match: /partita|gara|match|avversari|domenica|sabato|competiz/i,
    general: /.*/
  };
  
  // Controlla pattern in ordine di priorità
  for (const [type, pattern] of Object.entries(patterns)) {
    if (type !== 'general' && pattern.test(message)) {
      return type as RequestType;
    }
  }
  return 'general';
}

// ===== SMART CONTEXT BUILDER =====
export function buildSmartContext(data: TeamData, requestType: RequestType): string {
  const sport = SPORT_MINI[data.sport];
  const activePercent = Math.round((data.activePlayers / data.totalPlayers) * 100);
  
  // Base context (sempre incluso)
  let context = `${sport} ${data.category}, ${data.activePlayers}/${data.totalPlayers} (${activePercent}%)`;
  
  // Context specifico per tipo richiesta
  switch (requestType) {
    case 'training':
      if (data.daysSinceTraining !== undefined) {
        context += `, ultimo: ${data.daysSinceTraining}gg fa`;
      }
      break;
      
    case 'tactical':
    case 'match':
      if (data.nextOpponent) {
        context += `, vs ${data.nextOpponent}`;
      }
      if (data.recentForm) {
        context += `, forma: ${data.recentForm}`;
      }
      break;
      
    case 'injury':
      context += `, ${data.injuredCount} infortunati`;
      if (data.weeklyLoad) {
        context += `, carico: ${data.weeklyLoad}`;
      }
      break;
      
    case 'motivation':
      if (data.recentForm && data.recentForm.includes('P')) {
        context += `, momento difficile`;
      }
      break;
  }
  
  // Aggiunge issue critico se presente
  if (data.lastIssue) {
    context += `\n⚠️ ${data.lastIssue}`;
  }
  
  return context;
}

// ===== HISTORY SUMMARIZER =====
function needsHistory(requestType: RequestType): boolean {
  // Solo per richieste che beneficiano del contesto precedente
  return ['general', 'motivation', 'tactical'].includes(requestType);
}

function summarizeHistory(history: Message[], maxTokens: number = 100): string {
  if (!history.length) return '';
  
  // Prendi solo ultimi 2-3 scambi più rilevanti
  const recent = history.slice(-4);
  const summary = recent
    .map(m => `${m.role === 'user' ? 'Q' : 'A'}: ${m.content.substring(0, 80)}`)
    .join('\n');
    
  // Truncate se supera limite
  return summary.length > maxTokens * 4 
    ? summary.substring(0, maxTokens * 4) + '...'
    : summary;
}

// ===== DYNAMIC PROMPT ASSEMBLY =====
export function assemblePrompt(
  userMessage: string,
  teamData: TeamData,
  history?: Message[]
): string {
  const requestType = classifyRequest(userMessage);
  
  // 1. Base identity (100 token)
  let prompt = KORA_IDENTITY_MINI;
  
  // 2. Smart context (50-70 token)
  prompt += '\n\n' + buildSmartContext(teamData, requestType);
  
  // 3. History summary se rilevante (max 100 token)
  if (history?.length && needsHistory(requestType)) {
    const historySum = summarizeHistory(history, 80);
    if (historySum) {
      prompt += '\n\nPrecedente:\n' + historySum;
    }
  }
  
  // 4. Focus directive (20-30 token)
  prompt += '\n\n' + FOCUS_DIRECTIVES[requestType];
  
  // 5. User request
  prompt += '\n\nRichiesta: ' + userMessage;
  
  return prompt;
}

// ===== TOKEN ESTIMATION =====
function estimateTokens(text: string): number {
  // Stima approssimativa: 1 token ≈ 4 caratteri per l'italiano
  return Math.ceil(text.length / 3.5);
}

function getUserMessage(prompt: string): string {
  const match = prompt.match(/Richiesta: (.+)$/);
  return match ? match[1] : '';
}

// ===== TOKEN LIMITS PER TIER =====
const TOKEN_LIMITS: Record<UserTier, { maxPrompt: number; maxResponse: number }> = {
  FREE: { maxPrompt: 200, maxResponse: 300 },
  LEVEL1: { maxPrompt: 400, maxResponse: 600 },
  PREMIUM: { maxPrompt: 600, maxResponse: 1200 },
};

// ===== PROMPT VALIDATION =====
export function validatePrompt(prompt: string, tier: UserTier): PromptValidation {
  const tokens = estimateTokens(prompt);
  const limits = TOKEN_LIMITS[tier];
  const userMessage = getUserMessage(prompt);
  const overhead = tokens - estimateTokens(userMessage);
  
  return {
    isValid: tokens <= limits.maxPrompt,
    tokens,
    overhead,
    suggestion: tokens > limits.maxPrompt 
      ? `Riduci contesto o usa richiesta più specifica (${tokens}/${limits.maxPrompt} token)`
      : undefined
  };
}

// ===== CONTEXT DATA MAPPER =====
export function mapToTeamData(context: any): TeamData {
  return {
    name: context.team?.name || 'Squadra',
    sport: context.team?.sport || 'ALTRO',
    category: context.team?.category || 'Standard',
    totalPlayers: context.stats?.totalPlayers || 0,
    activePlayers: context.stats?.activePlayers || 0,
    injuredCount: context.stats?.injuredPlayers || 0,
    daysSinceTraining: context.stats?.lastTrainingDate 
      ? Math.floor((Date.now() - new Date(context.stats.lastTrainingDate).getTime()) / (1000 * 60 * 60 * 24))
      : undefined,
    nextOpponent: context.recentActivities?.upcomingMatches?.[0]?.opponent,
    recentForm: context.stats?.recentForm,
    lastIssue: context.playerIssues?.injuries > 0 
      ? `${context.playerIssues.injuries} infortunati`
      : context.playerIssues?.lowAttendance?.length > 0
      ? `Bassa presenza: ${context.playerIssues.lowAttendance[0]?.playerName}`
      : undefined
  };
}

// ===== MAIN EXPORT FUNCTION =====
export function buildOptimizedPrompt(
  context: any,
  userMessage: string,
  tier: UserTier,
  history?: Message[]
): { prompt: string; validation: PromptValidation; requestType: RequestType } {
  const teamData = mapToTeamData(context);
  const prompt = assemblePrompt(userMessage, teamData, history);
  const validation = validatePrompt(prompt, tier);
  const requestType = classifyRequest(userMessage);
  
  return { prompt, validation, requestType };
}

// ===== EXAMPLES FOR TESTING =====
export const OPTIMIZATION_EXAMPLES = {
  training: {
    input: "Prepara allenamento tecnico per domani",
    expectedTokens: 80,
    expectedType: 'training' as RequestType
  },
  tactical: {
    input: "Come affrontare il 4-3-3 avversario?", 
    expectedTokens: 75,
    expectedType: 'tactical' as RequestType
  },
  injury: {
    input: "Come prevenire infortuni muscolari?",
    expectedTokens: 70,
    expectedType: 'injury' as RequestType
  }
};