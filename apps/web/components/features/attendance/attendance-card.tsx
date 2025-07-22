'use client'

import { useState } from 'react'
import { 
  CheckIcon, 
  XIcon, 
  ClockIcon, 
  HeartPulseIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/checkbox'
import { AttendanceStatus, AbsenceReason } from '@prisma/client'

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

interface AttendanceCardProps {
  attendance: AttendanceRecord
  viewMode: 'grid' | 'list'
  selected: boolean
  onStatusChange: (playerId: string, status: AttendanceStatus) => void
  onLongPress: (attendance: AttendanceRecord) => void
  onSelect: (playerId: string, selected: boolean) => void
}

const statusConfig = {
  PRESENT: {
    icon: CheckIcon,
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Presente',
  },
  ABSENT: {
    icon: XIcon,
    color: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Assente',
  },
  LATE: {
    icon: ClockIcon,
    color: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Ritardo',
  },
  INJURED: {
    icon: HeartPulseIcon,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    label: 'Infortunato',
  },
  EARLY_DEPARTURE: {
    icon: LogOutIcon,
    color: 'bg-purple-500 hover:bg-purple-600',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    label: 'Uscita Anticipata',
  },
}

const statusCycle: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'INJURED']

export function AttendanceCard({
  attendance,
  viewMode,
  selected,
  onStatusChange,
  onLongPress,
  onSelect,
}: AttendanceCardProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  
  const { player } = attendance
  const config = statusConfig[attendance.status]
  const StatusIcon = config.icon

  const handleStatusCycle = () => {
    const currentIndex = statusCycle.indexOf(attendance.status)
    const nextIndex = (currentIndex + 1) % statusCycle.length
    onStatusChange(player.id, statusCycle[nextIndex])
  }

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      onLongPress(attendance)
    }, 500)
    setLongPressTimer(timer)
  }

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      onLongPress(attendance)
    }, 500)
    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className={`p-3 transition-all ${config.bgColor} ${selected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(player.id, !!checked)}
            />
            
            {player.profileImage ? (
              <img
                src={player.profileImage}
                alt={`${player.firstName} ${player.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </div>
            )}
            
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
              
              {attendance.status === 'LATE' && attendance.arrivalTime && (
                <p className="text-xs text-gray-600">
                  Arrivato alle {new Date(attendance.arrivalTime).toLocaleTimeString('it-IT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              )}
              
              {attendance.justification && (
                <p className="text-xs text-gray-600 italic">
                  {attendance.justification}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {attendance.status !== 'PRESENT' && attendance.isJustified && (
              <Badge variant="outline" className="text-xs">
                Giustificato
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className={`${config.color} text-white`}
              onClick={handleStatusCycle}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <StatusIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLongPress(attendance)}
            >
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={`p-4 transition-all cursor-pointer hover:shadow-md ${config.bgColor} ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={handleStatusCycle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(player.id, !!checked)}
          onClick={(e) => e.stopPropagation()}
        />
        
        <Button
          variant="ghost"
          size="sm"
          className={`${config.color} text-white p-2 rounded-full`}
          onClick={(e) => {
            e.stopPropagation()
            handleStatusCycle()
          }}
        >
          <StatusIcon className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="text-center">
        {player.profileImage ? (
          <img
            src={player.profileImage}
            alt={`${player.firstName} ${player.lastName}`}
            className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
            <UserIcon className="h-8 w-8 text-gray-500" />
          </div>
        )}
        
        <h3 className="font-medium text-sm">
          {player.firstName} {player.lastName}
        </h3>
        
        <div className="flex items-center justify-center gap-1 mt-1">
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
        
        <div className="mt-2">
          <Badge className={`${config.textColor} text-xs`}>
            {config.label}
          </Badge>
        </div>
        
        {attendance.status === 'LATE' && attendance.arrivalTime && (
          <p className="text-xs text-gray-600 mt-1">
            {new Date(attendance.arrivalTime).toLocaleTimeString('it-IT', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        )}
        
        {attendance.status !== 'PRESENT' && attendance.isJustified && (
          <Badge variant="outline" className="text-xs mt-1">
            Giustificato
          </Badge>
        )}
        
        {attendance.justification && (
          <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">
            {attendance.justification}
          </p>
        )}
        
        {/* Badges per info extra */}
        <div className="flex justify-center gap-1 mt-2">
          {attendance.status === 'LATE' && (
            <div className="w-4 h-4 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
              R
            </div>
          )}
          {attendance.departureTime && (
            <div className="w-4 h-4 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
              U
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}