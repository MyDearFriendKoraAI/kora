import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'asc';
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whereCondition: any = {
      team: {
        coachId: user.id
      }
    };

    if (status === 'upcoming') {
      whereCondition.date = {
        gte: today
      };
    } else if (status === 'past') {
      whereCondition.date = {
        lt: today
      };
    }


    const [trainings, total] = await Promise.all([
      prisma.training.findMany({
        where: whereCondition,
        include: {
          team: {
            select: {
              id: true,
              name: true,
              sport: true,
              logo: true,
              colors: true
            }
          },
          _count: {
            select: {
              attendances: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        take: limit,
        skip: offset
      }),
      prisma.training.count({
        where: whereCondition
      })
    ]);


    return NextResponse.json({
      trainings: trainings || [],
      total: total || 0,
      hasMore: offset + trainings.length < total
    });
  } catch (error) {
    
    // Se è un errore di Prisma per tabella non trovata, restituisci array vuoto
    if ((error as any)?.code === 'P2021' || (error as any)?.message?.includes('does not exist')) {
      return NextResponse.json({
        trainings: [],
        total: 0,
        hasMore: false
      });
    }
    
    return NextResponse.json(
      { error: 'Errore nel recupero degli allenamenti' },
      { status: 500 }
    );
  }
}