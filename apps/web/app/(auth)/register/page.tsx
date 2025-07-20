'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import { AuthCard } from '@/components/features/auth/AuthCard';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';
import { registerAction } from '@/app/actions/auth';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      acceptTerms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const result = await registerAction({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (result?.error) {
        // Gestione errori specifici
        if (result.error.includes('already registered')) {
          setError('email', { message: 'Questa email è già registrata' });
        } else if (result.error.includes('Password should be at least')) {
          setError('password', { message: 'La password deve rispettare i requisiti' });
        } else {
          toast.error(result.error);
        }
        return;
      }

      if (result?.success) {
        setIsSuccess(true);
        toast.success('Registrazione completata! Controlla la tua email.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Si è verificato un errore durante la registrazione');
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

  if (isSuccess) {
    return (
      <AuthCard
        title="Registrazione completata!"
        subtitle="Controlla la tua email per verificare l'account"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              Ti abbiamo inviato un link di verifica all'indirizzo email che hai fornito.
            </p>
            <p className="text-sm text-gray-500">
              Clicca sul link nell'email per attivare il tuo account e iniziare a usare Kora.
            </p>
          </div>

          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Vai al Login
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Crea il tuo account"
      subtitle="Inizia gratis - nessuna carta di credito richiesta"
      footer={
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Hai già un account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Accedi
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome"
            type="text"
            placeholder="Mario"
            {...register('firstName')}
            error={errors.firstName?.message}
            autoComplete="given-name"
          />

          <Input
            label="Cognome"
            type="text"
            placeholder="Rossi"
            {...register('lastName')}
            error={errors.lastName?.message}
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="nome@esempio.it"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="email"
        />

        <div className="space-y-2">
          <PasswordInput
            label="Password"
            placeholder="Crea una password sicura"
            {...register('password')}
            error={errors.password?.message}
            autoComplete="new-password"
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
          label="Conferma Password"
          placeholder="Ripeti la password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <div className="space-y-4">
          <div className="flex items-start">
            <input
              id="acceptTerms"
              type="checkbox"
              {...register('acceptTerms')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
            />
            <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700">
              Accetto i{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                Termini e Condizioni
              </Link>
              {' '}e la{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                Privacy Policy
              </Link>
            </label>
          </div>
          
          {errors.acceptTerms && (
            <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
          )}
        </div>

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
              Registrazione in corso...
            </div>
          ) : (
            'Crea Account'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}