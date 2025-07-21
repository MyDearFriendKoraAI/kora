import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { z } from 'zod'

const ExportQuerySchema = z.object({
  format: z.enum(['csv', 'excel']).default('excel'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  category: z.string().optional(),
  includeParents: z.boolean().default(true),
  includeMedical: z.boolean().default(false)
})

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const queryValidation = ExportQuerySchema.safeParse({
      format: searchParams.get('format'),
      status: searchParams.get('status'),
      category: searchParams.get('category'),
      includeParents: searchParams.get('includeParents') === 'true',
      includeMedical: searchParams.get('includeMedical') === 'true'
    })

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Parametri non validi' },
        { status: 400 }
      )
    }

    const { format, status, category, includeParents, includeMedical } = queryValidation.data

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { name: true, sport: true }
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Squadra non trovata' },
        { status: 404 }
      )
    }

    // Build query filters
    const where: any = { teamId }
    if (status) where.status = status
    if (category) where.category = category

    // Fetch players with related data
    const players = await prisma.player.findMany({
      where,
      include: includeMedical ? {
        medicalRecords: true
      } : {},
      orderBy: [
        { number: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    // Prepare export data
    const headers = [
      'Nome',
      'Cognome', 
      'Data di nascita',
      'Età',
      'Numero maglia',
      'Ruolo',
      'Altezza (cm)',
      'Peso (kg)',
      'Email',
      'Categoria',
      'Stato'
    ]

    // Add parent contact headers if requested
    if (includeParents) {
      headers.push(
        'Nome genitore 1',
        'Telefono genitore 1',
        'Email genitore 1',
        'Nome genitore 2', 
        'Telefono genitore 2',
        'Email genitore 2',
        'Contatto emergenza',
        'Telefono emergenza'
      )
    }

    // Add medical headers if requested
    if (includeMedical) {
      headers.push(
        'Note mediche',
        'Allergie',
        'Farmaci',
        'Infortuni recenti'
      )
    }

    // Transform players data
    const exportData = players.map(player => {
      const age = new Date().getFullYear() - new Date(player.birthDate).getFullYear()
      
      const row = [
        player.firstName,
        player.lastName,
        player.birthDate.toLocaleDateString('it-IT'),
        age.toString(),
        player.number?.toString() || '',
        player.role || '',
        player.height?.toString() || '',
        player.weight?.toString() || '',
        player.playerEmail || '',
        player.category || '',
        player.status
      ]

      // Add parent data if requested
      if (includeParents) {
        row.push(
          player.parent1Name || '',
          player.parent1Phone || '',
          player.parent1Email || '',
          player.parent2Name || '',
          player.parent2Phone || '',
          player.parent2Email || '',
          player.emergencyContact || '',
          player.emergencyPhone || ''
        )
      }

      // Add medical data if requested
      if (includeMedical) {
        const recentInjuries = includeMedical && player.medicalRecords 
          ? player.medicalRecords
              .filter(record => record.type === 'INJURY')
              .slice(0, 3)
              .map(record => `${record.description} (${record.date.toLocaleDateString('it-IT')})`)
              .join('; ')
          : ''

        row.push(
          player.medicalNotes || '',
          player.allergies || '',
          player.medications || '',
          recentInjuries
        )
      }

      return row
    })

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData])
    const wb = XLSX.utils.book_new()
    
    // Set column widths
    const columnWidths = headers.map((header, index) => {
      if (header.includes('Email') || header.includes('Note')) return { wch: 25 }
      if (header.includes('Nome') || header.includes('Cognome')) return { wch: 15 }
      if (header.includes('Data') || header.includes('Telefono')) return { wch: 12 }
      return { wch: 10 }
    })
    
    ws['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Giocatori')

    // Add summary sheet
    const summaryData = [
      ['RIEPILOGO ESPORTAZIONE'],
      [''],
      ['Squadra:', team.name],
      ['Sport:', team.sport],
      ['Data esportazione:', new Date().toLocaleDateString('it-IT')],
      ['Totale giocatori:', players.length.toString()],
      [''],
      ['DISTRIBUZIONE PER STATO:'],
      ...Object.entries(
        players.reduce((acc, player) => {
          acc[player.status] = (acc[player.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([status, count]) => [`${status}:`, count.toString()]),
      [''],
      ['DISTRIBUZIONE PER CATEGORIA:'],
      ...Object.entries(
        players.reduce((acc, player) => {
          const cat = player.category || 'Non specificata'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([category, count]) => [`${category}:`, count.toString()])
    ]

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Riepilogo')

    // Generate file
    const fileName = `${team.name.replace(/[^a-zA-Z0-9]/g, '_')}_giocatori_${new Date().toISOString().slice(0, 10)}`
    
    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(ws)
      
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}.csv"`
        }
      })
    } else {
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}.xlsx"`
        }
      })
    }

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'esportazione' },
      { status: 500 }
    )
  }
}