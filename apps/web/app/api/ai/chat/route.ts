import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/supabase/auth';
import { assistantClient, TeamContext, AssistantError } from '@/lib/openai/assistant-client';
import { prisma } from '@/lib/prisma';
import { UserTier } from '@prisma/client';

// Rate limits per tier
const RATE_LIMITS = {
  FREE: { daily: 5 },
  LEVEL1: { daily: 20 },
  PREMIUM: { daily: 100 },
} as const;

interface ChatRequest {
  message: string;
  teamId: string;
  teamContext: TeamContext;
  threadId?: string;
}

interface ChatResponse {
  success: boolean;
  threadId?: string;
  runId?: string;
  remainingRequests?: number;
  error?: string;
  errorCode?: string;
}

// Cache per rate limiting in memoria (in produzione usare Redis)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    // Autenticazione
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato', errorCode: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse richiesta
    const body: ChatRequest = await request.json();
    const { message, teamId, teamContext, threadId } = body;

    // Validazione input
    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Messaggio richiesto', errorCode: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'ID squadra richiesto', errorCode: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // Verifica permessi sul team
    const hasAccess = await verifyTeamAccess(teamId, user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Accesso negato alla squadra', errorCode: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Ottieni dati utente per rate limiting
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { tier: true },
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Utente non trovato', errorCode: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(user.id, userData.tier);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Limite giornaliero raggiunto (${RATE_LIMITS[userData.tier].daily} richieste/giorno)`,
          errorCode: 'RATE_LIMITED',
          remainingRequests: 0,
        },
        { status: 429 }
      );
    }

    // Ottieni o crea thread per la conversazione
    let activeThreadId = threadId;
    
    if (!activeThreadId) {
      const threadInfo = await assistantClient.getOrCreateThread(user.id, teamId);
      activeThreadId = threadInfo.threadId;
    }

    // Invia messaggio all'Assistant
    const { runId } = await assistantClient.sendMessage(
      activeThreadId,
      message,
      teamContext
    );

    // Aggiorna contatori
    await assistantClient.updateMessageCount(user.id, teamId);
    await updateRateLimit(user.id, userData.tier);

    return NextResponse.json({
      success: true,
      threadId: activeThreadId,
      runId,
      remainingRequests: Math.max(0, RATE_LIMITS[userData.tier].daily - rateLimitResult.currentCount - 1),
    });

  } catch (error: any) {
    console.error('Errore API Chat Assistant:', error);

    // Gestione errori specifici dell'Assistant
    if (error.message?.includes(AssistantError.RATE_LIMITED)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hai raggiunto il limite giornaliero di richieste',
          errorCode: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    if (error.message?.includes(AssistantError.ASSISTANT_UNAVAILABLE)) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI Coach temporaneamente non disponibile',
          errorCode: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    if (error.message?.includes(AssistantError.CONTEXT_TOO_LONG)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversazione troppo lunga, iniziane una nuova',
          errorCode: 'CONTEXT_TOO_LONG',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        errorCode: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// GET endpoint per recuperare messaggi o controllare thread
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const latest = searchParams.get('latest') === 'true';

    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID richiesto' }, { status: 400 });
    }

    if (latest) {
      // Recupera solo l'ultimo messaggio dell'Assistant
      const message = await assistantClient.getLatestAssistantMessage(threadId);
      return NextResponse.json({ 
        success: true,
        message 
      });
    } else {
      // Recupera tutti i messaggi del thread
      const messages = await assistantClient.getThreadMessages(threadId);
      return NextResponse.json({ 
        success: true,
        messages 
      });
    }

  } catch (error) {
    console.error('Errore GET Chat Assistant:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}

// DELETE endpoint per eliminare thread
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID richiesto' }, { status: 400 });
    }

    await assistantClient.deleteThread(user.id, teamId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Thread eliminato con successo' 
    });

  } catch (error) {
    console.error('Errore DELETE Chat Assistant:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}

// Utility functions
async function verifyTeamAccess(teamId: string, userId: string): Promise<boolean> {
  const access = await prisma.team.findFirst({
    where: {
      id: teamId,
      OR: [
        { coachId: userId }, // Owner
        { assistants: { some: { userId } } }, // Assistant
      ],
    },
  });

  return !!access;
}

async function checkRateLimit(userId: string, tier: UserTier): Promise<{
  allowed: boolean;
  currentCount: number;
}> {
  const today = new Date().toDateString();
  const cacheKey = `${userId}-${today}`;
  
  const cached = rateLimitCache.get(cacheKey);
  const limit = RATE_LIMITS[tier].daily;

  if (!cached) {
    // Prima richiesta di oggi
    return { allowed: true, currentCount: 0 };
  }

  if (cached.count >= limit) {
    return { allowed: false, currentCount: cached.count };
  }

  return { allowed: true, currentCount: cached.count };
}

async function updateRateLimit(userId: string, tier: UserTier): Promise<void> {
  const today = new Date().toDateString();
  const cacheKey = `${userId}-${today}`;
  
  const cached = rateLimitCache.get(cacheKey) || { count: 0, resetTime: 0 };
  
  rateLimitCache.set(cacheKey, {
    count: cached.count + 1,
    resetTime: new Date().setHours(23, 59, 59, 999), // Reset a mezzanotte
  });
}

// Cleanup rate limit cache periodico
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitCache.entries()) {
    if (now > value.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Ogni ora