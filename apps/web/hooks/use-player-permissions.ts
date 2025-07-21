import { useAuth } from './use-auth'
import { useTeamStore } from '@/stores/team-store'

interface PlayerPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canViewStats: boolean
  canManageDocuments: boolean
  playerLimit: number
}

export function usePlayerPermissions(teamId: string): PlayerPermissions {
  const { user } = useAuth()
  const { teams } = useTeamStore()
  
  const team = teams.find(t => t.id === teamId)
  
  if (!user || !team) {
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canViewStats: false,
      canManageDocuments: false,
      playerLimit: 0
    }
  }

  // Trova il ruolo dell'utente nel team
  const userRole = team.members?.find(m => m.userId === user.id)?.role || 'viewer'
  const userTier = user.subscriptionTier || 'FREE'

  // Permessi base per ruolo
  const rolePermissions = {
    owner: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canViewStats: true,
      canManageDocuments: true
    },
    assistant: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canViewStats: true,
      canManageDocuments: true
    },
    player: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canViewStats: true,
      canManageDocuments: false
    },
    viewer: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canViewStats: false,
      canManageDocuments: false
    }
  }

  // Limiti giocatori per tier
  const tierLimits = {
    FREE: 20,
    LEVEL1: 50,
    PREMIUM: -1 // Illimitati
  }

  const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || rolePermissions.viewer
  const playerLimit = tierLimits[userTier as keyof typeof tierLimits] || 20

  return {
    ...permissions,
    playerLimit
  }
}

export function useCanAddPlayers(teamId: string, currentPlayerCount: number): boolean {
  const { playerLimit } = usePlayerPermissions(teamId)
  
  if (playerLimit === -1) return true // Illimitati
  return currentPlayerCount < playerLimit
}