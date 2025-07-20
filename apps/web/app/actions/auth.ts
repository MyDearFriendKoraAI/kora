'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { signIn, signUp, signOut, resetPassword } from '@/lib/supabase/auth';

export async function loginAction(data: { email: string; password: string }) {
  try {
    const result = await signIn(data.email, data.password);
    
    if (result.session) {
      revalidatePath('/', 'layout');
      redirect('/dashboard');
    }
    
    throw new Error('Login fallito');
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function registerAction(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  try {
    const result = await signUp(
      data.email,
      data.password,
      data.firstName,
      data.lastName
    );
    
    if (result.session) {
      revalidatePath('/', 'layout');
      redirect('/dashboard');
    }
    
    // Se non c'è sessione, probabilmente l'email deve essere confermata
    return { 
      success: true, 
      message: 'Registrazione completata! Controlla la tua email per confermare l\'account.' 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logoutAction() {
  try {
    await signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function forgotPasswordAction(data: { email: string }) {
  try {
    await resetPassword(data.email);
    return { 
      success: true, 
      message: 'Email di recupero password inviata! Controlla la tua casella di posta.' 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}