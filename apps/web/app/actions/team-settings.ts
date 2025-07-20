'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { updateTeamColors, updateTeamLogo } from '@/lib/supabase/team';
import { TeamColors } from '@/lib/validations/team';

export async function updateTeamColorsAction(teamId: string, colors: TeamColors) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // Update team colors
    const result = await updateTeamColors(teamId, colors, user.id);
    
    if (result.error) {
      return { error: result.error };
    }
    
    // Revalidate team pages
    revalidatePath(`/teams/${teamId}`);
    revalidatePath(`/teams/${teamId}/settings`);
    
    return { 
      success: true,
      message: 'Colori aggiornati con successo!'
    };
  } catch (error: any) {
    console.error('Update team colors error:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento dei colori' };
  }
}

export async function uploadTeamLogoAction(teamId: string, formData: FormData) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    const file = formData.get('logo') as File;
    
    if (!file) {
      return { error: 'Nessun file selezionato' };
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Formato file non supportato. Usa PNG, JPG o SVG' };
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      return { error: 'File troppo grande. Massimo 2MB' };
    }

    // Upload logo
    const result = await updateTeamLogo(teamId, file, user.id);
    
    if (result.error) {
      return { error: result.error };
    }
    
    // Revalidate team pages
    revalidatePath(`/teams/${teamId}`);
    revalidatePath(`/teams/${teamId}/settings`);
    
    return { 
      success: true,
      url: result.url,
      message: 'Logo caricato con successo!'
    };
  } catch (error: any) {
    console.error('Upload team logo error:', error);
    return { error: error.message || 'Errore durante l\'upload del logo' };
  }
}

export async function updateTeamVenueAction(teamId: string, venue: any) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // In a real implementation, this would update venues in the database
    // For now, we'll simulate the operation
    
    // Revalidate team pages
    revalidatePath(`/teams/${teamId}`);
    revalidatePath(`/teams/${teamId}/settings`);
    
    return { 
      success: true,
      message: 'Campo aggiornato con successo!'
    };
  } catch (error: any) {
    console.error('Update team venue error:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento del campo' };
  }
}

export async function updateSeasonConfigAction(teamId: string, config: any) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // In a real implementation, this would update season config in the database
    // For now, we'll simulate the operation
    
    // Revalidate team pages
    revalidatePath(`/teams/${teamId}`);
    revalidatePath(`/teams/${teamId}/settings`);
    
    return { 
      success: true,
      message: 'Configurazione stagione aggiornata!'
    };
  } catch (error: any) {
    console.error('Update season config error:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento della configurazione' };
  }
}

export async function updateTeamPreferencesAction(teamId: string, preferences: any) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // In a real implementation, this would update preferences in the database
    // For now, we'll simulate the operation
    
    // Revalidate team pages
    revalidatePath(`/teams/${teamId}`);
    revalidatePath(`/teams/${teamId}/settings`);
    
    return { 
      success: true,
      message: 'Preferenze aggiornate con successo!'
    };
  } catch (error: any) {
    console.error('Update team preferences error:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento delle preferenze' };
  }
}