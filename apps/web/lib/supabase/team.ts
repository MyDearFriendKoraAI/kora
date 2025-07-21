import { SportTypeEnum, CreateTeamFormData, UpdateTeamFormData, TeamColors } from '@/lib/validations/team';
import { prisma } from '@/lib/prisma';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { getTeamAssistantCount } from './team-assistant';

export interface TeamMember {
  userId: string;
  role: 'owner' | 'assistant' | 'player' | 'viewer';
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  sport: SportTypeEnum;
  category?: string;
  season: string;
  homeField?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  logo?: string;
  coachId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  _count?: {
    players: number;
  };
}

// Fetch teams for a user (server-side)
export async function getTeamsByUserId(userId: string): Promise<Team[]> {
  try {
    const teams = await prisma.team.findMany({
      where: {
        coachId: userId,
        isDeleted: false,
      },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      sport: team.sport as SportTypeEnum,
      category: team.category || undefined,
      season: team.season,
      homeField: team.homeField || undefined,
      colors: team.colors as { primary: string; secondary: string } | undefined,
      logo: team.logo || undefined,
      coachId: team.coachId,
      isDeleted: team.isDeleted,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      _count: {
        players: team._count.players,
      },
    }));
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

// Get team count for a user (for limit validation)
export async function getTeamCountByUserId(userId: string): Promise<number> {
  try {
    const count = await prisma.team.count({
      where: {
        coachId: userId,
        isDeleted: false,
      },
    });
    return count;
  } catch (error) {
    console.error('Error counting teams:', error);
    return 0;
  }
}

// Get single team by ID
export async function getTeamById(teamId: string, userId: string): Promise<Team | null> {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: userId,
        isDeleted: false,
      },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!team) return null;

    return {
      id: team.id,
      name: team.name,
      sport: team.sport as SportTypeEnum,
      category: team.category || undefined,
      season: team.season,
      homeField: team.homeField || undefined,
      colors: team.colors as { primary: string; secondary: string } | undefined,
      logo: team.logo || undefined,
      coachId: team.coachId,
      isDeleted: team.isDeleted,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      _count: {
        players: team._count.players,
      },
    };
  } catch (error) {
    console.error('Error fetching team by ID:', error);
    return null;
  }
}

// Create new team (server-side)
export async function createTeam(data: CreateTeamFormData, userId: string): Promise<{ success: boolean; teamId?: string; error?: string }> {
  try {
    // Check team limit (maximum 2 teams per user)
    const currentTeamCount = await getTeamCountByUserId(userId);
    if (currentTeamCount >= 2) {
      return {
        success: false,
        error: 'Limite squadre raggiunto. Puoi creare massimo 2 squadre per account.',
      };
    }

    const team = await prisma.team.create({
      data: {
        name: data.name,
        sport: data.sport,
        category: data.category,
        season: data.season,
        homeField: data.homeField,
        colors: data.colors,
        coachId: userId,
      },
    });
    
    return {
      success: true,
      teamId: team.id,
    };
  } catch (error: any) {
    console.error('Error creating team:', error);
    return {
      success: false,
      error: error.message || 'Errore durante la creazione della squadra',
    };
  }
}

// Update team
export async function updateTeam(teamId: string, data: UpdateTeamFormData, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify ownership
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: userId,
        isDeleted: false,
      },
    });
    
    if (!existingTeam) {
      throw new Error('Non hai i permessi per modificare questa squadra');
    }
    
    await prisma.team.update({
      where: { id: teamId },
      data: {
        name: data.name,
        category: data.category,
        season: data.season,
        homeField: data.homeField,
        colors: data.colors,
        logo: data.logo,
      },
    });
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error updating team:', error);
    return {
      success: false,
      error: error.message || 'Errore durante l\'aggiornamento della squadra',
    };
  }
}

// Soft delete team
export async function deleteTeam(teamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify ownership
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: userId,
        isDeleted: false,
      },
    });
    
    if (!existingTeam) {
      throw new Error('Non hai i permessi per eliminare questa squadra');
    }
    
    // Soft delete
    await prisma.team.update({
      where: { id: teamId },
      data: { isDeleted: true },
    });
    
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error deleting team:', error);
    return {
      success: false,
      error: error.message || 'Errore durante l\'eliminazione della squadra',
    };
  }
}

// Upload team logo to Supabase Storage
export async function uploadTeamLogo(teamId: string, file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createBrowserClient();
    
    // Verify team ownership
    const team = await getTeamById(teamId, userId);
    if (!team || team.coachId !== userId) {
      throw new Error('Non hai i permessi per modificare questa squadra');
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${teamId}/${Date.now()}-logo.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('team-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      throw new Error(`Errore upload: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('team-logos')
      .getPublicUrl(fileName);
    
    // Update team with new logo URL
    // This would be a database update in real implementation
    
    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Errore durante l\'upload del logo',
    };
  }
}

// Helper to get team statistics
export async function getTeamStats(teamId: string, userId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: userId,
        isDeleted: false,
      },
      include: {
        _count: {
          select: {
            players: true,
            trainings: true,
          },
        },
        trainings: {
          where: {
            data: {
              gte: new Date(),
            },
          },
          orderBy: {
            data: 'asc',
          },
          take: 1,
        },
      },
    });
    
    if (!team) {
      throw new Error('Squadra non trovata');
    }
    
    // Get last training
    const lastTraining = await prisma.training.findFirst({
      where: {
        teamId: teamId,
        data: {
          lt: new Date(),
        },
      },
      orderBy: {
        data: 'desc',
      },
    });

    // Get assistants count
    const assistantsCount = await getTeamAssistantCount(teamId);
    
    return {
      playersCount: team._count.players,
      trainingsCount: team._count.trainings,
      upcomingTrainings: team.trainings.length,
      assistantsCount,
      lastTraining: lastTraining?.data.toISOString(),
      nextTraining: team.trainings[0]?.data.toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching team stats:', error);
    throw new Error(error.message || 'Errore durante il recupero delle statistiche');
  }
}

export async function updateTeamColors(teamId: string, colors: TeamColors, userId: string) {
  try {
    const team = await prisma.team.update({
      where: {
        id: teamId,
        coachId: userId,
      },
      data: {
        colors: colors as any, // Prisma JsonValue type
      },
    });

    return { success: true, team };
  } catch (error: any) {
    console.error('Error updating team colors:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento dei colori' };
  }
}

export async function updateTeamLogo(teamId: string, file: File, userId: string) {
  try {
    // In a real implementation, this would:
    // 1. Upload file to Supabase Storage
    // 2. Get the public URL
    // 3. Update team record with new logo URL
    
    // For now, we'll simulate with a mock URL
    const mockUrl = `https://example.com/team-logos/${teamId}/logo-${Date.now()}.${file.name.split('.').pop()}`;
    
    const team = await prisma.team.update({
      where: {
        id: teamId,
        coachId: userId,
      },
      data: {
        logo: mockUrl,
      },
    });

    return { success: true, url: mockUrl, team };
  } catch (error: any) {
    console.error('Error updating team logo:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento del logo' };
  }
}