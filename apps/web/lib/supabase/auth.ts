import { createClient } from './server';

export type AuthError = {
  message: string;
  status?: number;
};

const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email o password non corretti',
  USER_EXISTS: 'Un utente con questa email è già registrato',
  WEAK_PASSWORD: 'La password deve rispettare i requisiti di sicurezza',
  INVALID_EMAIL: 'Inserisci un\'email valida',
  EMAIL_NOT_CONFIRMED: 'Conferma il tuo account tramite email prima di accedere',
  TOO_MANY_REQUESTS: 'Troppi tentativi. Riprova tra qualche minuto',
  NETWORK_ERROR: 'Errore di connessione. Controlla la tua connessione internet',
  GENERIC_ERROR: 'Si è verificato un errore imprevisto. Riprova più tardi',
  TOKEN_EXPIRED: 'Link scaduto, richiedi un nuovo reset password',
  TOKEN_INVALID: 'Link non valido o già utilizzato',
  SAME_PASSWORD: 'La nuova password deve essere diversa da quella attuale',
};

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        throw new Error(AUTH_ERRORS.USER_EXISTS);
      }
      if (error.message.includes('Password should be at least')) {
        throw new Error(AUTH_ERRORS.WEAK_PASSWORD);
      }
      if (error.message.includes('Invalid email')) {
        throw new Error(AUTH_ERRORS.INVALID_EMAIL);
      }
      if (error.message.includes('rate limit')) {
        throw new Error(AUTH_ERRORS.TOO_MANY_REQUESTS);
      }
      throw new Error(error.message);
    }

    return { user: data.user, session: data.session };
  } catch (error: any) {
    throw new Error(error.message || AUTH_ERRORS.GENERIC_ERROR);
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
        throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error(AUTH_ERRORS.EMAIL_NOT_CONFIRMED);
      }
      if (error.message.includes('rate limit')) {
        throw new Error(AUTH_ERRORS.TOO_MANY_REQUESTS);
      }
      throw new Error(error.message);
    }

    return { user: data.user, session: data.session };
  } catch (error: any) {
    throw new Error(error.message || AUTH_ERRORS.GENERIC_ERROR);
  }
}

export async function signOut() {
  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  } catch (error: any) {
    throw new Error(error.message || AUTH_ERRORS.GENERIC_ERROR);
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error: any) {
    throw new Error(error.message || AUTH_ERRORS.GENERIC_ERROR);
  }
}

export async function getUser() {
  const supabase = createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return user;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const supabase = createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return session;
  } catch (error) {
    return null;
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      if (error.message.includes('Password should be at least')) {
        throw new Error(AUTH_ERRORS.WEAK_PASSWORD);
      }
      if (error.message.includes('New password should be different')) {
        throw new Error(AUTH_ERRORS.SAME_PASSWORD);
      }
      if (error.message.includes('Token has expired') || error.message.includes('expired')) {
        throw new Error(AUTH_ERRORS.TOKEN_EXPIRED);
      }
      if (error.message.includes('Invalid token') || error.message.includes('invalid')) {
        throw new Error(AUTH_ERRORS.TOKEN_INVALID);
      }
      throw new Error(error.message);
    }

    return { user: data.user };
  } catch (error: any) {
    throw new Error(error.message || AUTH_ERRORS.GENERIC_ERROR);
  }
}