'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, formatDistanceToNow, isSameDay, isAfter } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CloudIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  EditIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { TrainingType, TrainingStatus } from '@prisma/client'
import { AttendanceModal } from '@/components/features/training/attendance-modal'

const typeLabels: Record<TrainingType, string> = {
  REGULAR: 'Allenamento Regolare',
  MATCH_PREP: 'Preparazione Partita',
  RECOVERY: 'Recupero',
  TACTICAL: 'Tattico',
  TECHNICAL: 'Tecnico',
  PHYSICAL: 'Fisico',
}

const typeColors: Record<TrainingType, string> = {
  REGULAR: 'bg-blue-500',
  MATCH_PREP: 'bg-green-500',
  RECOVERY: 'bg-yellow-500',
  TACTICAL: 'bg-purple-500',
  TECHNICAL: 'bg-cyan-500',
  PHYSICAL: 'bg-red-500',
}

interface TrainingDetail {
  id: string
  type: TrainingType
  status: TrainingStatus
  date: Date
  duration: number
  location: string
  plannedPlayers: number
  coachNotes?: string
  plan?: {
    warmup: Array<{
      name: string
      duration: number
      description?: string
      materials?: string
    }>
    main: Array<{
      name: string
      duration: number
      description?: string
      materials?: string
    }>
    cooldown: Array<{
      name: string
      duration: number
      description?: string
      materials?: string
    }>
  }
  weatherForecast?: {
    temp: number
    condition: string
    windSpeed: number
  }
  attendances?: Array<{
    playerId: string
    playerName: string
    present: boolean
    note?: string
  }>
}

export default function TrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  const trainingId = params.trainingId as string
  
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    plan: false,
    players: true,
    notes: false,
  })
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)

  // Mock data - replace with real data
  const training: TrainingDetail = {
    id: trainingId,
    type: 'TACTICAL',
    status: 'SCHEDULED',
    date: new Date(2025, 0, 24, 17, 0),
    duration: 90,
    location: 'Campo Principale',
    plannedPlayers: 18,
    coachNotes: 'Focus sulla costruzione dal basso e movimenti senza palla',
    plan: {
      warmup: [
        {
          name: 'Corsa leggera con palla',
          duration: 10,
          description: 'Corsa a ritmo blando con controllo palla',
          materials: '1 palla per giocatore',
        },
        {
          name: 'Stretching dinamico',
          duration: 5,
          description: 'Esercizi di mobilità articolare',
        },
      ],
      main: [
        {
          name: 'Possesso palla 6v6',
          duration: 20,
          description: 'Due squadre, mantenimento possesso in spazio ridotto',
          materials: '12 casacche, 8 coni',
        },
        {
          name: 'Costruzione dal basso',
          duration: 25,
          description: 'Esercitazione tattica con difensori e centrocampisti',
        },
        {
          name: 'Partitella a campo ridotto',
          duration: 25,
          description: '8v8 con porte normali',
          materials: '16 casacche, 2 porte',
        },
      ],
      cooldown: [
        {
          name: 'Stretching statico',
          duration: 10,
          description: 'Allungamento muscolare guidato',
        },
      ],
    },
    weatherForecast: {
      temp: 12,
      condition: 'Nuvoloso',
      windSpeed: 15,
    },
  }

  const isToday = isSameDay(training.date, new Date())
  const isFuture = isAfter(training.date, new Date())
  const canRecordAttendance = isToday || !isFuture

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const saveNotes = () => {
    // Save notes via API
    console.log('Saving notes:', notes)
    setEditingNotes(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/teams/${teamId}/trainings`)}
        >
          ← Torna agli allenamenti
        </Button>
      </div>

      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{typeLabels[training.type]}</h1>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                  typeColors[training.type]
                }`}
              >
                {training.type.replace('_', ' ')}
              </div>
              {training.status === 'CANCELLED' && (
                <Badge variant="destructive">Annullato</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {format(training.date, 'EEEE d MMMM yyyy', { locale: it })}
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {format(training.date, 'HH:mm')} - {training.duration} minuti
              </div>
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                {training.location}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <EditIcon className="h-4 w-4 mr-2" />
            Modifica
          </Button>
        </div>

        {isFuture && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              Tra {formatDistanceToNow(training.date, { locale: it })}
            </p>
            {isToday && (
              <Button
                className="mt-2"
                onClick={() => setShowAttendanceModal(true)}
              >
                Registra Presenze
              </Button>
            )}
          </div>
        )}

        {!isFuture && training.status === 'COMPLETED' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">
              Allenamento completato
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setShowAttendanceModal(true)}
            >
              Modifica Presenze
            </Button>
          </div>
        )}
      </Card>

      {/* Weather Forecast */}
      {training.weatherForecast && isFuture && (
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <CloudIcon className="h-8 w-8 text-gray-400" />
            <div>
              <p className="font-medium">Meteo previsto</p>
              <p className="text-sm text-gray-600">
                {training.weatherForecast.condition}, {training.weatherForecast.temp}°C,
                Vento {training.weatherForecast.windSpeed} km/h
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Training Plan */}
      {training.plan && (
        <Card className="p-6 mb-6">
          <button
            className="w-full flex justify-between items-center"
            onClick={() => toggleSection('plan')}
          >
            <h2 className="text-lg font-semibold">Piano Allenamento</h2>
            {expandedSections.plan ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          
          {expandedSections.plan && (
            <div className="mt-4 space-y-4">
              {/* Warmup */}
              <div>
                <h3 className="font-medium text-yellow-600 mb-2">Riscaldamento</h3>
                <div className="space-y-2">
                  {training.plan.warmup.map((exercise, index) => (
                    <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          {exercise.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {exercise.description}
                            </p>
                          )}
                          {exercise.materials && (
                            <p className="text-sm text-gray-500 mt-1">
                              Materiali: {exercise.materials}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {exercise.duration} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main */}
              <div>
                <h3 className="font-medium text-blue-600 mb-2">Parte Principale</h3>
                <div className="space-y-2">
                  {training.plan.main.map((exercise, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          {exercise.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {exercise.description}
                            </p>
                          )}
                          {exercise.materials && (
                            <p className="text-sm text-gray-500 mt-1">
                              Materiali: {exercise.materials}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {exercise.duration} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooldown */}
              <div>
                <h3 className="font-medium text-green-600 mb-2">Defaticamento</h3>
                <div className="space-y-2">
                  {training.plan.cooldown.map((exercise, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          {exercise.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {exercise.description}
                            </p>
                          )}
                          {exercise.materials && (
                            <p className="text-sm text-gray-500 mt-1">
                              Materiali: {exercise.materials}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {exercise.duration} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Players */}
      <Card className="p-6 mb-6">
        <button
          className="w-full flex justify-between items-center"
          onClick={() => toggleSection('players')}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Giocatori Convocati</h2>
            <Badge variant="secondary">
              <UsersIcon className="h-3 w-3 mr-1" />
              {training.plannedPlayers}
            </Badge>
          </div>
          {expandedSections.players ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
        
        {expandedSections.players && (
          <div className="mt-4">
            {training.status === 'COMPLETED' && training.attendances ? (
              <div className="grid grid-cols-2 gap-2">
                {training.attendances.map((attendance) => (
                  <div
                    key={attendance.playerId}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                  >
                    {attendance.present ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">{attendance.playerName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Le presenze verranno registrate il giorno dell'allenamento
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Coach Notes */}
      <Card className="p-6">
        <button
          className="w-full flex justify-between items-center"
          onClick={() => toggleSection('notes')}
        >
          <h2 className="text-lg font-semibold">Note Allenatore</h2>
          {expandedSections.notes ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
        
        {expandedSections.notes && (
          <div className="mt-4">
            {editingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notes || training.coachNotes || ''}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Aggiungi note per questo allenamento..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveNotes}>
                    Salva
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingNotes(false)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {training.coachNotes ? (
                  <p className="text-gray-700">{training.coachNotes}</p>
                ) : (
                  <p className="text-gray-500 italic">Nessuna nota aggiunta</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setNotes(training.coachNotes || '')
                    setEditingNotes(true)
                  }}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  {training.coachNotes ? 'Modifica' : 'Aggiungi'} note
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <AttendanceModal
        open={showAttendanceModal}
        onOpenChange={setShowAttendanceModal}
        trainingId={trainingId}
        teamId={teamId}
      />
    </div>
  )
}