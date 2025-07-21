import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ImportPlayerSchema = z.object({
  firstName: z.string().min(1, 'Nome richiesto'),
  lastName: z.string().min(1, 'Cognome richiesto'),
  birthDate: z.string().datetime('Data di nascita non valida'),
  number: z.number().int().min(1).max(99).optional(),
  role: z.string().optional(),
  height: z.number().int().min(100).max(250).optional(),
  weight: z.number().int().min(20).max(200).optional(),
  playerEmail: z.string().email().optional().or(z.literal('')),
  parent1Name: z.string().optional(),
  parent1Phone: z.string().optional(),
  parent1Email: z.string().email().optional().or(z.literal('')),
  parent2Name: z.string().optional(),
  parent2Phone: z.string().optional(), 
  parent2Email: z.string().email().optional().or(z.literal('')),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalNotes: z.string().optional(),
  importedAt: z.string().datetime().optional()
})

const BulkImportSchema = z.object({
  players: z.array(ImportPlayerSchema),
  skipDuplicates: z.boolean().default(true)
})

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params
    const body = await request.json()

    // Validate request body
    const validation = BulkImportSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { players, skipDuplicates } = validation.data

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

    const results = {
      totalRows: players.length,
      successCount: 0,
      errorCount: 0,
      errors: [] as Array<{
        row: number
        field: string
        value: string
        error: string
      }>
    }

    // Get existing jersey numbers for the team
    const existingPlayers = await prisma.player.findMany({
      where: { teamId },
      select: { number: true, firstName: true, lastName: true, birthDate: true }
    })

    const usedNumbers = new Set(existingPlayers.map(p => p.number).filter(Boolean))
    
    // Process each player
    for (let i = 0; i < players.length; i++) {
      const playerData = players[i]
      const rowNumber = i + 1

      try {
        // Check for duplicate jersey number
        if (playerData.number && usedNumbers.has(playerData.number)) {
          if (skipDuplicates) {
            results.errorCount++
            results.errors.push({
              row: rowNumber,
              field: 'Numero maglia',
              value: playerData.number.toString(),
              error: 'Numero già utilizzato'
            })
            continue
          }
        }

        // Check for duplicate player (same name and birth date)
        if (skipDuplicates) {
          const duplicate = existingPlayers.find(p => 
            p.firstName.toLowerCase() === playerData.firstName.toLowerCase() &&
            p.lastName.toLowerCase() === playerData.lastName.toLowerCase() &&
            p.birthDate.toDateString() === new Date(playerData.birthDate).toDateString()
          )

          if (duplicate) {
            results.errorCount++
            results.errors.push({
              row: rowNumber,
              field: 'Giocatore',
              value: `${playerData.firstName} ${playerData.lastName}`,
              error: 'Giocatore già esistente'
            })
            continue
          }
        }

        // Create player record
        const createdPlayer = await prisma.player.create({
          data: {
            teamId,
            firstName: playerData.firstName,
            lastName: playerData.lastName,
            birthDate: new Date(playerData.birthDate),
            number: playerData.number,
            role: playerData.role,
            height: playerData.height,
            weight: playerData.weight,
            playerEmail: playerData.playerEmail || null,
            parent1Name: playerData.parent1Name,
            parent1Phone: playerData.parent1Phone,
            parent1Email: playerData.parent1Email || null,
            parent2Name: playerData.parent2Name,
            parent2Phone: playerData.parent2Phone,
            parent2Email: playerData.parent2Email || null,
            emergencyContact: playerData.emergencyContact,
            emergencyPhone: playerData.emergencyPhone,
            medicalNotes: playerData.medicalNotes,
            importedAt: playerData.importedAt ? new Date(playerData.importedAt) : new Date(),
            status: 'ACTIVE'
          }
        })

        // Add to used numbers set
        if (playerData.number) {
          usedNumbers.add(playerData.number)
        }

        results.successCount++

      } catch (error) {
        results.errorCount++
        results.errors.push({
          row: rowNumber,
          field: 'Generale',
          value: `${playerData.firstName} ${playerData.lastName}`,
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        })
      }
    }

    // Create import history record
    await prisma.importHistory.create({
      data: {
        teamId,
        userId: 'system', // TODO: Get actual user ID from session/auth
        filename: `import_${new Date().toISOString()}.csv`,
        totalRows: results.totalRows,
        successCount: results.successCount,
        errorCount: results.errorCount,
        errors: results.errors,
        canUndo: true,
        undoExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // +24 hours
      }
    })

    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}