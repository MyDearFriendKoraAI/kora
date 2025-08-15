import { prisma } from '@/lib/prisma';
import { AIContext } from './prompts';
import { UserTier, SportType, AttendanceStatus, PlayerStatus } from '@prisma/client';

interface ContextOptions {
  includeHistory?: boolean;
  maxHistoryMessages?: number;
  includePlayerDetails?: boolean;
}

export async function buildAIContext(
  teamId: string,
  userId: string,
  options: ContextOptions = {}
): Promise<AIContext> {
  const {
    includeHistory = true,
    maxHistoryMessages = 10,
    includePlayerDetails = true,
  } = options;

  try {
    // Query parallele per ottimizzare le performance
    const [
      teamData,
      userData,
      statsData,
      activitiesData,
      issuesData,
      historyData,
    ] = await Promise.all([
      getTeamData(teamId),
      getUserData(userId),
      getTeamStats(teamId),
      getRecentActivities(teamId),
      includePlayerDetails ? getPlayerIssues(teamId) : Promise.resolve(undefined),
      includeHistory ? getConversationHistory(userId, maxHistoryMessages) : Promise.resolve([]),
    ]);

    // Determina il ruolo dell'utente nel team
    const userRole = await determineUserRole(teamId, userId);

    return {
      team: teamData,
      userRole,
      userName: `${userData.nome} ${userData.cognome}`,
      userTier: userData.tier,
      stats: statsData,
      recentActivities: activitiesData,
      playerIssues: issuesData,
      previousMessages: historyData,
    };
  } catch (error) {
    console.error('Errore nella costruzione del contesto AI:', error);
    throw new Error('Impossibile costruire il contesto per l\'AI Coach');
  }
}

async function getTeamData(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      sport: true,
      category: true,
      season: true,
      homeField: true,
    },
  });

  if (!team) {
    throw new Error('Squadra non trovata');
  }

  return {
    id: team.id,
    name: team.name,
    sport: team.sport as SportType,
    category: team.category || 'Non specificata',
    season: team.season,
    homeField: team.homeField || undefined,
  };
}

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      nome: true,
      cognome: true,
      tier: true,
    },
  });

  if (!user) {
    throw new Error('Utente non trovato');
  }

  return user;
}

async function getTeamStats(teamId: string) {
  // Query parallele per le statistiche
  const [
    playersStats,
    attendanceStats,
    lastTraining,
    nextMatch,
  ] = await Promise.all([
    // Statistiche giocatori
    prisma.player.findMany({
      where: { teamId, isArchived: false },
      select: { status: true },
    }),
    
    // Statistiche presenze (ultimi 30 giorni)
    prisma.attendance.findMany({
      where: {
        training: {
          teamId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Ultimi 30 giorni
          },
        },
      },
      select: { status: true },
    }),

    // Ultimo allenamento
    prisma.training.findFirst({
      where: {
        teamId,
        date: { lte: new Date() },
        status: 'COMPLETED',
      },
      orderBy: { date: 'desc' },
      select: { date: true },
    }),

    // Prossima partita (se esiste)
    prisma.training.findFirst({
      where: {
        teamId,
        type: 'MATCH_PREP',
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      select: { date: true },
    }),
  ]);

  const totalPlayers = playersStats.length;
  const activePlayers = playersStats.filter(p => p.status === PlayerStatus.ACTIVE).length;
  const injuredPlayers = playersStats.filter(p => p.status === PlayerStatus.INJURED).length;

  // Calcola media presenze
  const totalAttendances = attendanceStats.length;
  const presentAttendances = attendanceStats.filter(a => 
    a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
  ).length;
  const averageAttendance = totalAttendances > 0 ? (presentAttendances / totalAttendances) * 100 : 0;

  return {
    totalPlayers,
    activePlayers,
    injuredPlayers,
    averageAttendance,
    lastTrainingDate: lastTraining?.date,
    nextMatchDate: nextMatch?.date,
    recentForm: undefined, // TODO: implementare se necessario
  };
}

async function getRecentActivities(teamId: string) {
  const [lastTrainings, upcomingMatches] = await Promise.all([
    // Ultimi 3 allenamenti completati
    prisma.training.findMany({
      where: {
        teamId,
        date: { lte: new Date() },
        status: 'COMPLETED',
      },
      orderBy: { date: 'desc' },
      take: 3,
      select: {
        date: true,
        type: true,
        focusAreas: true,
        attendances: {
          where: {
            status: {
              in: [AttendanceStatus.PRESENT, AttendanceStatus.LATE],
            },
          },
          select: { id: true },
        },
      },
    }),

    // Prossime 3 partite/eventi
    prisma.training.findMany({
      where: {
        teamId,
        date: { gte: new Date() },
        OR: [
          { type: 'MATCH_PREP' },
          { coachNotes: { contains: 'partita' } },
        ],
      },
      orderBy: { date: 'asc' },
      take: 3,
      select: {
        date: true,
        location: true,
        coachNotes: true,
      },
    }),
  ]);

  return {
    lastTrainings: lastTrainings.map(t => ({
      date: t.date,
      type: getTrainingTypeLabel(t.type),
      attendance: t.attendances.length,
      focus: t.focusAreas || [],
    })),
    upcomingMatches: upcomingMatches.map(m => ({
      date: m.date,
      opponent: extractOpponentFromNotes(m.coachNotes) || 'Da definire',
      location: m.location || 'Da definire',
      isHome: m.location?.toLowerCase().includes('casa') || 
              m.location?.toLowerCase().includes('home') || false,
    })),
  };
}

async function getPlayerIssues(teamId: string) {
  const [injuredPlayers, lowAttendancePlayers] = await Promise.all([
    // Giocatori infortunati
    prisma.player.count({
      where: {
        teamId,
        status: PlayerStatus.INJURED,
        isArchived: false,
      },
    }),

    // Giocatori con bassa presenza (sotto 60% negli ultimi 30 giorni)
    prisma.$queryRaw<Array<{
      firstName: string;
      lastName: string;
      attendance_rate: number;
    }>>`
      SELECT 
        p."firstName",
        p."lastName",
        COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END) as present_count,
        COUNT(a.id) as total_trainings,
        (COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0)) as attendance_rate
      FROM "players" p
      LEFT JOIN "attendances" a ON p.id = a."playerId"
      LEFT JOIN "trainings" t ON a."trainingId" = t.id
      WHERE p."teamId" = ${teamId}
        AND p."isArchived" = false
        AND p.status = 'ACTIVE'
        AND t.date >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p."firstName", p."lastName"
      HAVING COUNT(a.id) >= 3 
        AND (COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END) * 100.0 / COUNT(a.id)) < 60
      ORDER BY attendance_rate ASC
      LIMIT 5
    `,
  ]);

  return {
    injuries: injuredPlayers,
    lowAttendance: lowAttendancePlayers.map(p => ({
      playerName: `${p.firstName} ${p.lastName}`,
      attendanceRate: Number(p.attendance_rate),
    })),
  };
}

async function getConversationHistory(userId: string, maxMessages: number = 10) {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 1, // Solo l'ultima conversazione
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: maxMessages,
        select: {
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (conversations.length === 0) {
    return [];
  }

  // Inverti l'ordine per avere i messaggi dal più vecchio al più recente
  return conversations[0].messages
    .reverse()
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: m.createdAt,
    }));
}

async function determineUserRole(teamId: string, userId: string): Promise<'owner' | 'assistant'> {
  // Verifica se l'utente è il proprietario della squadra
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { coachId: true },
  });

  if (team?.coachId === userId) {
    return 'owner';
  }

  // Verifica se è un assistente
  const assistant = await prisma.teamAssistant.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  });

  if (assistant) {
    return 'assistant';
  }

  // Default a owner se non trova ruolo (per sicurezza)
  return 'owner';
}

// Utility functions
function getTrainingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    REGULAR: 'Allenamento regolare',
    MATCH_PREP: 'Preparazione partita',
    RECOVERY: 'Recupero',
    TACTICAL: 'Allenamento tattico',
    TECHNICAL: 'Allenamento tecnico',
    PHYSICAL: 'Preparazione fisica',
  };
  return labels[type] || type;
}

function extractOpponentFromNotes(notes: string | null): string | null {
  if (!notes) return null;
  
  // Semplice regex per estrarre opponent dalle note
  const match = notes.match(/vs\s+([^,.\n]+)/i) || 
                notes.match(/contro\s+([^,.\n]+)/i) ||
                notes.match(/avversario:?\s*([^,.\n]+)/i);
  
  return match ? match[1].trim() : null;
}

// Cache per ottimizzazione
const contextCache = new Map<string, { data: AIContext; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

export async function buildAIContextCached(
  teamId: string,
  userId: string,
  options: ContextOptions = {}
): Promise<AIContext> {
  const cacheKey = `${teamId}-${userId}-${JSON.stringify(options)}`;
  const cached = contextCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const context = await buildAIContext(teamId, userId, options);
  contextCache.set(cacheKey, { data: context, timestamp: Date.now() });

  return context;
}

// Cleanup cache periodico
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of contextCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      contextCache.delete(key);
    }
  }
}, CACHE_TTL);