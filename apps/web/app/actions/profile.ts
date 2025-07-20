'use server';

import { revalidatePath } from 'next/cache';
import { updateUserProfile, ProfileData } from '@/lib/supabase/profile';
import { getUser } from '@/lib/supabase/auth';

export async function updateProfileAction(profileData: ProfileData) {
  try {
    const user = await getUser();
    
    if (!user) {
      throw new Error('Utente non autenticato');
    }

    const updatedProfile = await updateUserProfile(user.id, profileData);
    
    // Aggiorna i metadati utente in Supabase Auth
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    
    await supabase.auth.updateUser({
      data: {
        first_name: profileData.nome,
        last_name: profileData.cognome,
        full_name: `${profileData.nome} ${profileData.cognome}`,
        avatar_url: profileData.avatarUrl,
      }
    });

    revalidatePath('/profile');
    revalidatePath('/', 'layout');
    
    return { 
      success: true, 
      message: 'Profilo aggiornato con successo!',
      data: updatedProfile
    };
  } catch (error: any) {
    return { error: error.message };
  }
}