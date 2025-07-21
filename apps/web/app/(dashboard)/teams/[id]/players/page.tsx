'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Search, Grid, List, UserPlus, Loader2, Download, Upload } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayerCard } from '@/components/features/player/player-card'
import { PlayerTable } from '@/components/features/player/player-table'
import { AddPlayerModal } from '@/components/features/player/add-player-modal'
import { ImportPlayersModal } from '@/components/features/player/import-players-modal'
import { ExportPlayersModal } from '@/components/features/player/export-players-modal'
import { BulkActionBar, usePlayerSelection } from '@/components/features/player/bulk-action-bar'
import { useTeamStore } from '@/stores/team-store'
import { usePlayers } from '@/hooks/use-players'
import { useDebounce } from '@/hooks/use-debounce'

type ViewMode = 'grid' | 'list'
type FilterStatus = 'all' | 'active' | 'injured'
type SortBy = 'firstName' | 'number' | 'role' | 'age'

export default function PlayersPage() {
  const params = useParams()
  const teamId = params.id as string
  const { teams } = useTeamStore()
  const team = teams.find(t => t.id === teamId)

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('firstName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Player selection for bulk operations
  const playerSelection = usePlayerSelection()

  // Debounce search per evitare troppe richieste
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Hook per gestire i giocatori dal database
  const { 
    players, 
    loading, 
    error, 
    addPlayer, 
    getUsedNumbers 
  } = usePlayers(teamId, {
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: debouncedSearchQuery,
    sortBy,
    sortOrder,
  })

  const handleAddPlayer = async (playerData: any) => {
    try {
      await addPlayer(playerData)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Error adding player:', error)
      // TODO: Mostrare toast di errore
    }
  }

  const handleImportComplete = (result: any) => {
    // Refresh player list after import
    window.location.reload()
  }

  const handleBulkArchive = async () => {
    if (playerSelection.selectedCount === 0) return
    
    try {
      const response = await fetch(`/api/teams/${teamId}/players/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerIds: playerSelection.selectedPlayers,
          action: 'archive'
        })
      })
      
      if (!response.ok) throw new Error('Errore durante l\'archiviazione')
      
      playerSelection.clearSelection()
      window.location.reload()
    } catch (error) {
      console.error('Bulk archive error:', error)
      alert('Errore durante l\'archiviazione dei giocatori')
    }
  }

  const handleBulkExport = () => {
    setIsExportModalOpen(true)
  }

  const handleBulkCategoryAssignment = async () => {
    const category = prompt('Inserisci la categoria da assegnare:')
    if (!category) return
    
    try {
      const response = await fetch(`/api/teams/${teamId}/players/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerIds: playerSelection.selectedPlayers,
          action: 'assignCategory',
          data: { category }
        })
      })
      
      if (!response.ok) throw new Error('Errore durante l\'assegnazione categoria')
      
      playerSelection.clearSelection()
      window.location.reload()
    } catch (error) {
      console.error('Bulk category assignment error:', error)
      alert('Errore durante l\'assegnazione della categoria')
    }
  }

  const usedNumbers = getUsedNumbers()

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Team non trovato</h2>
          <p className="text-sm text-gray-500 mt-1">Il team richiesto non esiste</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-900">Errore</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Riprova
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giocatori</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Caricamento...' : `${players.length} giocatori totali`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importa
            </Button>
            <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Esporta
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Aggiungi Giocatore
            </Button>
          </div>
        </div>

        {/* Controlli */}
        <div className="space-y-4">
          {/* Ricerca e View Mode */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca per nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filtri e Ordinamento */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Tabs
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as FilterStatus)}
              className="flex-1"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Tutti</TabsTrigger>
                <TabsTrigger value="active">Attivi</TabsTrigger>
                <TabsTrigger value="injured">Infortunati</TabsTrigger>
              </TabsList>
            </Tabs>

            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="firstName">Ordina per Nome</option>
              <option value="number">Ordina per Numero</option>
              <option value="role">Ordina per Ruolo</option>
              <option value="age">Ordina per Età</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-gray-500">Caricamento giocatori...</span>
          </div>
        ) : players.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {debouncedSearchQuery || filterStatus !== 'all'
                  ? 'Nessun giocatore trovato'
                  : 'Aggiungi i tuoi primi giocatori'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {debouncedSearchQuery || filterStatus !== 'all'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Inizia ad aggiungere i giocatori della tua squadra'}
              </p>
              {!debouncedSearchQuery && filterStatus === 'all' && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Aggiungi Giocatore
                </Button>
              )}
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                teamId={teamId}
                isSelected={playerSelection.isSelected(player.id)}
                onSelect={(selected) => 
                  selected ? playerSelection.selectPlayer(player.id) : playerSelection.deselectPlayer(player.id)
                }
              />
            ))}
          </div>
        ) : (
          <PlayerTable 
            players={players} 
            teamId={teamId}
            selectionMode={true}
            selectedPlayers={playerSelection.selectedPlayers}
            onSelectionChange={playerSelection.togglePlayer}
            onSelectAll={() => playerSelection.selectAll(players.map(p => p.id))}
            onClearSelection={playerSelection.clearSelection}
          />
        )}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={playerSelection.selectedCount}
        selectedPlayers={playerSelection.selectedPlayers}
        onClearSelection={playerSelection.clearSelection}
        onArchiveSelected={handleBulkArchive}
        onExportSelected={handleBulkExport}
        onAssignCategory={handleBulkCategoryAssignment}
      />

      {/* Modals */}
      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPlayer}
        teamId={teamId}
        teamSport={team.sport}
        existingNumbers={usedNumbers}
      />

      <ImportPlayersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        teamId={teamId}
        onImportComplete={handleImportComplete}
      />

      <ExportPlayersModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        teamId={teamId}
        totalPlayers={players.length}
        selectedPlayers={playerSelection.selectedPlayers}
      />
    </div>
  )
}