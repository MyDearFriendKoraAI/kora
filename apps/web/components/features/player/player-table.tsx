'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/checkbox'
import { PlayerAvatar } from './player-avatar'
import { PlayerStatusBadge } from './player-status-badge'
import { calculateAge } from '@/lib/utils/age-calculator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Player {
  id: string
  firstName: string
  lastName: string
  number: number | null
  role: string | null
  status: 'active' | 'injured' | 'suspended'
  birthDate: string
  age: number
  profileImage?: string | null
  attendanceLastMonth: number
  injuryReturnDate?: string | null
}

interface PlayerTableProps {
  players: Player[]
  teamId: string
  selectionMode?: boolean
  selectedPlayers?: string[]
  onSelectionChange?: (playerId: string) => void
  onSelectAll?: () => void
  onClearSelection?: () => void
}

export function PlayerTable({ 
  players, 
  teamId, 
  selectionMode = false,
  selectedPlayers = [],
  onSelectionChange,
  onSelectAll,
  onClearSelection 
}: PlayerTableProps) {
  const router = useRouter()

  const handleSelectAll = (checked: boolean) => {
    if (selectionMode && onSelectAll && onClearSelection) {
      if (checked) {
        onSelectAll()
      } else {
        onClearSelection()
      }
    }
  }

  const handleSelectPlayer = (playerId: string, checked: boolean) => {
    if (selectionMode && onSelectionChange) {
      onSelectionChange(playerId)
    }
  }

  const handleRowClick = (playerId: string) => {
    router.push(`/teams/${teamId}/players/${playerId}`)
  }

  return (
    <div className="space-y-4">
      {/* Tabella */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {selectionMode && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedPlayers.length === players.length && players.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Giocatore</TableHead>
              <TableHead className="hidden sm:table-cell">Numero</TableHead>
              <TableHead className="hidden md:table-cell">Ruolo</TableHead>
              <TableHead className="hidden lg:table-cell">Età</TableHead>
              <TableHead className="hidden xl:table-cell">Presenze</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => {
              const isSelected = selectedPlayers.includes(player.id)

              return (
                <TableRow
                  key={player.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(player.id)}
                >
                  {selectionMode && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleSelectPlayer(player.id, checked as boolean)
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <PlayerAvatar
                        firstName={player.firstName}
                        lastName={player.lastName}
                        profileImage={player.profileImage}
                        size="sm"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {player.firstName} {player.lastName}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden">
                          {player.number && `#${player.number} • `}{player.role || 'Nessun ruolo'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {player.number ? (
                      <span className="font-medium">#{player.number}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {player.role || <span className="text-gray-400">Nessun ruolo</span>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {player.age} anni
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {player.attendanceLastMonth}
                  </TableCell>
                  <TableCell>
                    <PlayerStatusBadge 
                      status={player.status}
                      returnDate={player.injuryReturnDate || undefined}
                      compact
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/teams/${teamId}/players/${player.id}?edit=true`)
                          }}
                        >
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              const response = await fetch(`/api/teams/${teamId}/players/${player.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  status: 'INJURED',
                                  injuryReturnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                                }),
                              })
                              
                              if (response.ok) {
                                window.location.reload()
                              } else {
                                alert('Errore nell\'aggiornamento dello stato')
                              }
                            } catch (error) {
                              console.error('Error updating player status:', error)
                              alert('Errore nell\'aggiornamento dello stato')
                            }
                          }}
                        >
                          Segna infortunato
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm(`Sei sicuro di voler archiviare ${player.firstName} ${player.lastName}?`)) {
                              try {
                                const response = await fetch(`/api/teams/${teamId}/players/${player.id}`, {
                                  method: 'DELETE',
                                })
                                
                                if (response.ok) {
                                  window.location.reload()
                                } else {
                                  alert('Errore nell\'archiviazione del giocatore')
                                }
                              } catch (error) {
                                console.error('Error deleting player:', error)
                                alert('Errore nell\'archiviazione del giocatore')
                              }
                            }
                          }}
                          className="text-red-600"
                        >
                          Archivia
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}