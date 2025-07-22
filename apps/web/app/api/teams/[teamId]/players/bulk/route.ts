import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const BulkActionSchema = z.object({
  playerIds: z.array(z.string()).min(1, 'Almeno un giocatore richiesto'),
  action: z.enum(['archive', 'activate', 'delete', 'assignCategory', 'updateStatus']),
  data: z.object({
    category: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional()
  }).optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params
    const body = await request.json()

    // Validate request body
    const validation = BulkActionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { playerIds, action, data } = validation.data

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Squadra non trovata' },
        { status: 404 }
      )
    }

    // Verify all players belong to the team
    const players = await prisma.player.findMany({
      where: {
        id: { in: playerIds },
        teamId
      }
    })

    if (players.length !== playerIds.length) {
      return NextResponse.json(
        { error: 'Alcuni giocatori non appartengono alla squadra' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    let successMessage = ''

    // Prepare update based on action
    switch (action) {
      case 'archive':
        updateData = { status: 'ARCHIVED' }
        successMessage = `${players.length} giocatori archiviati`
        break
        
      case 'activate':
        updateData = { status: 'ACTIVE' }
        successMessage = `${players.length} giocatori attivati`
        break
        
      case 'delete':
        // For delete, we'll soft delete by setting status to ARCHIVED
        // and adding a deletedAt timestamp
        updateData = { 
          status: 'ARCHIVED',
          deletedAt: new Date()
        }
        successMessage = `${players.length} giocatori eliminati`
        break
        
      case 'assignCategory':
        if (!data?.category) {
          return NextResponse.json(
            { error: 'Categoria richiesta per questa operazione' },
            { status: 400 }
          )
        }
        updateData = { category: data.category }
        successMessage = `Categoria "${data.category}" assegnata a ${players.length} giocatori`
        break
        
      case 'updateStatus':
        if (!data?.status) {
          return NextResponse.json(
            { error: 'Stato richiesto per questa operazione' },
            { status: 400 }
          )
        }
        updateData = { status: data.status }
        successMessage = `Stato "${data.status}" assegnato a ${players.length} giocatori`
        break
        
      default:
        return NextResponse.json(
          { error: 'Azione non valida' },
          { status: 400 }
        )
    }

    // Perform bulk update
    const updateResult = await prisma.player.updateMany({
      where: {
        id: { in: playerIds },
        teamId
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    // Log the bulk operation
    await prisma.importHistory.create({
      data: {
        teamId,
        userId: 'system', // TODO: Get actual user ID from session/auth
        filename: `bulk_${action}_${new Date().toISOString()}.log`,
        totalRows: playerIds.length,
        successCount: updateResult.count,
        errorCount: playerIds.length - updateResult.count,
        errors: updateResult.count !== playerIds.length 
          ? [{ 
              row: 0, 
              field: 'Bulk Operation', 
              value: action, 
              error: 'Alcuni aggiornamenti non sono riusciti' 
            }] 
          : [],
        canUndo: false,
        undoExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // +24 hours
      }
    })

    return NextResponse.json({
      success: true,
      message: successMessage,
      updatedCount: updateResult.count,
      totalRequested: playerIds.length
    })

  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'operazione di massa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params
    const { searchParams } = new URL(request.url)
    const playerIds = searchParams.get('ids')?.split(',') || []

    if (playerIds.length === 0) {
      return NextResponse.json(
        { error: 'Nessun giocatore specificato per l\'eliminazione' },
        { status: 400 }
      )
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Squadra non trovata' },
        { status: 404 }
      )
    }

    // Instead of hard delete, we soft delete by archiving
    const deleteResult = await prisma.player.updateMany({
      where: {
        id: { in: playerIds },
        teamId
      },
      data: {
        status: 'ARCHIVED',
        isArchived: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} giocatori eliminati`,
      deletedCount: deleteResult.count
    })

  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione' },
      { status: 500 }
    )
  }
}