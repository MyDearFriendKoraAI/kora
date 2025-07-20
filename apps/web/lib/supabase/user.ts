'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export interface CreateUserData {
  email: string;
  nome: string;
  cognome: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function ensureUserExists(userId: string) {
  try {
    // Check if user exists in Prisma database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      return { success: true, user: existingUser };
    }

    // Get user data from Supabase Auth
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { error: 'Utente non trovato in Supabase' };
    }

    // Extract name from email or metadata
    const email = user.email!;
    const emailName = email.split('@')[0];
    const [nome = emailName, cognome = ''] = (user.user_metadata?.full_name || emailName).split(' ');

    // Create user in Prisma database
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        nome: nome || 'Utente',
        cognome: cognome || '',
        phone: user.phone || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
      },
    });

    return { success: true, user: newUser };
  } catch (error: any) {
    console.error('Error ensuring user exists:', error);
    return { error: error.message || 'Errore durante la sincronizzazione utente' };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        _count: {
          select: {
            teams: { where: { isDeleted: false } },
          },
        },
      },
    });

    if (!user) {
      return { error: 'Utente non trovato' };
    }

    return { success: true, user };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return { error: error.message || 'Errore durante il recupero del profilo' };
  }
}

export async function updateUserProfile(userId: string, data: Partial<CreateUserData>) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { error: error.message || 'Errore durante l\'aggiornamento del profilo' };
  }
}