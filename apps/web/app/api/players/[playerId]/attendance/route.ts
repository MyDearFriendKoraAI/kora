import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/players/[playerId]/attendance - Get player attendance history
export async function GET(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const { playerId } = params
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '50')
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined

    // Verifica che il giocatore esista
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        isArchived: false,
      },
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Giocatore non trovato' },
        { status: 404 }
      )
    }

    // Costruisci filtro date
    let dateFilter: any = {}
    if (month !== undefined) {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59)
      dateFilter = {
        gte: startDate,
        lte: endDate,
      }
    } else {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year, 11, 31, 23, 59, 59)
      dateFilter = {
        gte: startDate,
        lte: endDate,
      }
    }

    // Ottieni lo storico presenze
    const attendances = await prisma.attendance.findMany({
      where: {
        playerId,
        training: {
          date: dateFilter,
        },
      },
      include: {
        training: {
          select: {
            id: true,
            type: true,
            date: true,
            location: true,
          },
        },
      },
      orderBy: {
        training: {
          date: 'desc',
        },
      },
      take: limit,
    })

    // Calcola statistiche
    const totalTrainings = attendances.length
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length
    const lateCount = attendances.filter(a => a.status === 'LATE').length
    const absentCount = attendances.filter(a => a.status === 'ABSENT').length
    const injuredCount = attendances.filter(a => a.status === 'INJURED').length
    
    const presentPercentage = totalTrainings > 0 ? Math.round(((presentCount + lateCount) / totalTrainings) * 100) : 0
    
    // Calcola trend (confronto con mese precedente se disponibile)
    const prevMonthStart = month !== undefined 
      ? new Date(year, month - 1, 1)
      : new Date(year - 1, 0, 1)
    const prevMonthEnd = month !== undefined
      ? new Date(year, month, 0, 23, 59, 59)  
      : new Date(year - 1, 11, 31, 23, 59, 59)

    const prevAttendances = await prisma.attendance.findMany({
      where: {
        playerId,
        training: {
          date: {
            gte: prevMonthStart,
            lte: prevMonthEnd,
          },
        },
      },
    })

    const prevTotalTrainings = prevAttendances.length
    const prevPresentCount = prevAttendances.filter(a => a.status === 'PRESENT').length
    const prevLateCount = prevAttendances.filter(a => a.status === 'LATE').length
    const prevPresentPercentage = prevTotalTrainings > 0 ? Math.round(((prevPresentCount + prevLateCount) / prevTotalTrainings) * 100) : 0
    
    const trend = presentPercentage - prevPresentPercentage

    const response = {
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        number: player.number,
        profileImage: player.profileImage,
      },
      stats: {
        totalTrainings,
        presentCount,
        lateCount,
        absentCount,
        injuredCount,
        presentPercentage,
        trend,
        isPositiveTrend: trend >= 0,
      },
      attendances: attendances.map(attendance => ({
        id: attendance.id,
        date: attendance.training.date.toISOString(),
        status: attendance.status,
        trainingType: attendance.training.type,
        note: attendance.note,
        isJustified: attendance.isJustified,
        justification: attendance.justification,
        arrivalTime: attendance.arrivalTime?.toISOString(),
        departureTime: attendance.departureTime?.toISOString(),
        absenceReason: attendance.absenceReason,
        training: {
          id: attendance.training.id,
          type: attendance.training.type,
          location: attendance.training.location,
        },
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching player attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}