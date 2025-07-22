import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus, AbsenceReason, CheckInMethod } from '@prisma/client'

// PUT /api/attendance/[id] - Update specific attendance record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, arrivalTime, departureTime, absenceReason, isJustified, justification, note, checkedInVia } = body

    // Verifica che il record di attendance esista
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        player: true,
        training: true,
      },
    })

    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Record di presenza non trovato' },
        { status: 404 }
      )
    }

    // Aggiorna il record
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: {
        status: status as AttendanceStatus,
        arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
        departureTime: departureTime ? new Date(departureTime) : null,
        absenceReason: absenceReason as AbsenceReason,
        isJustified: isJustified || false,
        justification,
        note,
        checkedInVia: checkedInVia as CheckInMethod || existingAttendance.checkedInVia,
        updatedAt: new Date(),
      },
      include: {
        player: true,
      },
    })

    return NextResponse.json({
      id: updatedAttendance.id,
      playerId: updatedAttendance.playerId,
      status: updatedAttendance.status,
      arrivalTime: updatedAttendance.arrivalTime?.toISOString(),
      departureTime: updatedAttendance.departureTime?.toISOString(),
      absenceReason: updatedAttendance.absenceReason,
      isJustified: updatedAttendance.isJustified,
      justification: updatedAttendance.justification,
      note: updatedAttendance.note,
      checkedInVia: updatedAttendance.checkedInVia,
      player: {
        id: updatedAttendance.player.id,
        firstName: updatedAttendance.player.firstName,
        lastName: updatedAttendance.player.lastName,
        number: updatedAttendance.player.number,
        role: updatedAttendance.player.role,
        profileImage: updatedAttendance.player.profileImage,
      },
    })
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/attendance/[id] - Reset attendance to default
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.attendance.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}