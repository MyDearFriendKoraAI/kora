'use client'

import { useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  Calendar,
  momentLocalizer,
  View,
  SlotInfo,
  Event as CalendarEvent,
} from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/it'
import { CalendarIcon, ListIcon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CreateTrainingModal } from '@/components/features/training/create-training-modal'
import { TrainingType, TrainingStatus } from '@prisma/client'
import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.locale('it')
const localizer = momentLocalizer(moment)

interface Training extends CalendarEvent {
  id: string
  type: TrainingType
  status: TrainingStatus
  duration: number
  location?: string
  plannedPlayers?: number
}

const trainingTypeColors: Record<TrainingType, string> = {
  REGULAR: '#3b82f6',
  MATCH_PREP: '#10b981',
  RECOVERY: '#f59e0b',
  TACTICAL: '#8b5cf6',
  TECHNICAL: '#06b6d4',
  PHYSICAL: '#ef4444',
}

export default function TrainingsPage() {
  const params = useParams()
  const teamId = params.id as string
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarView, setCalendarView] = useState<'calendar' | 'list'>('calendar')

  // Mock data - replace with real data
  const trainings: Training[] = [
    {
      id: '1',
      title: 'Allenamento Tattico',
      start: new Date(2025, 0, 24, 17, 0),
      end: new Date(2025, 0, 24, 18, 30),
      type: 'TACTICAL',
      status: 'SCHEDULED',
      duration: 90,
      location: 'Campo Principale',
      plannedPlayers: 18,
    },
    {
      id: '2',
      title: 'Preparazione Partita',
      start: new Date(2025, 0, 25, 16, 0),
      end: new Date(2025, 0, 25, 17, 30),
      type: 'MATCH_PREP',
      status: 'SCHEDULED',
      duration: 90,
      location: 'Campo Principale',
      plannedPlayers: 20,
    },
    {
      id: '3',
      title: 'Recupero',
      start: new Date(2025, 0, 26, 10, 0),
      end: new Date(2025, 0, 26, 11, 0),
      type: 'RECOVERY',
      status: 'SCHEDULED',
      duration: 60,
      location: 'Palestra',
      plannedPlayers: 15,
    },
  ]

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedDate(slotInfo.start)
    setShowCreateModal(true)
  }, [])

  const handleSelectEvent = useCallback((event: Training) => {
    // Navigate to training detail
    window.location.href = `/teams/${teamId}/trainings/${event.id}`
  }, [teamId])

  const eventStyleGetter = useCallback((event: Training) => {
    const backgroundColor = trainingTypeColors[event.type]
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.status === 'CANCELLED' ? 0.5 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    }
  }, [])

  const formats = useMemo(() => ({
    dayFormat: 'DD ddd',
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
      `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`,
    dayHeaderFormat: 'dddd DD MMMM',
    monthHeaderFormat: 'MMMM YYYY',
  }), [])

  const messages = useMemo(() => ({
    week: 'Settimana',
    work_week: 'Settimana lavorativa',
    day: 'Giorno',
    month: 'Mese',
    previous: 'Precedente',
    next: 'Successivo',
    today: 'Oggi',
    agenda: 'Agenda',
    noEventsInRange: 'Nessun allenamento in questo periodo',
    showMore: (total: number) => `+${total} altri`,
  }), [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Allenamenti</h1>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={calendarView === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarView('calendar')}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendario
            </Button>
            <Button
              variant={calendarView === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarView('list')}
            >
              <ListIcon className="h-4 w-4 mr-1" />
              Lista
            </Button>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Pianifica Allenamento
          </Button>
        </div>
      </div>

      {calendarView === 'calendar' ? (
        <Card className="p-4">
          <style jsx global>{`
            .rbc-calendar {
              font-family: inherit;
            }
            .rbc-header {
              padding: 8px;
              font-weight: 600;
            }
            .rbc-today {
              background-color: rgb(239 246 255);
            }
            .rbc-event {
              padding: 2px 5px;
              font-size: 0.875rem;
            }
            .rbc-toolbar {
              margin-bottom: 20px;
            }
            .rbc-toolbar button {
              padding: 6px 12px;
              border-radius: 6px;
              font-weight: 500;
            }
            .rbc-toolbar button:hover {
              background-color: rgb(243 244 246);
            }
            .rbc-toolbar button.rbc-active {
              background-color: rgb(59 130 246);
              color: white;
            }
            .rbc-toolbar button.rbc-active:hover {
              background-color: rgb(37 99 235);
            }
          `}</style>
          <Calendar
            localizer={localizer}
            events={trainings}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            formats={formats}
            messages={messages}
            views={['month', 'week', 'day']}
            popup
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {trainings.map((training) => (
            <Card
              key={training.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectEvent(training)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{training.title}</h3>
                  <p className="text-sm text-gray-600">
                    {moment(training.start).format('dddd DD MMMM, HH:mm')} -{' '}
                    {training.duration} minuti
                  </p>
                  {training.location && (
                    <p className="text-sm text-gray-500">{training.location}</p>
                  )}
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: trainingTypeColors[training.type] }}
                >
                  {training.type.replace('_', ' ')}
                </div>
              </div>
              {training.plannedPlayers && (
                <p className="text-sm text-gray-600 mt-2">
                  {training.plannedPlayers} giocatori previsti
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <CreateTrainingModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        teamId={teamId}
        defaultDate={selectedDate}
      />
    </div>
  )
}