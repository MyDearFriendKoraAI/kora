import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/openai/client';
import { buildAIContextCached } from '@/lib/openai/context-builder';
import { buildOptimizedPrompt } from '@/lib/openai/prompts-optimized';
import { RATE_LIMITS, TOKEN_LIMITS } from '@/lib/openai/prompts';
import { auth } from '@/lib/supabase/auth';
import { UserTier } from '@prisma/client';

interface ChatRequest {
  message: string;
  teamId: string;
  conversationId?: string;
  promptType?: 'trainingPlan' | 'tacticalAnalysis' | 'motivationalCoaching' | 'injuryPrevention';
}

interface ChatResponse {
  success: boolean;
  message?: string;
  conversationId?: string;
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
    const { message, teamId, conversationId, promptType = 'trainingPlan' } = body;

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

    // Verifica API key OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI Coach temporaneamente non disponibile',
          errorCode: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // Costruisci contesto AI
    const context = await buildAIContextCached(teamId, user.id, {
      includeHistory: true,
      maxHistoryMessages: TOKEN_LIMITS[userData.tier].maxHistory,
      includePlayerDetails: userData.tier !== 'FREE',
    });

    // Costruisci prompt ottimizzato
    const { prompt: completePrompt, validation, requestType } = buildOptimizedPrompt(
      context,
      message,
      userData.tier,
      context.previousMessages.slice(-4) // Solo ultimi 4 messaggi
    );

    // Valida token limits per tier
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.suggestion || 'Richiesta troppo lunga per il tuo piano',
          errorCode: 'PROMPT_TOO_LONG',
        },
        { status: 400 }
      );
    }

    // Chiamata a OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: completePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: TOKEN_LIMITS[userData.tier].maxTokens,
      user: `kora-${user.id}`, // Per tracking
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      return NextResponse.json(
        {
          success: false,
          error: 'Risposta vuota dall\'AI',
          errorCode: 'EMPTY_RESPONSE',
        },
        { status: 500 }
      );
    }

    // Salva conversazione nel database
    const savedConversation = await saveConversation(
      user.id,
      teamId,
      message,
      aiResponse,
      conversationId
    );

    // Aggiorna rate limit
    await updateRateLimit(user.id, userData.tier);

    return NextResponse.json({
      success: true,
      message: aiResponse,
      conversationId: savedConversation.conversationId,
      remainingRequests: Math.max(0, RATE_LIMITS[userData.tier].daily - rateLimitResult.currentCount - 1),
      metadata: {
        requestType,
        promptTokens: validation.tokens,
        optimization: {
          tokensUsed: validation.tokens,
          tokensOverhead: validation.overhead,
          efficiency: `${Math.round((1 - validation.overhead / validation.tokens) * 100)}%`
        }
      }
    });

  } catch (error: any) {
    console.error('Errore API Chat AI:', error);

    // Gestione errori specifici di OpenAI
    if (error.error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        {
          success: false,
          error: 'Limite di richieste OpenAI raggiunto. Riprova tra qualche minuto.',
          errorCode: 'OPENAI_RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    if (error.error?.code === 'insufficient_quota') {
      return NextResponse.json(
        {
          success: false,
          error: 'Quota OpenAI esaurita. Servizio temporaneamente non disponibile.',
          errorCode: 'OPENAI_QUOTA_EXCEEDED',
        },
        { status: 503 }
      );
    }

    if (error.error?.code === 'context_length_exceeded') {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversazione troppo lunga. Inizia una nuova chat.',
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

// GET endpoint per recuperare conversazioni
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (conversationId) {
      // Recupera conversazione specifica
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      });

      return NextResponse.json({ conversation });
    }

    // Recupera lista conversazioni per utente
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        titolo: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true },
        },
      },
    });

    return NextResponse.json({ conversations });

  } catch (error) {
    console.error('Errore GET Chat AI:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
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

async function saveConversation(
  userId: string,
  teamId: string,
  userMessage: string,
  aiResponse: string,
  conversationId?: string
): Promise<{ conversationId: string }> {
  let conversation;

  if (conversationId) {
    // Aggiungi messaggi a conversazione esistente
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversazione non trovata');
    }
  } else {
    // Crea nuova conversazione
    const title = generateConversationTitle(userMessage);
    conversation = await prisma.conversation.create({
      data: {
        userId,
        titolo: title,
      },
    });
  }

  // Salva messaggi
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: 'user',
        content: userMessage,
      },
      {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse,
      },
    ],
  });

  // Aggiorna timestamp conversazione
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return { conversationId: conversation.id };
}

function generateConversationTitle(firstMessage: string): string {
  const cleanMessage = firstMessage.trim().substring(0, 50);
  
  if (cleanMessage.toLowerCase().includes('allenamento')) {
    return `Allenamento - ${cleanMessage}`;
  }
  if (cleanMessage.toLowerCase().includes('tattica')) {
    return `Tattica - ${cleanMessage}`;
  }
  if (cleanMessage.toLowerCase().includes('motivazione')) {
    return `Motivazione - ${cleanMessage}`;
  }
  if (cleanMessage.toLowerCase().includes('infortunio')) {
    return `Infortuni - ${cleanMessage}`;
  }
  
  return cleanMessage + (cleanMessage.length === 50 ? '...' : '');
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