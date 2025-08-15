import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/supabase/auth';
import { assistantClient } from '@/lib/openai/assistant-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const runId = searchParams.get('runId');

    if (!threadId || !runId) {
      return NextResponse.json({ 
        error: 'Thread ID e Run ID richiesti' 
      }, { status: 400 });
    }

    const status = await assistantClient.checkRunStatus(threadId, runId);
    
    return NextResponse.json({ 
      success: true,
      status 
    });

  } catch (error) {
    console.error('Errore controllo status run:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}