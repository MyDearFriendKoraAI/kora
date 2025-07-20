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
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { loginAction } from '@/app/actions/auth';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const result = await loginAction({
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // Gestione errori specifici
        if (result.error.includes('Invalid login credentials')) {
          setError('email', { message: 'Email o password non corretti' });
          setError('password', { message: 'Email o password non corretti' });
        } else if (result.error.includes('Email not confirmed')) {
          toast.error('Conferma il tuo account tramite email prima di accedere');
        } else {
          toast.error(result.error);
        }
        return;
      }

      toast.success('Accesso effettuato con successo!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Si è verificato un errore durante l\'accesso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Bentornato"
      subtitle="Accedi al tuo account per continuare"
      footer={
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Non hai un account?{' '}
            <Link 
              href="/register" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Registrati gratis
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="nome@esempio.it"
            {...register('email')}
            error={errors.email?.message}
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            placeholder="Inserisci la tua password"
            {...register('password')}
            error={errors.password?.message}
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Ricordami
            </label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Password dimenticata?
          </Link>
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
              Accesso in corso...
            </div>
          ) : (
            'Accedi'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}