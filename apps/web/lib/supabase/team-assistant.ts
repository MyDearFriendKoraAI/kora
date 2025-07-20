import { prisma } from '@/lib/prisma';

export interface TeamAssistant {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: string;
  permissions?: any;
  user: {
    id: string;
    email: string;
    nome: string;
    cognome: string;
    avatarUrl?: string | null;
  };
}

export interface TeamInvite {
  id: string;
  email: string;
  teamId: string;
  inviterId: string;
  role: 'ASSISTANT';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  token: string;
  message?: string;
  expiresAt: string;
  createdAt: string;
  inviter: {
    nome: string;
    cognome: string;
  };
  team: {
    id: string;
    name: string;
    sport: string;
    category?: string | null;
    season: string;
    logo?: string | null;
  };
}

// Get team assistants for a team
export async function getTeamAssistants(teamId: string): Promise<TeamAssistant[]> {
  try {
    const assistants = await prisma.teamAssistant.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nome: true,
            cognome: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return assistants.map((assistant) => ({
      id: assistant.id,
      teamId: assistant.teamId,
      userId: assistant.userId,
      joinedAt: assistant.joinedAt.toISOString(),
      permissions: assistant.permissions,
      user: {
        ...assistant.user,
        avatarUrl: assistant.user.avatarUrl || undefined,
      },
    }));
  } catch (error) {
    console.error('Error fetching team assistants:', error);
    return [];
  }
}

// Get team invites for a team
export async function getTeamInvites(teamId: string): Promise<TeamInvite[]> {
  try {
    const invites = await prisma.teamInvite.findMany({
      where: { 
        teamId,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
      include: {
        inviter: {
          select: {
            nome: true,
            cognome: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            sport: true,
            category: true,
            season: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      teamId: invite.teamId,
      inviterId: invite.inviterId,
      role: invite.role as 'ASSISTANT',
      status: invite.status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED',
      token: invite.token,
      message: invite.message || undefined,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
      inviter: invite.inviter,
      team: {
        ...invite.team,
        category: invite.team.category || undefined,
        logo: invite.team.logo || undefined,
      },
    }));
  } catch (error) {
    console.error('Error fetching team invites:', error);
    return [];
  }
}

// Get assistant count for a team
export async function getTeamAssistantCount(teamId: string): Promise<number> {
  try {
    return await prisma.teamAssistant.count({
      where: { teamId },
    });
  } catch (error) {
    console.error('Error counting team assistants:', error);
    return 0;
  }
}

// Create team invite
export async function createTeamInvite(data: {
  email: string;
  teamId: string;
  inviterId: string;
  message?: string;
}): Promise<{ success: boolean; invite?: TeamInvite; error?: string }> {
  try {
    // Check if user is already invited or is a member
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        email: data.email,
        teamId: data.teamId,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
    });

    if (existingInvite) {
      return { success: false, error: 'Utente già invitato per questa squadra' };
    }

    const existingMember = await prisma.teamAssistant.findFirst({
      where: {
        teamId: data.teamId,
        user: { email: data.email },
      },
      include: { user: true },
    });

    if (existingMember) {
      return { success: false, error: 'Utente già membro della squadra' };
    }

    // Generate unique token
    const token = generateInviteToken();
    
    // Create invite (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.teamInvite.create({
      data: {
        email: data.email,
        teamId: data.teamId,
        inviterId: data.inviterId,
        token,
        message: data.message,
        expiresAt,
      },
      include: {
        inviter: {
          select: {
            nome: true,
            cognome: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            sport: true,
            category: true,
            season: true,
            logo: true,
          },
        },
      },
    });

    return {
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        teamId: invite.teamId,
        inviterId: invite.inviterId,
        role: invite.role as 'ASSISTANT',
        status: invite.status as 'PENDING',
        token: invite.token,
        message: invite.message || undefined,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString(),
        inviter: invite.inviter,
        team: {
          ...invite.team,
          category: invite.team.category || undefined,
          logo: invite.team.logo || undefined,
        },
      },
    };
  } catch (error: any) {
    console.error('Error creating team invite:', error);
    return { success: false, error: error.message || 'Errore durante la creazione dell\'invito' };
  }
}

// Accept team invite
export async function acceptTeamInvite(token: string, userId: string): Promise<{ success: boolean; teamId?: string; error?: string }> {
  try {
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: { team: true },
    });

    if (!invite) {
      return { success: false, error: 'Invito non trovato' };
    }

    if (invite.status !== 'PENDING') {
      return { success: false, error: 'Invito già utilizzato' };
    }

    if (invite.expiresAt < new Date()) {
      await prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      return { success: false, error: 'Invito scaduto' };
    }

    // Check if user email matches invite email
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== invite.email) {
      return { success: false, error: 'Email non corrispondente all\'invito' };
    }

    // Create team assistant and update invite
    await prisma.$transaction([
      prisma.teamAssistant.create({
        data: {
          teamId: invite.teamId,
          userId: userId,
        },
      }),
      prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' },
      }),
    ]);

    return { success: true, teamId: invite.teamId };
  } catch (error: any) {
    console.error('Error accepting team invite:', error);
    return { success: false, error: error.message || 'Errore durante l\'accettazione dell\'invito' };
  }
}

// Remove team assistant
export async function removeTeamAssistant(assistantId: string, teamId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.teamAssistant.delete({
      where: {
        id: assistantId,
        teamId: teamId, // Extra security check
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error removing team assistant:', error);
    return { success: false, error: error.message || 'Errore durante la rimozione del vice allenatore' };
  }
}

// Get user role in team
export async function getUserTeamRole(teamId: string, userId: string): Promise<'owner' | 'assistant' | null> {
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, coachId: userId, isDeleted: false },
    });

    if (team) {
      return 'owner';
    }

    const assistant = await prisma.teamAssistant.findFirst({
      where: { teamId, userId },
    });

    if (assistant) {
      return 'assistant';
    }

    return null;
  } catch (error) {
    console.error('Error getting user team role:', error);
    return null;
  }
}

// Helper to generate invite token
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get assistant limits by user tier
export function getAssistantLimitByTier(tier: 'FREE' | 'LEVEL1' | 'PREMIUM'): number {
  switch (tier) {
    case 'FREE': return 1;
    case 'LEVEL1': return 2;
    case 'PREMIUM': return 999; // Unlimited
    default: return 1;
  }
}