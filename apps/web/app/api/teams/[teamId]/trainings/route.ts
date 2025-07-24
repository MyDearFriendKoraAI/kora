import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const teamId = params.teamId;

    // Verify user owns this team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: user.id,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team non trovato' }, { status: 404 });
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
      teamId: teamId,
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
    console.error('Error fetching team trainings:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli allenamenti' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const teamId = params.teamId;

    // Verify user owns this team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: user.id,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team non trovato' }, { status: 404 });
    }

    const body = await request.json();
    
    // Parse date and time
    const trainingDate = new Date(body.date);
    const [hours, minutes] = body.startTime.split(':');
    trainingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Create training
    const training = await prisma.training.create({
      data: {
        teamId: teamId,
        date: trainingDate,
        duration: body.duration,
        type: body.type,
        location: body.location,
        focusAreas: body.focusAreas || [],
        plannedPlayers: body.plannedPlayers,
        plan: body.plan || null,
        coachNotes: body.coachNotes,
        status: 'SCHEDULED',
        createdBy: user.id,
      },
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
      }
    });

    return NextResponse.json(training);
  } catch (error) {
    console.error('Error creating training:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'allenamento' },
      { status: 500 }
    );
  }
}