'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon, XIcon, UserIcon, ExternalLinkIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/badge'
import { AttendanceStatus } from '@prisma/client'

interface Player {
  id: string
  firstName: string
  lastName: string
  number?: number
  role?: string
  profileImage?: string
}

interface Attendance {
  playerId: string
  status: AttendanceStatus
  note?: string
}

interface AttendanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trainingId: string
  teamId: string
}

export function AttendanceModal({
  open,
  onOpenChange,
  trainingId,
  teamId,
}: AttendanceModalProps) {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [attendances, setAttendances] = useState<Record<string, Attendance>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  // Carica dati quando si apre il modal
  const fetchAttendanceData = async () => {
    if (!open) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}/attendance`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel caricamento delle presenze')
      }
      
      const data = await response.json()
      
      // Estrai i giocatori dai dati di attendance
      const playersData = data.attendances.map((att: any) => att.player)
      setPlayers(playersData)
      
      // Imposta gli attendance
      const attendanceMap = data.attendances.reduce((acc: Record<string, Attendance>, att: any) => {
        acc[att.playerId] = {
          playerId: att.playerId,
          status: att.status,
          note: att.note,
        }
        return acc
      }, {})
      
      setAttendances(attendanceMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [open, teamId, trainingId])

  const toggleAttendance = (playerId: string) => {
    setAttendances((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        status: prev[playerId].status === 'PRESENT' ? 'ABSENT' : 'PRESENT',
      },
    }))
  }

  const setAllPresent = (present: boolean) => {
    setAttendances((prev) =>
      Object.keys(prev).reduce((acc, playerId) => ({
        ...acc,
        [playerId]: { ...prev[playerId], status: present ? 'PRESENT' : 'ABSENT' },
      }), {})
    )
  }

  const updateNote = (playerId: string, note: string) => {
    setAttendances((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        note: note.trim() || undefined,
      },
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Salva tutte le presenze
      const savePromises = Object.values(attendances).map(async (attendance) => {
        const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}/attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attendance),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Errore nel salvataggio')
        }
      })
      
      await Promise.all(savePromises)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving attendances:', error)
      setError(error instanceof Error ? error.message : 'Errore nel salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase()
    return fullName.includes(filter.toLowerCase())
  })

  const presentCount = Object.values(attendances).filter((a) => a.status === 'PRESENT').length
  const absentCount = Object.values(attendances).filter((a) => a.status === 'ABSENT').length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Registra Presenze</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2Icon className="h-5 w-5 animate-spin" />
              <span>Caricamento presenze...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <XIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchAttendanceData} variant="outline">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Riprova
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 pb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-green-100">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  {presentCount} presenti
                </Badge>
                <Badge variant="secondary" className="bg-red-100">
                  <XIcon className="h-3 w-3 mr-1" />
                  {absentCount} assenti
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAllPresent(true)}
                >
                  Tutti presenti
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAllPresent(false)}
                >
                  Tutti assenti
                </Button>
              </div>
            </div>

            <Input
              placeholder="Cerca giocatore..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mb-4"
            />
          </div>

          <div className="space-y-2">
            {filteredPlayers.map((player) => {
              const attendance = attendances[player.id]
              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border ${
                    attendance.status === 'PRESENT'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          attendance.status === 'PRESENT'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        onClick={() => toggleAttendance(player.id)}
                      >
                        {attendance.status === 'PRESENT' ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <XIcon className="h-5 w-5" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {player.firstName} {player.lastName}
                          </span>
                          {player.number && (
                            <Badge variant="outline" className="text-xs">
                              #{player.number}
                            </Badge>
                          )}
                          {player.role && (
                            <Badge variant="secondary" className="text-xs">
                              {player.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Input
                      placeholder="Nota..."
                      value={attendance.note || ''}
                      onChange={(e) => updateNote(player.id, e.target.value)}
                      className="w-48"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        )}

        <DialogFooter className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              router.push(`/teams/${teamId}/trainings/${trainingId}/attendance`)
              onOpenChange(false)
            }}
            className="flex items-center gap-2"
            disabled={loading || saving}
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Modalità Avanzata
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={loading || saving}>
              {saving ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                'Salva Presenze'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}