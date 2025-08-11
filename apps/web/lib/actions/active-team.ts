'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema per impostare squadra attiva
const setActiveTeamSchema = z.object({
  teamId: z.string(),
});

// Ottieni la squadra attiva dell'utente
export async function getActiveTeam() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non autorizzato' };
    }

    // Trova l'utente con la squadra attiva
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        activeTeam: {
          include: {
            _count: {
              select: {
                players: true,
                trainings: true,
              },
            },
          },
        },
      },
    });

    if (!dbUser) {
      return { success: false, error: 'Utente non trovato' };
    }

    // Se non ha una squadra attiva, trova la prima squadra disponibile
    let activeTeam = dbUser.activeTeam;
    
    if (!activeTeam || activeTeam.isDeleted) {
      // Trova la prima squadra dell'utente (proprietario o assistente)
      const ownedTeam = await prisma.team.findFirst({
        where: {
          coachId: user.id,
          isDeleted: false,
        },
        include: {
          _count: {
            select: {
              players: true,
              trainings: true,
            },
          },
        },
      });

      const assistantTeam = await prisma.teamAssistant.findFirst({
        where: {
          userId: user.id,
          team: {
            isDeleted: false,
          },
        },
        include: {
          team: {
            include: {
              _count: {
                select: {
                  players: true,
                  trainings: true,
                },
              },
            },
          },
        },
      });

      // Priorità: squadra propria > squadra assistente
      const firstTeam = ownedTeam || assistantTeam?.team;
      
      if (firstTeam) {
        // Imposta come squadra attiva
        await prisma.user.update({
          where: { id: user.id },
          data: { activeTeamId: firstTeam.id },
        });
        
        activeTeam = firstTeam;
      }
    }

    if (!activeTeam) {
      return { success: true, data: null };
    }

    // Determina il ruolo dell'utente nella squadra
    const isOwner = activeTeam.coachId === user.id;
    const assistantRole = !isOwner ? await prisma.teamAssistant.findUnique({
      where: {
        teamId_userId: {
          teamId: activeTeam.id,
          userId: user.id,
        },
      },
    }) : null;

    const teamData = {
      id: activeTeam.id,
      name: activeTeam.name,
      sport: activeTeam.sport,
      category: activeTeam.category,
      season: activeTeam.season,
      homeField: activeTeam.homeField,
      colors: activeTeam.colors,
      logo: activeTeam.logo,
      coachId: activeTeam.coachId,
      isDeleted: activeTeam.isDeleted,
      createdAt: activeTeam.createdAt.toISOString(),
      updatedAt: activeTeam.updatedAt.toISOString(),
      role: isOwner ? 'owner' : 'assistant',
      permissions: assistantRole?.permissions || null,
      _count: activeTeam._count,
    };

    return { success: true, data: teamData };
  } catch (error) {
    console.error('Errore recupero squadra attiva:', error);
    return { success: false, error: 'Errore durante il recupero della squadra attiva' };
  }
}

// Imposta la squadra attiva per l'utente
export async function setActiveTeam(data: z.infer<typeof setActiveTeamSchema>) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non autorizzato' };
    }

    const validatedData = setActiveTeamSchema.parse(data);

    // Verifica che l'utente abbia accesso alla squadra
    const hasAccess = await prisma.team.findFirst({
      where: {
        id: validatedData.teamId,
        isDeleted: false,
        OR: [
          { coachId: user.id }, // È il proprietario
          { 
            assistants: {
              some: { userId: user.id }
            }
          }, // È un assistente
        ],
      },
    });

    if (!hasAccess) {
      return { success: false, error: 'Non hai accesso a questa squadra' };
    }

    // Aggiorna la squadra attiva
    await prisma.user.update({
      where: { id: user.id },
      data: { activeTeamId: validatedData.teamId },
    });

    return { success: true, message: 'Squadra attiva aggiornata con successo' };
  } catch (error) {
    console.error('Errore impostazione squadra attiva:', error);
    return { success: false, error: 'Errore durante l\'impostazione della squadra attiva' };
  }
}

// Ottieni tutte le squadre disponibili per l'utente (per la selezione)
export async function getAvailableTeams() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non autorizzato' };
    }

    // Ottieni squadre possedute
    const ownedTeams = await prisma.team.findMany({
      where: {
        coachId: user.id,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        sport: true,
        category: true,
        logo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ottieni squadre dove è assistente
    const assistantTeams = await prisma.teamAssistant.findMany({
      where: {
        userId: user.id,
        team: {
          isDeleted: false,
        },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            sport: true,
            category: true,
            logo: true,
          },
        },
      },
    });

    const allTeams = [
      ...ownedTeams.map(team => ({
        ...team,
        role: 'owner' as const,
      })),
      ...assistantTeams
        .filter(at => at.team)
        .map(at => ({
          ...at.team!,
          role: 'assistant' as const,
        })),
    ];

    return { success: true, data: allTeams };
  } catch (error) {
    console.error('Errore recupero squadre disponibili:', error);
    return { success: false, error: 'Errore durante il recupero delle squadre' };
  }
}