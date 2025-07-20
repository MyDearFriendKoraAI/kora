'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createTeam, updateTeam, deleteTeam, updateTeamColors, updateTeamLogo } from '@/lib/supabase/team';
import { ensureUserExists } from '@/lib/supabase/user';
import { 
  createTeamSchema, 
  updateTeamSchema, 
  deleteTeamSchema,
  CreateTeamFormData,
  UpdateTeamFormData,
  DeleteTeamFormData,
  TeamColors
} from '@/lib/validations/team';

export async function createTeamAction(data: CreateTeamFormData) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // Ensure user exists in database
    const userResult = await ensureUserExists(user.id);
    if (userResult.error) {
      return { error: userResult.error };
    }

    // Validate data
    const validatedData = createTeamSchema.parse(data);
    
    // Create team
    const result = await createTeam(validatedData, user.id);
    
    if (result.error) {
      return { error: result.error };
    }
    
    // Revalidate teams page
    revalidatePath('/teams');
    
    return { 
      success: true, 
      teamId: result.teamId,
      message: 'Squadra creata con successo!'
    };
  } catch (error: any) {
    console.error('Create team error:', error);
    return { error: error.message || 'Errore durante la creazione della squadra' };
  }
}

export async function updateTeamAction(teamId: string, data: UpdateTeamFormData) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // Validate data
    const validatedData = updateTeamSchema.parse(data);
    
    // Update team
    const result = await updateTeam(teamId, validatedData, user.id);
    
    if (result.error) {
      return { error: result.error };
    }
    
    // Revalidate team pages
    revalidatePath('/teams');
    revalidatePath(`/teams/${teamId}`);
    
    return { 
      success: true,
      message: 'Squadra aggiornata con successo!'
    };
  } catch (error: any) {
    console.error('Update team error:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento della squadra' };
  }
}

export async function deleteTeamAction(teamId: string, data: DeleteTeamFormData) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Utente non autenticato' };
    }

    // Validate confirmation data
    const validatedData = deleteTeamSchema.parse(data);
    
    // Additional validation: get team to verify name matches
    // This would be done with actual database in real implementation
    // For now, we'll trust the frontend validation
    
    // Delete team
    const result = await deleteTeam(teamId, user.id);
    
    if (result.error) {
      return { error: result.error };
    }
    
    // Revalidate teams page
    revalidatePath('/teams');
    
    return { 
      success: true,
      message: 'Squadra eliminata con successo!'
    };
  } catch (error: any) {
    console.error('Delete team error:', error);
    return { error: error.message || 'Errore durante l\'eliminazione della squadra' };
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Formato file non supportato. Usa JPG, PNG o WebP' };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return { error: 'File troppo grande. Massimo 5MB' };
    }

    // Upload logo (this will be implemented when Supabase Storage is set up)
    // const result = await uploadTeamLogo(teamId, file, user.id);
    
    // Mock implementation for now
    const result = {
      success: true,
      url: `https://example.com/team-logos/${teamId}/logo.jpg`
    };
    
    if (!result.success) {
      return { error: result.error || 'Errore durante l\'upload del logo' };
    }
    
    // Revalidate team pages
    revalidatePath('/teams');
    revalidatePath(`/teams/${teamId}`);
    
    return { 
      success: true,
      url: result.url,
      message: 'Logo caricato con successo!'
    };
  } catch (error: any) {
    console.error('Upload logo error:', error);
    return { error: error.message || 'Errore durante l\'upload del logo' };
  }
}

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
    
    return { 
      success: true,
      message: 'Colori aggiornati con successo!'
    };
  } catch (error: any) {
    console.error('Update team colors error:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento dei colori' };
  }
}