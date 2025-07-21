'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  CheckCircle2,
  Settings,
  Users,
  Shield,
  Heart
} from 'lucide-react'

interface ExportPlayersModalProps {
  isOpen: boolean
  onClose: () => void
  teamId: string
  totalPlayers: number
  selectedPlayers?: string[]
}

interface ExportOptions {
  format: 'csv' | 'excel'
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  category?: string
  includeParents: boolean
  includeMedical: boolean
  selectedOnly: boolean
}

export function ExportPlayersModal({ 
  isOpen, 
  onClose, 
  teamId, 
  totalPlayers,
  selectedPlayers = []
}: ExportPlayersModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'excel',
    includeParents: true,
    includeMedical: false,
    selectedOnly: false
  })
  const [isExporting, setIsExporting] = useState(false)

  const hasSelection = selectedPlayers.length > 0

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        format: options.format,
        includeParents: options.includeParents.toString(),
        includeMedical: options.includeMedical.toString()
      })

      if (options.status) {
        params.set('status', options.status)
      }
      
      if (options.category) {
        params.set('category', options.category)
      }

      // If exporting only selected players, we'll need to modify the API
      // For now, we'll export all players with filters
      const response = await fetch(`/api/teams/${teamId}/players/export?${params}`)
      
      if (!response.ok) {
        throw new Error('Errore durante l\'esportazione')
      }

      // Get the blob and create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `export_players.${options.format === 'excel' ? 'xlsx' : 'csv'}`
        
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      onClose()
      
    } catch (error) {
      console.error('Export error:', error)
      alert('Errore durante l\'esportazione')
    } finally {
      setIsExporting(false)
    }
  }

  const exportCount = options.selectedOnly ? selectedPlayers.length : totalPlayers

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Esporta giocatori
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Export Summary */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">
                    {exportCount} giocatori verranno esportati
                  </div>
                  <div className="text-sm text-blue-700">
                    {options.selectedOnly && hasSelection 
                      ? 'Solo giocatori selezionati'
                      : 'Tutti i giocatori della squadra'
                    }
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {options.format.toUpperCase()}
              </Badge>
            </div>
          </Card>

          {/* Format Selection */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Formato file</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`p-4 cursor-pointer border-2 transition-all ${
                  options.format === 'excel' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setOptions({ ...options, format: 'excel' })}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="font-medium">Excel (.xlsx)</div>
                    <div className="text-sm text-gray-500">
                      Formato avanzato con fogli multipli
                    </div>
                  </div>
                  {options.format === 'excel' && (
                    <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                  )}
                </div>
              </Card>

              <Card 
                className={`p-4 cursor-pointer border-2 transition-all ${
                  options.format === 'csv' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setOptions({ ...options, format: 'csv' })}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <div className="font-medium">CSV (.csv)</div>
                    <div className="text-sm text-gray-500">
                      Formato semplice compatibile
                    </div>
                  </div>
                  {options.format === 'csv' && (
                    <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Selection Options */}
          {hasSelection && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Giocatori da esportare</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="selection"
                    checked={!options.selectedOnly}
                    onChange={() => setOptions({ ...options, selectedOnly: false })}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Tutti i giocatori ({totalPlayers})</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="selection" 
                    checked={options.selectedOnly}
                    onChange={() => setOptions({ ...options, selectedOnly: true })}
                    className="w-4 h-4 text-primary"
                  />
                  <span>Solo giocatori selezionati ({selectedPlayers.length})</span>
                </label>
              </div>
            </div>
          )}

          {/* Filter Options */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Filtri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stato giocatore
                </label>
                <select
                  value={options.status || ''}
                  onChange={(e) => setOptions({ 
                    ...options, 
                    status: e.target.value as any || undefined 
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Tutti gli stati</option>
                  <option value="ACTIVE">Attivi</option>
                  <option value="INACTIVE">Inattivi</option>
                  <option value="ARCHIVED">Archiviati</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={options.category || ''}
                  onChange={(e) => setOptions({ 
                    ...options, 
                    category: e.target.value || undefined 
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Tutte le categorie</option>
                  <option value="Primi Calci">Primi Calci</option>
                  <option value="Pulcini">Pulcini</option>
                  <option value="Esordienti">Esordienti</option>
                  <option value="Giovanissimi">Giovanissimi</option>
                  <option value="Allievi">Allievi</option>
                  <option value="Prima Squadra">Prima Squadra</option>
                </select>
              </div>
            </div>
          </div>

          {/* Include Options */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Dati da includere</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={options.includeParents}
                  onChange={(e) => setOptions({ 
                    ...options, 
                    includeParents: e.target.checked 
                  })}
                  className="w-4 h-4 text-primary"
                />
                <Shield className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Contatti genitori</div>
                  <div className="text-sm text-gray-500">
                    Include nomi, telefoni ed email dei genitori
                  </div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={options.includeMedical}
                  onChange={(e) => setOptions({ 
                    ...options, 
                    includeMedical: e.target.checked 
                  })}
                  className="w-4 h-4 text-primary"
                />
                <Heart className="h-4 w-4 text-red-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Dati medici</div>
                  <div className="text-sm text-gray-500">
                    Include note mediche, allergie e infortuni recenti
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            
            <Button 
              onClick={handleExport}
              disabled={isExporting || exportCount === 0}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Esportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Esporta
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}