'use client'

import { useMemo } from 'react'
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  TargetIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { AttendanceStatus } from '@prisma/client'

interface AttendanceRecord {
  id: string | null
  playerId: string
  status: AttendanceStatus
  arrivalTime?: string
  departureTime?: string
  isJustified: boolean
  justification?: string
  note?: string
  player: {
    id: string
    firstName: string
    lastName: string
    number?: number
    role?: string
  }
}

interface AttendanceStatsProps {
  attendances: AttendanceRecord[]
  className?: string
}

export function AttendanceStats({ attendances, className }: AttendanceStatsProps) {
  const stats = useMemo(() => {
    const present = attendances.filter(a => a.status === 'PRESENT').length
    const late = attendances.filter(a => a.status === 'LATE').length
    const absent = attendances.filter(a => a.status === 'ABSENT').length
    const injured = attendances.filter(a => a.status === 'INJURED').length
    const total = attendances.length
    
    const actualPresent = present + late
    const presentPercentage = total > 0 ? Math.round((actualPresent / total) * 100) : 0
    
    // Mock data per trend (sostituire con dati reali)
    const lastMonthAverage = 78 // % presenze ultimo mese
    const trend = presentPercentage - lastMonthAverage
    const isPositiveTrend = trend >= 0
    
    // Top presenti e assenti (mock data)
    const topPresent = [
      { name: 'Marco Rossi', count: 24 },
      { name: 'Luca Bianchi', count: 23 },
      { name: 'Giuseppe Verdi', count: 22 },
      { name: 'Francesco Russo', count: 21 },
      { name: 'Alessandro Romano', count: 20 },
    ]
    
    const topAbsent = [
      { name: 'Antonio Neri', count: 8 },
      { name: 'Roberto Gialli', count: 6 },
      { name: 'Matteo Blu', count: 5 },
      { name: 'Davide Rosa', count: 4 },
      { name: 'Simone Viola', count: 3 },
    ]
    
    return {
      present,
      late,
      absent,
      injured,
      total,
      actualPresent,
      presentPercentage,
      trend,
      isPositiveTrend,
      topPresent,
      topAbsent,
      lastMonthAverage,
    }
  }, [attendances])

  const MiniSparkline = ({ data, color = '#3b82f6' }: { data: number[], color?: string }) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg className="w-16 h-8" viewBox="0 0 100 100">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
        />
      </svg>
    )
  }

  // Mock sparkline data (sostituire con dati reali)
  const sparklineData = [65, 72, 68, 75, 80, 78, 82, 77, 85, stats.presentPercentage]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Percentuale Presenze Corrente */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Presenze Oggi</p>
            <p className="text-2xl font-bold">{stats.presentPercentage}%</p>
            <p className="text-xs text-gray-500">
              {stats.actualPresent} di {stats.total}
            </p>
          </div>
          <div className="text-right">
            <TargetIcon className="h-6 w-6 text-blue-500 mb-1" />
            <div className="flex items-center gap-1">
              {stats.isPositiveTrend ? (
                <TrendingUpIcon className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDownIcon className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${stats.isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                {stats.isPositiveTrend ? '+' : ''}{stats.trend}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Trend Ultimi Allenamenti */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Trend 30gg</p>
            <p className="text-2xl font-bold">{stats.lastMonthAverage}%</p>
            <p className="text-xs text-gray-500">Media periodo</p>
          </div>
          <div>
            <MiniSparkline 
              data={sparklineData} 
              color={stats.isPositiveTrend ? '#10b981' : '#ef4444'}
            />
          </div>
        </div>
      </Card>

      {/* Breakdown Stati */}
      <Card className="p-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">Breakdown</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm">Presenti</span>
            </div>
            <Badge variant="secondary">{stats.present}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-sm">Ritardo</span>
            </div>
            <Badge variant="secondary">{stats.late}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircleIcon className="h-4 w-4 text-red-500" />
              <span className="text-sm">Assenti</span>
            </div>
            <Badge variant="secondary">{stats.absent}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">Infortunati</span>
            </div>
            <Badge variant="secondary">{stats.injured}</Badge>
          </div>
        </div>
      </Card>

      {/* Top/Bottom Performers */}
      <Card className="p-4">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">Presenze Mese</p>
          
          <div>
            <p className="text-xs font-medium text-green-700 mb-1">Top 3 Presenti</p>
            <div className="space-y-1">
              {stats.topPresent.slice(0, 3).map((player, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs truncate">{player.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {player.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium text-red-700 mb-1">Top 2 Assenti</p>
            <div className="space-y-1">
              {stats.topAbsent.slice(0, 2).map((player, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs truncate">{player.name}</span>
                  <Badge variant="destructive" className="text-xs">
                    {player.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}