import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, XCircle, Archive } from 'lucide-react'

interface PlayerStatusBadgeProps {
  status: 'active' | 'injured' | 'suspended' | 'archived'
  returnDate?: string
  compact?: boolean
  className?: string
}

export function PlayerStatusBadge({ 
  status, 
  returnDate,
  compact = false,
  className 
}: PlayerStatusBadgeProps) {
  const statusConfig = {
    active: {
      label: 'Attivo',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700 border-green-200'
    },
    injured: {
      label: 'Infortunato',
      icon: AlertCircle,
      className: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    suspended: {
      label: 'Sospeso',
      icon: XCircle,
      className: 'bg-red-100 text-red-700 border-red-200'
    },
    archived: {
      label: 'Archiviato',
      icon: Archive,
      className: 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border',
          config.className,
          className
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border',
          config.className
        )}
      >
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
      
      {status === 'injured' && returnDate && (
        <span className="text-xs text-gray-500">
          Rientro: {new Date(returnDate).toLocaleDateString('it-IT')}
        </span>
      )}
    </div>
  )
}