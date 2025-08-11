import { NextRequest, NextResponse } from 'next/server';
import { generateCoachSuggestion } from '@/lib/openai/client';
import { auth } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, teamContext, sessionType, maxTokens, temperature } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt richiesto' }, { status: 400 });
    }

    const result = await generateCoachSuggestion(prompt, {
      teamContext,
      sessionType,
      maxTokens,
      temperature,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Errore API AI Coach:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}