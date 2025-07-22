'use client'

import {
  CheckIcon,
  XIcon,
  ClockIcon,
  UsersIcon,
  FileTextIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface QuickMarkButtonsProps {
  onMarkAllPresent: () => void
  onBulkJustification: () => void
  selectedCount: number
  className?: string
}

export function QuickMarkButtons({
  onMarkAllPresent,
  onBulkJustification,
  selectedCount,
  className,
}: QuickMarkButtonsProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon className="h-4 w-4" />
          Azioni Rapide:
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllPresent}
          className="flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4" />
          Tutti Presenti
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          disabled={selectedCount === 0}
          onClick={onBulkJustification}
          className="flex items-center gap-2"
        >
          <FileTextIcon className="h-4 w-4" />
          Giustifica Selezionati
          {selectedCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {selectedCount}
            </span>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Aggiorna
        </Button>
        
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Tap per cambiare stato
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Long press per dettagli
          </div>
        </div>
      </div>
    </Card>
  )
}