import { SportTypeEnum, CreateTeamFormData, UpdateTeamFormData } from '@/lib/validations/team';
import { prisma } from '@/lib/prisma';

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
      category: team.category,
      season: team.season,
      homeField: team.homeField,
      colors: team.colors as { primary: string; secondary: string } | undefined,
      logo: team.logo,
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
      category: team.category,
      season: team.season,
      homeField: team.homeField,
      colors: team.colors as { primary: string; secondary: string } | undefined,
      logo: team.logo,
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
    
    return {
      playersCount: team._count.players,
      trainingsCount: team._count.trainings,
      upcomingTrainings: team.trainings.length,
      lastTraining: lastTraining?.data.toISOString(),
      nextTraining: team.trainings[0]?.data.toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching team stats:', error);
    throw new Error(error.message || 'Errore durante il recupero delle statistiche');
  }
}