'use client'

import { useState } from 'react'
import { 
  Archive, 
  Download, 
  Tag, 
  X, 
  MoreHorizontal,
  Users,
  Trash2,
  FileText,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
  selectedCount: number
  selectedPlayers: string[]
  onClearSelection: () => void
  onArchiveSelected: () => void
  onExportSelected: () => void
  onAssignCategory: () => void
  onSendMessage?: () => void
  className?: string
}

export function BulkActionBar({
  selectedCount,
  selectedPlayers,
  onClearSelection,
  onArchiveSelected,
  onExportSelected,
  onAssignCategory,
  onSendMessage,
  className
}: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (selectedCount === 0) return null

  const handleAction = async (action: () => void) => {
    setIsProcessing(true)
    try {
      await action()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={cn(
      'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
      'bg-white shadow-lg border rounded-lg p-3',
      'flex items-center gap-3',
      'animate-in slide-in-from-bottom-2',
      className
    )}>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {selectedCount}
        </Badge>
        <span className="text-sm font-medium text-gray-900">
          {selectedCount === 1 ? 'giocatore selezionato' : 'giocatori selezionati'}
        </span>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* Primary Actions */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction(onExportSelected)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Esporta</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction(onAssignCategory)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Tag className="h-4 w-4" />
          <span className="hidden sm:inline">Categoria</span>
        </Button>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Altro</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onSendMessage && (
              <>
                <DropdownMenuItem onClick={() => handleAction(onSendMessage)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Invia messaggio
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem 
              onClick={() => handleAction(onArchiveSelected)}
              className="text-red-600 focus:text-red-600"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivia selezionati
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-6 w-px bg-gray-200" />

      {/* Clear Selection */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
        disabled={isProcessing}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">Deseleziona</span>
      </Button>
    </div>
  )
}

// Hook per gestire la selezione multipla
export function usePlayerSelection() {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())

  const selectPlayer = (playerId: string) => {
    setSelectedPlayers(prev => new Set(prev).add(playerId))
  }

  const deselectPlayer = (playerId: string) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev)
      newSet.delete(playerId)
      return newSet
    })
  }

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(playerId)) {
        newSet.delete(playerId)
      } else {
        newSet.add(playerId)
      }
      return newSet
    })
  }

  const selectAll = (playerIds: string[]) => {
    setSelectedPlayers(new Set(playerIds))
  }

  const clearSelection = () => {
    setSelectedPlayers(new Set())
  }

  const isSelected = (playerId: string) => {
    return selectedPlayers.has(playerId)
  }

  return {
    selectedPlayers: Array.from(selectedPlayers),
    selectedCount: selectedPlayers.size,
    selectPlayer,
    deselectPlayer,
    togglePlayer,
    selectAll,
    clearSelection,
    isSelected,
  }
}