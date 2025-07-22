import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus, AbsenceReason, CheckInMethod } from '@prisma/client'

// GET /api/teams/[teamId]/trainings/[trainingId]/attendance
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string; trainingId: string } }
) {
  try {
    const { teamId, trainingId } = params

    // Verifica che il training esista e appartenga al team
    const training = await prisma.training.findFirst({
      where: {
        id: trainingId,
        teamId,
      },
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Allenamento non trovato' },
        { status: 404 }
      )
    }

    // Ottieni tutti i giocatori del team
    const players = await prisma.player.findMany({
      where: {
        teamId,
        isArchived: false,
      },
      orderBy: [
        { number: 'asc' },
        { lastName: 'asc' },
      ],
    })

    // Ottieni le presenze esistenti per questo training
    const existingAttendances = await prisma.attendance.findMany({
      where: {
        trainingId,
      },
      include: {
        player: true,
      },
    })

    // Crea mappa delle presenze esistenti
    const attendanceMap = new Map(
      existingAttendances.map(att => [att.playerId, att])
    )

    // Costruisci la lista completa con presenze o default
    const attendances = players.map(player => {
      const existingAttendance = attendanceMap.get(player.id)
      
      if (existingAttendance) {
        return {
          id: existingAttendance.id,
          playerId: player.id,
          status: existingAttendance.status,
          arrivalTime: existingAttendance.arrivalTime,
          departureTime: existingAttendance.departureTime,
          absenceReason: existingAttendance.absenceReason,
          isJustified: existingAttendance.isJustified,
          justification: existingAttendance.justification,
          note: existingAttendance.note,
          checkedInVia: existingAttendance.checkedInVia,
          player: {
            id: player.id,
            firstName: player.firstName,
            lastName: player.lastName,
            number: player.number,
            role: player.role,
            profileImage: player.profileImage,
          },
        }
      } else {
        // Crea record di presenza di default
        return {
          id: null, // Sarà creato quando salvato
          playerId: player.id,
          status: 'PRESENT' as AttendanceStatus,
          arrivalTime: null,
          departureTime: null,
          absenceReason: null,
          isJustified: false,
          justification: null,
          note: null,
          checkedInVia: 'MANUAL' as CheckInMethod,
          player: {
            id: player.id,
            firstName: player.firstName,
            lastName: player.lastName,
            number: player.number,
            role: player.role,
            profileImage: player.profileImage,
          },
        }
      }
    })

    return NextResponse.json({
      training: {
        id: training.id,
        type: training.type,
        date: training.date.toISOString(),
        duration: training.duration,
        location: training.location,
      },
      attendances,
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST/PUT /api/teams/[teamId]/trainings/[trainingId]/attendance
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string; trainingId: string } }
) {
  try {
    const { teamId, trainingId } = params
    const body = await request.json()
    const { playerId, status, arrivalTime, departureTime, absenceReason, isJustified, justification, note, checkedInVia } = body

    // Verifica che il training esista
    const training = await prisma.training.findFirst({
      where: {
        id: trainingId,
        teamId,
      },
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Allenamento non trovato' },
        { status: 404 }
      )
    }

    // Verifica che il giocatore appartenga al team
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        teamId,
        isArchived: false,
      },
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Giocatore non trovato' },
        { status: 404 }
      )
    }

    // Upsert attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        playerId_trainingId: {
          playerId,
          trainingId,
        },
      },
      update: {
        status: status as AttendanceStatus,
        arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
        departureTime: departureTime ? new Date(departureTime) : null,
        absenceReason: absenceReason as AbsenceReason,
        isJustified: isJustified || false,
        justification,
        note,
        checkedInVia: checkedInVia as CheckInMethod || 'MANUAL',
        updatedAt: new Date(),
      },
      create: {
        playerId,
        trainingId,
        status: status as AttendanceStatus,
        arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
        departureTime: departureTime ? new Date(departureTime) : null,
        absenceReason: absenceReason as AbsenceReason,
        isJustified: isJustified || false,
        justification,
        note,
        checkedInVia: checkedInVia as CheckInMethod || 'MANUAL',
      },
      include: {
        player: true,
      },
    })

    return NextResponse.json({
      id: attendance.id,
      playerId: attendance.playerId,
      status: attendance.status,
      arrivalTime: attendance.arrivalTime?.toISOString(),
      departureTime: attendance.departureTime?.toISOString(),
      absenceReason: attendance.absenceReason,
      isJustified: attendance.isJustified,
      justification: attendance.justification,
      note: attendance.note,
      checkedInVia: attendance.checkedInVia,
      player: {
        id: attendance.player.id,
        firstName: attendance.player.firstName,
        lastName: attendance.player.lastName,
        number: attendance.player.number,
        role: attendance.player.role,
        profileImage: attendance.player.profileImage,
      },
    })
  } catch (error) {
    console.error('Error saving attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}