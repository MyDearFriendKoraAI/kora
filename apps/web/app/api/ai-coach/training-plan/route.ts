import { NextRequest, NextResponse } from 'next/server';
import { generateTrainingPlan } from '@/lib/openai/client';
import { auth } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const body = await request.json();
    const { sport, duration, focus, playersCount } = body;

    if (!sport || !duration || !focus || !playersCount) {
      return NextResponse.json(
        { error: 'Parametri richiesti: sport, duration, focus, playersCount' },
        { status: 400 }
      );
    }

    const result = await generateTrainingPlan(sport, duration, focus, playersCount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Errore API Training Plan:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}