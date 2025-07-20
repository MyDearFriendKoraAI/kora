'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { AuthCard } from '@/components/features/auth/AuthCard';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth';
import { updatePasswordAction } from '@/app/actions/auth';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidToken, setHasValidToken] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  useEffect(() => {
    // Verifica che ci sia un token di reset nell'URL
    const token = searchParams.get('token') || searchParams.get('access_token');
    const type = searchParams.get('type');
    
    if (!token || type !== 'recovery') {
      setHasValidToken(false);
    } else {
      setHasValidToken(true);
    }
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      const result = await updatePasswordAction({
        password: data.password,
      });

      if (result?.error) {
        // Gestione errori specifici
        if (result.error.includes('expired') || result.error.includes('scaduto')) {
          setHasValidToken(false);
          toast.error('Link scaduto. Richiedi un nuovo reset password.');
          return;
        }
        if (result.error.includes('invalid') || result.error.includes('non valido')) {
          setHasValidToken(false);
          toast.error('Link non valido. Richiedi un nuovo reset password.');
          return;
        }
        if (result.error.includes('diversa')) {
          setError('password', { message: 'La nuova password deve essere diversa da quella attuale' });
          return;
        }
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        setIsSuccess(true);
        toast.success('Password aggiornata con successo!');
        
        // Redirect dopo 2 secondi per mostrare l'animazione
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Si è verificato un errore durante l\'aggiornamento');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    
    strength = checks.filter(Boolean).length;
    
    const strengthTexts = [
      '',
      'Molto debole',
      'Debole', 
      'Buona',
      'Forte'
    ];
    
    return {
      strength,
      text: strengthTexts[strength],
      color: strength <= 1 ? 'red' : strength <= 2 ? 'orange' : strength <= 3 ? 'yellow' : 'green'
    };
  };

  const passwordStrength = getPasswordStrength(password || '');

  // Loading state iniziale
  if (hasValidToken === null) {
    return (
      <AuthCard
        title="Verifica in corso..."
        subtitle="Controllo della validità del link"
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifica del token di reset...</p>
        </div>
      </AuthCard>
    );
  }

  // Token non valido o mancante
  if (hasValidToken === false) {
    return (
      <AuthCard
        title="Link non valido"
        subtitle="Il link di reset password non è valido o è scaduto"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              Il link di reset password che hai utilizzato non è più valido o è già stato utilizzato.
            </p>
            <p className="text-sm text-gray-500">
              I link di reset scadono dopo 24 ore per motivi di sicurezza.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/forgot-password">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Richiedi nuovo reset password
              </Button>
            </Link>
            
            <Link
              href="/login"
              className="block w-full text-center text-sm text-gray-600 hover:text-gray-500 transition-colors"
            >
              Torna al login
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthCard
        title="Password aggiornata!"
        subtitle="La tua password è stata modificata con successo"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              La tua password è stata aggiornata con successo.
            </p>
            <p className="text-sm text-gray-500">
              Verrai reindirizzato al login tra un momento...
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </AuthCard>
    );
  }

  // Form di reset password
  return (
    <AuthCard
      title="Nuova password"
      subtitle="Inserisci la tua nuova password"
      footer={
        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium"
          >
            ← Torna al login
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <PasswordInput
            label="Nuova Password"
            placeholder="Crea una password sicura"
            {...register('password')}
            error={errors.password?.message}
            autoComplete="new-password"
            autoFocus
          />
          
          {password && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.color === 'red' ? 'bg-red-500 w-1/4' :
                      passwordStrength.color === 'orange' ? 'bg-orange-500 w-2/4' :
                      passwordStrength.color === 'yellow' ? 'bg-yellow-500 w-3/4' :
                      'bg-green-500 w-full'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength.color === 'red' ? 'text-red-500' :
                  passwordStrength.color === 'orange' ? 'text-orange-500' :
                  passwordStrength.color === 'yellow' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {passwordStrength.text}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p className={password?.length >= 8 ? 'text-green-600' : ''}>
                  ✓ Almeno 8 caratteri
                </p>
                <p className={/[A-Z]/.test(password || '') ? 'text-green-600' : ''}>
                  ✓ Una lettera maiuscola
                </p>
                <p className={/[0-9]/.test(password || '') ? 'text-green-600' : ''}>
                  ✓ Un numero
                </p>
              </div>
            </div>
          )}
        </div>

        <PasswordInput
          label="Conferma Nuova Password"
          placeholder="Ripeti la nuova password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02] disabled:transform-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Aggiornamento in corso...
            </div>
          ) : (
            'Aggiorna Password'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}