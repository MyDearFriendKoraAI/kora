'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { TeamInviteStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

// Schema per creazione invito
const createInviteSchema = z.object({
  teamId: z.string(),
  email: z.string().email(),
  message: z.string().optional(),
});

// Schema per gestione invito (accetta/rifiuta)
const handleInviteSchema = z.object({
  inviteId: z.string(),
  action: z.enum(['accept', 'reject']),
});

// Crea un nuovo invito
export async function createTeamInvite(data: z.infer<typeof createInviteSchema>) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non autorizzato' };
    }

    // Verifica che l'utente sia il proprietario della squadra
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
      select: { coachId: true, name: true },
    });

    if (!team || team.coachId !== user.id) {
      return { success: false, error: 'Non hai i permessi per invitare membri a questa squadra' };
    }

    // Controlla se esiste già un invito pendente per questa email
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        email: data.email,
        teamId: data.teamId,
        status: TeamInviteStatus.PENDING,
      },
    });

    if (existingInvite) {
      return { success: false, error: 'Esiste già un invito pendente per questo utente' };
    }

    // Controlla se l'utente è già membro del team
    const existingMember = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        assistantTeams: {
          where: { teamId: data.teamId },
        },
      },
    });

    if (existingMember?.assistantTeams.length) {
      return { success: false, error: 'Questo utente è già membro della squadra' };
    }

    // Crea il token univoco per l'invito
    const token = randomBytes(32).toString('hex');
    
    // Imposta scadenza a 7 giorni
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Crea l'invito
    const invite = await prisma.teamInvite.create({
      data: {
        email: data.email,
        teamId: data.teamId,
        inviterId: user.id,
        token,
        message: data.message,
        expiresAt,
        role: 'ASSISTANT', // Per ora solo assistenti
        status: TeamInviteStatus.PENDING,
      },
      include: {
        team: {
          select: {
            name: true,
            sport: true,
          },
        },
      },
    });

    // TODO: Inviare email di invito

    return { 
      success: true, 
      data: invite,
      message: `Invito inviato a ${data.email}` 
    };
  } catch (error) {
    console.error('Errore creazione invito:', error);
    return { success: false, error: 'Errore durante la creazione dell\'invito' };
  }
}

// Ottieni inviti pendenti per l'utente corrente
export async function getUserPendingInvites() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non autorizzato' };
    }

    // Trova l'utente nel database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    if (!dbUser) {
      return { success: false, error: 'Utente non trovato' };
    }

    // Ottieni inviti pendenti non scaduti
    const invites = await prisma.teamInvite.findMany({
      where: {
        email: dbUser.email,
        status: TeamInviteStatus.PENDING,
        expiresAt: {
          gt: new Date(),
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
        inviter: {
          select: {
            nome: true,
            cognome: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: invites };
  } catch (error) {
    console.error('Errore recupero inviti:', error);
    return { success: false, error: 'Errore durante il recupero degli inviti' };
  }
}

// Accetta o rifiuta un invito
export async function handleTeamInvite(data: z.infer<typeof handleInviteSchema>) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non autorizzato' };
    }

    // Trova l'utente nel database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    if (!dbUser) {
      return { success: false, error: 'Utente non trovato' };
    }

    // Trova l'invito
    const invite = await prisma.teamInvite.findUnique({
      where: { id: data.inviteId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return { success: false, error: 'Invito non trovato' };
    }

    // Verifica che l'invito sia per questo utente
    if (invite.email !== dbUser.email) {
      return { success: false, error: 'Non sei autorizzato a gestire questo invito' };
    }

    // Verifica che l'invito sia ancora valido
    if (invite.status !== TeamInviteStatus.PENDING) {
      return { success: false, error: 'Questo invito è già stato gestito' };
    }

    if (invite.expiresAt < new Date()) {
      // Marca come scaduto
      await prisma.teamInvite.update({
        where: { id: data.inviteId },
        data: { status: TeamInviteStatus.EXPIRED },
      });
      return { success: false, error: 'Questo invito è scaduto' };
    }

    if (data.action === 'accept') {
      // Inizia una transazione per accettare l'invito
      await prisma.$transaction(async (tx) => {
        // Aggiorna lo stato dell'invito
        await tx.teamInvite.update({
          where: { id: data.inviteId },
          data: { status: TeamInviteStatus.ACCEPTED },
        });

        // Aggiungi l'utente come assistente del team
        await tx.teamAssistant.create({
          data: {
            teamId: invite.teamId,
            userId: user.id,
            permissions: {
              canViewPlayers: true,
              canEditPlayers: false,
              canViewTrainings: true,
              canEditTrainings: false,
              canViewStats: true,
            },
          },
        });
      });

      return { 
        success: true, 
        message: `Ora sei vice allenatore di ${invite.team.name}!`,
        teamId: invite.teamId,
      };
    } else {
      // Rifiuta l'invito
      await prisma.teamInvite.update({
        where: { id: data.inviteId },
        data: { status: TeamInviteStatus.REJECTED },
      });

      return { 
        success: true, 
        message: 'Invito rifiutato',
      };
    }
  } catch (error) {
    console.error('Errore gestione invito:', error);
    return { success: false, error: 'Errore durante la gestione dell\'invito' };
  }
}

// Ottieni inviti inviati da una squadra
export async function getTeamSentInvites(teamId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non autorizzato' };
    }

    // Verifica che l'utente sia il proprietario della squadra
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { coachId: true },
    });

    if (!team || team.coachId !== user.id) {
      return { success: false, error: 'Non hai i permessi per vedere gli inviti di questa squadra' };
    }

    // Ottieni inviti inviati
    const invites = await prisma.teamInvite.findMany({
      where: {
        teamId,
        status: TeamInviteStatus.PENDING,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: invites };
  } catch (error) {
    console.error('Errore recupero inviti inviati:', error);
    return { success: false, error: 'Errore durante il recupero degli inviti' };
  }
}

// Cancella un invito inviato
export async function cancelTeamInvite(inviteId: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Non autorizzato' };
    }

    // Trova l'invito
    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: {
          select: {
            coachId: true,
          },
        },
      },
    });

    if (!invite) {
      return { success: false, error: 'Invito non trovato' };
    }

    // Verifica che l'utente sia il proprietario della squadra
    if (invite.team.coachId !== user.id) {
      return { success: false, error: 'Non hai i permessi per cancellare questo invito' };
    }

    // Elimina l'invito
    await prisma.teamInvite.delete({
      where: { id: inviteId },
    });

    return { success: true, message: 'Invito cancellato' };
  } catch (error) {
    console.error('Errore cancellazione invito:', error);
    return { success: false, error: 'Errore durante la cancellazione dell\'invito' };
  }
}