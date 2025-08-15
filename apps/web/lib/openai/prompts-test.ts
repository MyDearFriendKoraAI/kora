import { 
  classifyRequest, 
  buildOptimizedPrompt, 
  validatePrompt,
  OPTIMIZATION_EXAMPLES
} from './prompts-optimized';

// Mock team data per testing
const mockTeamData = {
  team: {
    name: "Juventus U16",
    sport: "CALCIO" as const,
    category: "Under 16",
    season: "2024/2025"
  },
  stats: {
    totalPlayers: 20,
    activePlayers: 18,
    injuredPlayers: 2,
    averageAttendance: 85,
    lastTrainingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 giorni fa
    recentForm: "VVPVV"
  },
  recentActivities: {
    upcomingMatches: [{
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      opponent: "Milan U16",
      location: "Campo Juventus",
      isHome: true
    }]
  },
  playerIssues: {
    injuries: 2,
    lowAttendance: [{
      playerName: "Marco Rossi",
      attendanceRate: 45
    }]
  }
};

// Test function
export function runOptimizationTests() {
  console.log("🧪 TESTING PROMPT OPTIMIZATION SYSTEM\n");

  // Test 1: Request Classification
  console.log("1️⃣ Request Classification:");
  const testMessages = [
    "Prepara allenamento tecnico per domani",
    "Come affrontare il 4-3-3 avversario?",
    "Come prevenire infortuni muscolari?",
    "I giocatori sono demotivati dopo la sconfitta",
    "Strategia per la partita di domenica",
    "Dimmi qualcosa sulla squadra"
  ];

  testMessages.forEach(msg => {
    const type = classifyRequest(msg);
    console.log(`  "${msg}" → ${type}`);
  });

  // Test 2: Token Optimization per esempi
  console.log("\n2️⃣ Token Optimization Examples:");
  Object.entries(OPTIMIZATION_EXAMPLES).forEach(([key, example]) => {
    const result = buildOptimizedPrompt(
      mockTeamData,
      example.input,
      'PREMIUM'
    );
    
    const isWithinTarget = result.validation.tokens <= example.expectedTokens + 20; // 20 token tolerance
    const status = isWithinTarget ? "✅" : "❌";
    
    console.log(`  ${status} ${key}:`);
    console.log(`    Input: "${example.input}"`);
    console.log(`    Type: ${result.requestType} (expected: ${example.expectedType})`);
    console.log(`    Tokens: ${result.validation.tokens} (target: ~${example.expectedTokens})`);
    console.log(`    Efficiency: ${result.validation.validation.efficiency}`);
  });

  // Test 3: Tier Validation
  console.log("\n3️⃣ Tier Validation:");
  const complexMessage = "Analizza in dettaglio la tattica 4-3-3 contro il 3-5-2, preparando un piano completo con variazioni per ogni fase di gioco";
  
  (['FREE', 'LEVEL1', 'PREMIUM'] as const).forEach(tier => {
    const result = buildOptimizedPrompt(mockTeamData, complexMessage, tier);
    const status = result.validation.isValid ? "✅" : "❌";
    console.log(`  ${status} ${tier}: ${result.validation.tokens} tokens (${result.validation.isValid ? 'valid' : 'exceeded'})`);
  });

  // Test 4: Esempio prompt finale
  console.log("\n4️⃣ Sample Optimized Prompt:");
  const sampleResult = buildOptimizedPrompt(
    mockTeamData,
    "Prepara allenamento tecnico per domani",
    'PREMIUM'
  );
  
  console.log("```");
  console.log(sampleResult.prompt);
  console.log("```");
  console.log(`\nToken count: ${sampleResult.validation.tokens}`);
  console.log(`Overhead: ${sampleResult.validation.overhead} tokens`);
  console.log(`Efficiency: ${sampleResult.validation.optimization.efficiency}`);

  return {
    totalTests: 4,
    classification: testMessages.length,
    optimization: Object.keys(OPTIMIZATION_EXAMPLES).length,
    validation: 3,
    sample: 1
  };
}

// Performance comparison (per debug)
export function compareOptimization(message: string) {
  const optimized = buildOptimizedPrompt(mockTeamData, message, 'PREMIUM');
  
  // Simula prompt vecchio (molto più verboso)
  const oldStyleLength = optimized.validation.tokens * 4; // 4x più lungo
  const reduction = Math.round((1 - optimized.validation.tokens / oldStyleLength) * 100);
  
  return {
    oldTokens: oldStyleLength,
    newTokens: optimized.validation.tokens,
    reduction: `${reduction}%`,
    type: optimized.requestType,
    efficiency: optimized.validation.optimization.efficiency
  };
}