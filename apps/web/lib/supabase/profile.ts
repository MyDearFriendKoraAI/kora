import { createClient } from './server';

export interface ProfileData {
  nome: string;
  cognome: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Errore nel recupero del profilo');
  }
}

export async function updateUserProfile(userId: string, profileData: ProfileData) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        nome: profileData.nome,
        cognome: profileData.cognome,
        phone: profileData.phone || null,
        bio: profileData.bio || null,
        avatarUrl: profileData.avatarUrl || null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Errore nell\'aggiornamento del profilo');
  }
}