'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Player {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  age: number
  number: number | null
  role: string | null
  status: 'active' | 'injured' | 'suspended'
  profileImage: string | null
  preferredFoot?: 'left' | 'right' | 'both'
  technicalNotes: string | null
  playerEmail: string | null
  parentName: string | null
  parentPhone: string | null
  emergencyContact: string | null
  height: number | null
  weight: number | null
  injuryReturnDate: string | null
  attendanceLastMonth: number
  recentAttendances?: Array<{
    id: string
    presente: boolean
    note: string | null
    date: string
    trainingTitle: string
  }>
  createdAt: string
  updatedAt: string
}

interface UsePlayersFilters {
  status?: 'all' | 'active' | 'injured' | 'suspended'
  search?: string
  sortBy?: 'firstName' | 'number' | 'role' | 'age'
  sortOrder?: 'asc' | 'desc'
}

export function usePlayers(teamId: string, filters?: UsePlayersFilters) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayers = useCallback(async () => {
    if (!teamId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters?.search) {
        params.append('search', filters.search)
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy)
      }
      if (filters?.sortOrder) {
        params.append('sortOrder', filters.sortOrder)
      }

      const response = await fetch(`/api/teams/${teamId}/players?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel caricamento giocatori')
      }

      const data = await response.json()
      setPlayers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      console.error('Error fetching players:', err)
    } finally {
      setLoading(false)
    }
  }, [teamId, filters])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const addPlayer = async (playerData: Partial<Player>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...playerData,
          preferredFoot: playerData.preferredFoot?.toUpperCase(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nella creazione del giocatore')
      }

      const newPlayer = await response.json()
      setPlayers(prev => [...prev, newPlayer])
      return newPlayer
    } catch (err) {
      throw err instanceof Error ? err : new Error('Errore sconosciuto')
    }
  }

  const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          status: updates.status?.toUpperCase(),
          preferredFoot: updates.preferredFoot?.toUpperCase(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nell\'aggiornamento del giocatore')
      }

      const updatedPlayer = await response.json()
      setPlayers(prev =>
        prev.map(player =>
          player.id === playerId ? updatedPlayer : player
        )
      )
      return updatedPlayer
    } catch (err) {
      throw err instanceof Error ? err : new Error('Errore sconosciuto')
    }
  }

  const deletePlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nella cancellazione del giocatore')
      }

      setPlayers(prev => prev.filter(player => player.id !== playerId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Errore sconosciuto')
    }
  }

  const getUsedNumbers = () => {
    return players
      .map(player => player.number)
      .filter(number => number !== null) as number[]
  }

  return {
    players,
    loading,
    error,
    addPlayer,
    updatePlayer,
    deletePlayer,
    refetch: fetchPlayers,
    getUsedNumbers,
  }
}

// Hook per singolo giocatore
export function usePlayer(teamId: string, playerId: string) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayer = useCallback(async () => {
    if (!teamId || !playerId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel caricamento giocatore')
      }

      const data = await response.json()
      setPlayer(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      console.error('Error fetching player:', err)
    } finally {
      setLoading(false)
    }
  }, [teamId, playerId])

  useEffect(() => {
    fetchPlayer()
  }, [fetchPlayer])

  const updatePlayer = async (updates: Partial<Player>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          status: updates.status?.toUpperCase(),
          preferredFoot: updates.preferredFoot?.toUpperCase(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nell\'aggiornamento del giocatore')
      }

      const updatedPlayer = await response.json()
      setPlayer(updatedPlayer)
      return updatedPlayer
    } catch (err) {
      throw err instanceof Error ? err : new Error('Errore sconosciuto')
    }
  }

  return {
    player,
    loading,
    error,
    updatePlayer,
    refetch: fetchPlayer,
  }
}