'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';

import { AuthCard } from '@/components/features/auth/AuthCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';
import { forgotPasswordAction } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      const result = await forgotPasswordAction(data);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        setIsSuccess(true);
        toast.success('Email di recupero inviata!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Si è verificato un errore');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="Email inviata!"
        subtitle="Controlla la tua casella di posta"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              Ti abbiamo inviato un link per reimpostare la password all'indirizzo{' '}
              <span className="font-medium">{getValues('email')}</span>
            </p>
            <p className="text-sm text-gray-500">
              Il link sarà valido per 24 ore. Controlla anche la cartella spam.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="w-full"
            >
              Invia di nuovo
            </Button>
            
            <Link
              href="/login"
              className="block w-full text-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              Torna al login
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Password dimenticata?"
      subtitle="Inserisci la tua email per ricevere un link di recupero"
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
        <Input
          label="Email"
          type="email"
          placeholder="nome@esempio.it"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="email"
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
              Invio in corso...
            </div>
          ) : (
            'Invia link di recupero'
          )}
        </Button>
      </form>
    </AuthCard>
  );
}