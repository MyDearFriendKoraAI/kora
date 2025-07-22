'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  UsersIcon,
  GridIcon,
  ListIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  RefreshCwIcon,
  QrCodeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowLeftIcon,
  UndoIcon,
  Loader2Icon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { AttendanceStatus, AbsenceReason } from '@prisma/client'
import { AttendanceCard } from '@/components/features/attendance/attendance-card'
import { AttendanceStats } from '@/components/features/attendance/attendance-stats'
import { QuickMarkButtons } from '@/components/features/attendance/quick-mark-buttons'
import { AbsenceJustificationModal } from '@/components/features/attendance/absence-justification-modal'
import { AttendanceDetailModal } from '@/components/features/attendance/attendance-detail-modal'
import { QRCheckInModal } from '@/components/features/attendance/qr-checkin-modal'

interface Player {
  id: string
  firstName: string
  lastName: string
  number?: number
  role?: string
  profileImage?: string
}

interface AttendanceRecord {
  id: string | null
  playerId: string
  status: AttendanceStatus
  arrivalTime?: string
  departureTime?: string
  absenceReason?: AbsenceReason
  isJustified: boolean
  justification?: string
  note?: string
  player: Player
}

interface Training {
  id: string
  type: string
  date: string
  duration: number
  location: string
}

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  const trainingId = params.trainingId as string
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [showJustificationModal, setShowJustificationModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null)
  const [undoAction, setUndoAction] = useState<{
    playerId: string
    oldStatus: AttendanceStatus
    timestamp: number
  } | null>(null)

  // Carica dati dal database
  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}/attendance`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel caricamento delle presenze')
      }
      
      const data = await response.json()
      setTraining(data.training)
      setAttendances(data.attendances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [teamId, trainingId])

  useEffect(() => {
    // Auto-hide undo dopo 5 secondi
    if (undoAction) {
      const timer = setTimeout(() => {
        setUndoAction(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [undoAction])

  const presentCount = attendances.filter(a => a.status === 'PRESENT').length
  const lateCount = attendances.filter(a => a.status === 'LATE').length
  const totalPlayers = attendances.length
  const presentPercentage = Math.round(((presentCount + lateCount) / totalPlayers) * 100)

  const handleStatusChange = (playerId: string, newStatus: AttendanceStatus) => {
    setAttendances(prev => prev.map(attendance => {
      if (attendance.playerId === playerId) {
        // Salva per undo
        setUndoAction({
          playerId,
          oldStatus: attendance.status,
          timestamp: Date.now()
        })
        
        return { ...attendance, status: newStatus }
      }
      return attendance
    }))
    
    // Salva nel database
    saveAttendance(playerId, newStatus)
  }

  const handleUndoAction = () => {
    if (undoAction) {
      setAttendances(prev => prev.map(attendance => {
        if (attendance.playerId === undoAction.playerId) {
          return { ...attendance, status: undoAction.oldStatus }
        }
        return attendance
      }))
      
      // Salva nel database
      saveAttendance(undoAction.playerId, undoAction.oldStatus)
      setUndoAction(null)
    }
  }

  const handleMarkAllPresent = () => {
    setAttendances(prev => prev.map(attendance => 
      attendance.status === 'ABSENT' 
        ? { ...attendance, status: 'PRESENT' }
        : attendance
    ))
  }

  const handlePlayerLongPress = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance)
    setShowDetailModal(true)
  }

  const handlePlayerSelect = (playerId: string, selected: boolean) => {
    if (selected) {
      setSelectedPlayers(prev => [...prev, playerId])
    } else {
      setSelectedPlayers(prev => prev.filter(id => id !== playerId))
    }
  }

  const handleBulkJustification = () => {
    if (selectedPlayers.length > 0) {
      setShowJustificationModal(true)
    }
  }

  const saveAttendance = async (playerId: string, status: AttendanceStatus, additionalData?: Partial<AttendanceRecord>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/trainings/${trainingId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          status,
          ...additionalData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel salvataggio della presenza')
      }

      const updatedAttendance = await response.json()
      
      // Aggiorna il record locale
      setAttendances(prev => prev.map(attendance => 
        attendance.playerId === playerId 
          ? { ...attendance, ...updatedAttendance }
          : attendance
      ))
    } catch (error) {
      console.error('Error saving attendance:', error)
      // Ripristina lo stato precedente in caso di errore
      if (undoAction) {
        setAttendances(prev => prev.map(attendance => 
          attendance.playerId === playerId 
            ? { ...attendance, status: undoAction.oldStatus }
            : attendance
        ))
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-2">
            <Loader2Icon className="h-5 w-5 animate-spin" />
            <span>Caricamento presenze...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/teams/${teamId}/trainings/${trainingId}`)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Indietro
          </Button>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <XIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Errore nel caricamento</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAttendanceData}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Riprova
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!training) {
    return null
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/teams/${teamId}/trainings/${trainingId}`)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Presenze Allenamento</h1>
            <p className="text-gray-600">
              {training.type} • {format(new Date(training.date), 'EEEE d MMMM yyyy, HH:mm', { locale: it })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQRModal(true)}
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            QR Check-in
          </Button>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Live Counter */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {presentCount + lateCount} di {totalPlayers} presenti
              </span>
              <Badge 
                variant={presentPercentage >= 75 ? 'default' : presentPercentage >= 50 ? 'secondary' : 'destructive'}
                className="text-lg px-3 py-1"
              >
                {presentPercentage}%
              </Badge>
            </div>
            
            {presentPercentage >= 75 ? (
              <TrendingUpIcon className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDownIcon className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckIcon className="h-4 w-4 text-green-600" />
            {presentCount} presenti
            <ClockIcon className="h-4 w-4 text-orange-600" />
            {lateCount} in ritardo
            <XIcon className="h-4 w-4 text-red-600" />
            {totalPlayers - presentCount - lateCount} assenti
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <QuickMarkButtons
        onMarkAllPresent={handleMarkAllPresent}
        onBulkJustification={handleBulkJustification}
        selectedCount={selectedPlayers.length}
        className="mb-6"
      />

      {/* Undo Action */}
      {undoAction && (
        <Card className="p-3 mb-4 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <span className="text-sm">Presenza modificata</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndoAction}
            >
              <UndoIcon className="h-4 w-4 mr-2" />
              Annulla
            </Button>
          </div>
        </Card>
      )}

      {/* Statistics */}
      <AttendanceStats attendances={attendances} className="mb-6" />

      {/* Players Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-2"
      }>
        {attendances.map((attendance) => (
          <AttendanceCard
            key={attendance.playerId}
            attendance={attendance}
            viewMode={viewMode}
            selected={selectedPlayers.includes(attendance.playerId)}
            onStatusChange={handleStatusChange}
            onLongPress={handlePlayerLongPress}
            onSelect={handlePlayerSelect}
          />
        ))}
      </div>

      {/* Modals */}
      <AbsenceJustificationModal
        open={showJustificationModal}
        onOpenChange={setShowJustificationModal}
        selectedPlayers={selectedPlayers.map(id => 
          attendances.find(a => a.playerId === id)?.player
        ).filter(Boolean) as Player[]}
        onJustify={(reason, justification) => {
          // Handle justification
          console.log('Justifying absences:', { reason, justification })
          setSelectedPlayers([])
          setShowJustificationModal(false)
        }}
      />

      <AttendanceDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        attendance={selectedAttendance}
        onUpdate={(updatedAttendance) => {
          setAttendances(prev => prev.map(a => 
            a.playerId === updatedAttendance.playerId ? updatedAttendance : a
          ))
        }}
      />

      <QRCheckInModal
        open={showQRModal}
        onOpenChange={setShowQRModal}
        trainingId={trainingId}
      />
    </div>
  )
}