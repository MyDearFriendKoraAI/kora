'use client'

import { useRouter } from 'next/navigation'
import { MoreVertical, Calendar, User, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlayerAvatar } from './player-avatar'
import { PlayerStatusBadge } from './player-status-badge'
import { calculateAge } from '@/lib/utils/age-calculator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PlayerCardProps {
  player: {
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
  teamId: string
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

export function PlayerCard({ player, teamId, isSelected = false, onSelect }: PlayerCardProps) {
  const router = useRouter()
  const age = player.age || calculateAge(player.birthDate)

  const handleClick = () => {
    router.push(`/teams/${teamId}/players/${player.id}`)
  }

  const handleAction = async (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    switch (action) {
      case 'edit':
        router.push(`/teams/${teamId}/players/${player.id}?edit=true`)
        break
      case 'injury':
        // TODO: Implementare modal infortunio specifico
        // Per ora segna semplicemente come infortunato
        try {
          const response = await fetch(`/api/teams/${teamId}/players/${player.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'INJURED',
              injuryReturnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +14 giorni
            }),
          })
          
          if (response.ok) {
            window.location.reload() // Temporaneo - da sostituire con state update
          } else {
            alert('Errore nell\'aggiornamento dello stato')
          }
        } catch (error) {
          console.error('Error updating player status:', error)
          alert('Errore nell\'aggiornamento dello stato')
        }
        break
      case 'archive':
        if (confirm(`Sei sicuro di voler archiviare ${player.firstName} ${player.lastName}?`)) {
          try {
            const response = await fetch(`/api/teams/${teamId}/players/${player.id}`, {
              method: 'DELETE',
            })
            
            if (response.ok) {
              window.location.reload() // Temporaneo - da sostituire con state update
            } else {
              alert('Errore nell\'archiviazione del giocatore')
            }
          } catch (error) {
            console.error('Error deleting player:', error)
            alert('Errore nell\'archiviazione del giocatore')
          }
        }
        break
    }
  }

  return (
    <Card 
      className={`p-4 hover:shadow-lg transition-all cursor-pointer relative ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect(e.target.checked)
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center gap-3 ${onSelect ? 'ml-6' : ''}`}>
          <PlayerAvatar
            firstName={player.firstName}
            lastName={player.lastName}
            profileImage={player.profileImage}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {player.firstName} {player.lastName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {player.number && (
                <>
                  <span className="font-medium">#{player.number}</span>
                  <span>•</span>
                </>
              )}
              <span>{player.role || 'Nessun ruolo'}</span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => handleAction(e, 'edit')}>
              Modifica
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleAction(e, 'injury')}>
              Segna infortunato
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleAction(e, 'archive')}
              className="text-red-600"
            >
              Archivia
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        <PlayerStatusBadge 
          status={player.status} 
          returnDate={player.injuryReturnDate || undefined}
        />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500">
            <User className="h-3.5 w-3.5" />
            <span>{age} anni</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>{player.attendanceLastMonth} presenze</span>
          </div>
        </div>

        {player.status === 'injured' && player.injuryReturnDate && (
          <div className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 p-2 rounded">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Rientro previsto: {new Date(player.injuryReturnDate).toLocaleDateString('it-IT')}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}