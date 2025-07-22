'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
  FilterIcon,
  UserIcon,
  Loader2Icon,
  RefreshCwIcon,
  XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AttendanceStatus } from '@prisma/client'

interface AttendanceHistoryRecord {
  id: string
  date: string
  status: AttendanceStatus
  trainingType: string
  note?: string
  isJustified: boolean
  justification?: string
  arrivalTime?: string
  departureTime?: string
  absenceReason?: string
  training: {
    id: string
    type: string
    location?: string
  }
}

interface PlayerInfo {
  id: string
  firstName: string
  lastName: string
  number?: number
  profileImage?: string
}

interface AttendanceStats {
  totalTrainings: number
  presentCount: number
  lateCount: number
  absentCount: number
  injuredCount: number
  presentPercentage: number
  trend: number
  isPositiveTrend: boolean
}

interface AttendanceHistoryProps {
  playerId: string
  playerName?: string
  className?: string
}

export function AttendanceHistory({
  playerId,
  playerName,
  className,
}: AttendanceHistoryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('last-month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryRecord[]>([])
  const [player, setPlayer] = useState<PlayerInfo | null>(null)
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carica dati dal database
  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: '100',
        year: selectedYear.toString(),
      })

      if (selectedPeriod === 'custom' || selectedPeriod === 'last-month') {
        params.append('month', selectedMonth.toString())
      }

      const response = await fetch(`/api/players/${playerId}/attendance?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel caricamento dello storico')
      }
      
      const data = await response.json()
      setPlayer(data.player)
      setStats(data.stats)
      setAttendanceHistory(data.attendances)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      console.error('Error fetching attendance history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceHistory()
  }, [playerId, selectedYear, selectedMonth, selectedPeriod])

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case 'PRESENT': return 'bg-green-500'
      case 'ABSENT': return 'bg-red-500'
      case 'LATE': return 'bg-orange-500'
      case 'INJURED': return 'bg-yellow-500'
      case 'EARLY_DEPARTURE': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: AttendanceStatus): string => {
    switch (status) {
      case 'PRESENT': return 'Presente'
      case 'ABSENT': return 'Assente'
      case 'LATE': return 'Ritardo'
      case 'INJURED': return 'Infortunato'
      case 'EARLY_DEPARTURE': return 'Uscita Anticipata'
      default: return 'Sconosciuto'
    }
  }

  const generateCalendar = () => {
    const year = selectedYear
    const month = selectedMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const calendar = []
    
    // Giorni vuoti all'inizio
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null)
    }
    
    // Giorni del mese
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const attendance = attendanceHistory.find(h => {
        const attendanceDate = new Date(h.date)
        return attendanceDate.getDate() === day && 
               attendanceDate.getMonth() === month && 
               attendanceDate.getFullYear() === year
      })
      
      calendar.push({
        day,
        date,
        attendance,
      })
    }
    
    return calendar
  }

  const calendar = generateCalendar()
  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ]
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']

  const exportReport = () => {
    // Implementare export CSV/PDF
    console.log('Exporting attendance report for', playerName)
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-2">
            <Loader2Icon className="h-5 w-5 animate-spin" />
            <span>Caricamento storico presenze...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6">
          <div className="text-center">
            <XIcon className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Errore nel caricamento</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAttendanceHistory}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Riprova
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!player || !stats) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Player Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            {player.profileImage ? (
              <img 
                src={player.profileImage} 
                alt={`${player.firstName} ${player.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-6 w-6 text-gray-500" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{playerName || `${player.firstName} ${player.lastName}`}</h2>
            <p className="text-gray-600">Storico Presenze</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-month">Ultimo Mese</SelectItem>
              <SelectItem value="last-3-months">Ultimi 3 Mesi</SelectItem>
              <SelectItem value="season">Stagione Corrente</SelectItem>
              <SelectItem value="custom">Personalizzato</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportReport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Esporta
          </Button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">% Presenze</p>
              <p className="text-2xl font-bold">{stats.presentPercentage}%</p>
            </div>
            <div className="flex items-center gap-1">
              {stats.isPositiveTrend ? (
                <TrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${stats.isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trend > 0 ? '+' : ''}{stats.trend}%
              </span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <p className="text-sm text-gray-600">Allenamenti Totali</p>
          <p className="text-2xl font-bold">{stats.totalTrainings}</p>
          <p className="text-xs text-gray-500">Ultimo mese</p>
        </Card>
        
        <Card className="p-4">
          <p className="text-sm text-gray-600">Presenze</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-green-600">{stats.presentCount}</p>
            {stats.lateCount > 0 && (
              <Badge variant="secondary" className="text-orange-600">
                +{stats.lateCount} ritardi
              </Badge>
            )}
          </div>
        </Card>
        
        <Card className="p-4">
          <p className="text-sm text-gray-600">Assenze</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-red-600">{stats.absentCount}</p>
            {stats.injuredCount > 0 && (
              <Badge variant="secondary" className="text-yellow-600">
                {stats.injuredCount} infortuni
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendario Presenze
          </h3>
          
          <div className="flex items-center gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((name, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendar.map((cell, index) => (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center text-sm relative
                ${cell ? 'hover:bg-gray-50 cursor-pointer' : ''}
              `}
            >
              {cell && (
                <>
                  <span className={cell.attendance ? 'font-medium' : 'text-gray-400'}>
                    {cell.day}
                  </span>
                  {cell.attendance && (
                    <div
                      className={`
                        absolute bottom-0 right-0 w-2 h-2 rounded-full
                        ${getStatusColor(cell.attendance.status)}
                      `}
                      title={`${getStatusLabel(cell.attendance.status)} - ${cell.attendance.trainingType}`}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
          <span className="text-sm text-gray-600">Legenda:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs">Presente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs">Ritardo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs">Assente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs">Infortunato</span>
          </div>
        </div>
      </Card>

      {/* Recent History List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ultimi Allenamenti</h3>
        <div className="space-y-3">
          {attendanceHistory.slice(0, 10).map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full ${getStatusColor(record.status)}`}
                />
                <div>
                  <p className="font-medium">
                    {new Date(record.date).toLocaleDateString('it-IT')}
                  </p>
                  <p className="text-sm text-gray-600">{record.training.type}</p>
                  {record.training.location && (
                    <p className="text-xs text-gray-500">{record.training.location}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Badge variant="outline">
                  {getStatusLabel(record.status)}
                </Badge>
                {record.note && (
                  <p className="text-xs text-gray-500 mt-1">{record.note}</p>
                )}
                {record.justification && (
                  <p className="text-xs text-gray-500 mt-1">{record.justification}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}