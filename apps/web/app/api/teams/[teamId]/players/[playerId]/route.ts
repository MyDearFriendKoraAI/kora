import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { calculateAge } from '@/lib/utils/age-calculator'

const updatePlayerSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  birthDate: z.string().transform((str) => new Date(str)).optional(),
  number: z.number().min(1).max(99).optional(),
  role: z.string().optional(),
  status: z.enum(['ACTIVE', 'INJURED', 'SUSPENDED']).optional(),
  preferredFoot: z.enum(['LEFT', 'RIGHT', 'BOTH']).optional(),
  technicalNotes: z.string().optional(),
  playerEmail: z.string().email().optional().or(z.literal('')),
  parent1Name: z.string().optional(),
  parent1Phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  profileImage: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  injuryReturnDate: z.string().transform((str) => new Date(str)).optional(),
})

// GET /api/teams/[teamId]/players/[playerId]
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string; playerId: string } }
) {
  try {
    const { teamId, playerId } = params

    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        teamId,
        isArchived: false,
      },
      include: {
        _count: {
          select: {
            attendances: {
              where: {
                status: 'PRESENT',
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        },
        attendances: {
          include: {
            training: {
              select: {
                date: true,
                type: true,
              },
            },
          },
          orderBy: {
            training: {
              date: 'desc',
            },
          },
          take: 10, // Ultime 10 presenze
        },
      },
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Giocatore non trovato' },
        { status: 404 }
      )
    }

    // Trasforma risposta con dettagli completi
    const response = {
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      birthDate: player.birthDate.toISOString(),
      age: calculateAge(player.birthDate),
      number: player.number,
      role: player.role,
      status: player.status.toLowerCase(),
      profileImage: player.profileImage,
      preferredFoot: player.preferredFoot?.toLowerCase(),
      technicalNotes: player.technicalNotes,
      playerEmail: player.playerEmail,
      parentName: player.parent1Name,
      parentPhone: player.parent1Phone,
      emergencyContact: player.emergencyContact,
      height: player.height,
      weight: player.weight,
      injuryReturnDate: player.injuryReturnDate?.toISOString(),
      attendanceLastMonth: player._count.attendances,
      recentAttendances: player.attendances.map((attendance) => ({
        id: attendance.id,
        status: attendance.status,
        note: attendance.note,
        date: attendance.training.date.toISOString(),
        trainingType: attendance.training.type,
      })),
      createdAt: player.createdAt.toISOString(),
      updatedAt: player.updatedAt.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/teams/[teamId]/players/[playerId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string; playerId: string } }
) {
  try {
    const { teamId, playerId } = params
    const body = await request.json()

    // Validazione dati
    const validatedData = updatePlayerSchema.parse(body)

    // Verifica che il giocatore esista
    const existingPlayer = await prisma.player.findFirst({
      where: {
        id: playerId,
        teamId,
        isArchived: false,
      },
    })

    if (!existingPlayer) {
      return NextResponse.json(
        { error: 'Giocatore non trovato' },
        { status: 404 }
      )
    }

    // Verifica età se birthDate è aggiornata
    if (validatedData.birthDate) {
      const age = calculateAge(validatedData.birthDate)
      if (age < 5) {
        return NextResponse.json(
          { error: 'Il giocatore deve avere almeno 5 anni' },
          { status: 400 }
        )
      }
    }

    // Verifica numero maglia unico se cambiato
    if (validatedData.number && validatedData.number !== existingPlayer.number) {
      const conflictingPlayer = await prisma.player.findFirst({
        where: {
          teamId,
          number: validatedData.number,
          isArchived: false,
          NOT: {
            id: playerId,
          },
        },
      })

      if (conflictingPlayer) {
        return NextResponse.json(
          { error: `Il numero ${validatedData.number} è già assegnato` },
          { status: 400 }
        )
      }
    }

    // Aggiorna giocatore
    const updatedPlayer = await prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        ...validatedData,
        status: validatedData.status as any,
        preferredFoot: validatedData.preferredFoot as any,
      },
      include: {
        _count: {
          select: {
            attendances: {
              where: {
                status: 'PRESENT',
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        },
      },
    })

    // Trasforma risposta
    const response = {
      id: updatedPlayer.id,
      firstName: updatedPlayer.firstName,
      lastName: updatedPlayer.lastName,
      birthDate: updatedPlayer.birthDate.toISOString(),
      age: calculateAge(updatedPlayer.birthDate),
      number: updatedPlayer.number,
      role: updatedPlayer.role,
      status: updatedPlayer.status.toLowerCase(),
      profileImage: updatedPlayer.profileImage,
      preferredFoot: updatedPlayer.preferredFoot?.toLowerCase(),
      technicalNotes: updatedPlayer.technicalNotes,
      playerEmail: updatedPlayer.playerEmail,
      parentName: updatedPlayer.parent1Name,
      parentPhone: updatedPlayer.parent1Phone,
      emergencyContact: updatedPlayer.emergencyContact,
      height: updatedPlayer.height,
      weight: updatedPlayer.weight,
      injuryReturnDate: updatedPlayer.injuryReturnDate?.toISOString(),
      attendanceLastMonth: updatedPlayer._count.attendances,
      createdAt: updatedPlayer.createdAt.toISOString(),
      updatedAt: updatedPlayer.updatedAt.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating player:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[teamId]/players/[playerId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string; playerId: string } }
) {
  try {
    const { teamId, playerId } = params

    // Verifica che il giocatore esista
    const existingPlayer = await prisma.player.findFirst({
      where: {
        id: playerId,
        teamId,
        isArchived: false,
      },
    })

    if (!existingPlayer) {
      return NextResponse.json(
        { error: 'Giocatore non trovato' },
        { status: 404 }
      )
    }

    // Soft delete (archivia)
    await prisma.player.update({
      where: {
        id: playerId,
      },
      data: {
        isArchived: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}