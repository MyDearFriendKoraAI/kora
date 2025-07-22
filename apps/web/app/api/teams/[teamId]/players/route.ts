import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { calculateAge } from '@/lib/utils/age-calculator'

const createPlayerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  birthDate: z.string().transform((str) => new Date(str)),
  number: z.number().min(1).max(99),
  role: z.string(),
  preferredFoot: z.enum(['LEFT', 'RIGHT', 'BOTH']).optional(),
  technicalNotes: z.string().optional(),
  playerEmail: z.string().email().optional().or(z.literal('')),
  parent1Name: z.string().optional(),
  parent1Phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  profileImage: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
})

// GET /api/teams/[teamId]/players
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'firstName'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Verifica che l'utente abbia accesso al team
    // TODO: Implementare autenticazione e autorizzazione

    const whereClause: any = {
      teamId,
      isArchived: false,
    }

    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase()
    }

    if (search) {
      whereClause.OR = [
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ]
    }

    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.firstName = sortOrder
    } else if (sortBy === 'number') {
      orderBy.number = sortOrder
    } else if (sortBy === 'role') {
      orderBy.role = sortOrder
    } else if (sortBy === 'age') {
      orderBy.birthDate = sortOrder === 'asc' ? 'desc' : 'asc' // Più giovani = data più recente
    }

    const players = await prisma.player.findMany({
      where: whereClause,
      orderBy,
      include: {
        _count: {
          select: {
            attendances: {
              where: {
                status: 'PRESENT',
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Ultimo mese
                },
              },
            },
          },
        },
      },
    })

    // Trasforma i dati per il frontend
    const playersWithStats = players.map((player) => ({
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
      createdAt: player.createdAt.toISOString(),
      updatedAt: player.updatedAt.toISOString(),
    }))

    return NextResponse.json(playersWithStats)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/teams/[teamId]/players
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params
    const body = await request.json()

    // Validazione dati
    const validatedData = createPlayerSchema.parse(body)

    // Verifica età minima
    const age = calculateAge(validatedData.birthDate)
    if (age < 5) {
      return NextResponse.json(
        { error: 'Il giocatore deve avere almeno 5 anni' },
        { status: 400 }
      )
    }

    // Verifica numero maglia unico nel team
    if (validatedData.number) {
      const existingPlayer = await prisma.player.findFirst({
        where: {
          teamId,
          number: validatedData.number,
          isArchived: false,
        },
      })

      if (existingPlayer) {
        return NextResponse.json(
          { error: `Il numero ${validatedData.number} è già assegnato` },
          { status: 400 }
        )
      }
    }

    // Verifica limite giocatori per tier
    const playersCount = await prisma.player.count({
      where: {
        teamId,
        isArchived: false,
      },
    })

    // TODO: Implementare controllo tier da user subscription
    const playerLimit = 20 // FREE tier
    if (playersCount >= playerLimit) {
      return NextResponse.json(
        { error: `Limite di ${playerLimit} giocatori raggiunto` },
        { status: 400 }
      )
    }

    // Crea giocatore
    const newPlayer = await prisma.player.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        birthDate: validatedData.birthDate,
        number: validatedData.number,
        role: validatedData.role,
        preferredFoot: validatedData.preferredFoot,
        technicalNotes: validatedData.technicalNotes,
        playerEmail: validatedData.playerEmail || null,
        parent1Name: validatedData.parent1Name,
        parent1Phone: validatedData.parent1Phone,
        emergencyContact: validatedData.emergencyContact,
        profileImage: validatedData.profileImage,
        height: validatedData.height,
        weight: validatedData.weight,
        teamId,
      },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    })

    // Trasforma risposta
    const response = {
      id: newPlayer.id,
      firstName: newPlayer.firstName,
      lastName: newPlayer.lastName,
      birthDate: newPlayer.birthDate.toISOString(),
      age: calculateAge(newPlayer.birthDate),
      number: newPlayer.number,
      role: newPlayer.role,
      status: newPlayer.status.toLowerCase(),
      profileImage: newPlayer.profileImage,
      preferredFoot: newPlayer.preferredFoot?.toLowerCase(),
      technicalNotes: newPlayer.technicalNotes,
      playerEmail: newPlayer.playerEmail,
      parentName: newPlayer.parent1Name,
      parentPhone: newPlayer.parent1Phone,
      emergencyContact: newPlayer.emergencyContact,
      height: newPlayer.height,
      weight: newPlayer.weight,
      injuryReturnDate: newPlayer.injuryReturnDate?.toISOString(),
      attendanceLastMonth: 0,
      createdAt: newPlayer.createdAt.toISOString(),
      updatedAt: newPlayer.updatedAt.toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}