'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { 
  createTeamInvite, 
  acceptTeamInvite, 
  removeTeamAssistant,
  getTeamAssistantCount,
  getAssistantLimitByTier,
  getUserTeamRole,
  getTeamAssistants,
  getTeamInvites
} from '@/lib/supabase/team-assistant';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email('Email non valida'),
  teamId: z.string().min(1, 'Team ID obbligatorio'),
  message: z.string().max(500).optional(),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token obbligatorio'),
});

const removeAssistantSchema = z.object({
  assistantId: z.string().min(1, 'Assistant ID obbligatorio'),
  teamId: z.string().min(1, 'Team ID obbligatorio'),
});

export async function sendAssistantInviteAction(data: {
  email: string;
  teamId: string;
  message?: string;
}) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Utente non autenticato' };
    }

    // Validate input
    const validatedData = inviteSchema.parse(data);

    // Check if user is owner of the team
    const userRole = await getUserTeamRole(validatedData.teamId, user.id);
    if (userRole !== 'owner') {
      return { success: false, error: 'Non hai i permessi per invitare vice allenatori' };
    }

    // Check assistant limit based on user tier
    const userTier = (user.user_metadata?.tier || 'FREE') as 'FREE' | 'LEVEL1' | 'PREMIUM';
    const assistantLimit = getAssistantLimitByTier(userTier);
    const currentAssistantCount = await getTeamAssistantCount(validatedData.teamId);

    if (currentAssistantCount >= assistantLimit) {
      return { 
        success: false, 
        error: `Limite vice allenatori raggiunto per il piano ${userTier} (${assistantLimit})` 
      };
    }

    // Create invite
    const result = await createTeamInvite({
      email: validatedData.email,
      teamId: validatedData.teamId,
      inviterId: user.id,
      message: validatedData.message,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // TODO: Send email with Resend
    // await sendInviteEmail(result.invite);

    // Revalidate team pages
    revalidatePath(`/teams/${validatedData.teamId}/members`);
    revalidatePath(`/teams/${validatedData.teamId}`);

    return { 
      success: true, 
      message: 'Invito inviato con successo!',
      inviteId: result.invite?.id
    };
  } catch (error: any) {
    console.error('Send invite error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Dati non validi' };
    }
    return { success: false, error: error.message || 'Errore durante l\'invio dell\'invito' };
  }
}

export async function acceptInviteAction(token: string) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Utente non autenticato' };
    }

    // Validate input
    const validatedData = acceptInviteSchema.parse({ token });

    // Accept invite
    const result = await acceptTeamInvite(validatedData.token, user.id);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidate team pages
    if (result.teamId) {
      revalidatePath(`/teams/${result.teamId}/members`);
      revalidatePath(`/teams/${result.teamId}`);
      revalidatePath('/teams');
    }

    return { 
      success: true, 
      teamId: result.teamId,
      message: 'Invito accettato con successo!' 
    };
  } catch (error: any) {
    console.error('Accept invite error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Dati non validi' };
    }
    return { success: false, error: error.message || 'Errore durante l\'accettazione dell\'invito' };
  }
}

export async function removeAssistantAction(assistantId: string, teamId: string) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Utente non autenticato' };
    }

    // Validate input
    const validatedData = removeAssistantSchema.parse({ assistantId, teamId });

    // Check if user is owner of the team
    const userRole = await getUserTeamRole(validatedData.teamId, user.id);
    if (userRole !== 'owner') {
      return { success: false, error: 'Non hai i permessi per rimuovere vice allenatori' };
    }

    // Remove assistant
    const result = await removeTeamAssistant(validatedData.assistantId, validatedData.teamId);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidate team pages
    revalidatePath(`/teams/${validatedData.teamId}/members`);
    revalidatePath(`/teams/${validatedData.teamId}`);

    return { 
      success: true, 
      message: 'Vice allenatore rimosso con successo!' 
    };
  } catch (error: any) {
    console.error('Remove assistant error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Dati non validi' };
    }
    return { success: false, error: error.message || 'Errore durante la rimozione del vice allenatore' };
  }
}

export async function getTeamAssistantsAction(teamId: string) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    const assistants = await getTeamAssistants(teamId);
    
    return {
      success: true,
      assistants,
    };
  } catch (error: any) {
    console.error('Get team assistants error:', error);
    return { error: error.message || 'Errore durante il recupero dei vice allenatori' };
  }
}

export async function getTeamInvitesAction(teamId: string) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    const invites = await getTeamInvites(teamId);
    
    return {
      success: true,
      invites,
    };
  } catch (error: any) {
    console.error('Get team invites error:', error);
    return { error: error.message || 'Errore durante il recupero degli inviti' };
  }
}

export async function resendTeamInviteAction(inviteId: string) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // Get invite details
    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: {
          select: {
            coachId: true,
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return { error: 'Invito non trovato' };
    }

    // Check if user is team owner
    if (invite.team.coachId !== user.id) {
      return { error: 'Non hai i permessi per gestire questo invito' };
    }

    // Update expiry date (extend by 7 days)
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 7);

    await prisma.teamInvite.update({
      where: { id: inviteId },
      data: {
        expiresAt: newExpiryDate,
        createdAt: new Date(), // Update sent date
      },
    });

    // TODO: Send email notification
    // await sendInviteEmail(invite.email, invite.token, invite.team.name);

    revalidatePath(`/teams/${invite.teamId}/members`);
    revalidatePath(`/teams/${invite.teamId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Resend invite error:', error);
    return { error: error.message || 'Errore durante l\'invio dell\'invito' };
  }
}

export async function cancelTeamInviteAction(inviteId: string) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // Get invite details
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
      return { error: 'Invito non trovato' };
    }

    // Check if user is team owner
    if (invite.team.coachId !== user.id) {
      return { error: 'Non hai i permessi per gestire questo invito' };
    }

    // Delete invite
    await prisma.teamInvite.delete({
      where: { id: inviteId },
    });

    revalidatePath(`/teams/${invite.teamId}/members`);
    revalidatePath(`/teams/${invite.teamId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Cancel invite error:', error);
    return { error: error.message || 'Errore durante l\'annullamento dell\'invito' };
  }
}

export async function getUserTeamRoleAction(teamId: string) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Utente non autenticato', role: null };
    }

    const role = await getUserTeamRole(teamId, user.id);

    return { 
      success: true, 
      role,
      userId: user.id
    };
  } catch (error: any) {
    console.error('Get user role error:', error);
    return { success: false, error: error.message || 'Errore durante il recupero del ruolo', role: null };
  }
}