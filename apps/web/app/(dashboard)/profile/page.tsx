'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { ProfileSection } from '@/components/features/profile/ProfileSection';
import { AvatarUpload } from '@/components/features/profile/AvatarUpload';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updateProfileSchema, UpdateProfileFormData } from '@/lib/validations/auth';
import { updateProfileAction } from '@/app/actions/profile';

interface UserProfile {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  tier: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Carica i dati del profilo
  useEffect(() => {
    if (user) {
      // Simula caricamento dati profilo - in realtà dovresti fare una chiamata API
      const mockProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        nome: user.user_metadata?.first_name || '',
        cognome: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        bio: user.user_metadata?.bio || '',
        avatarUrl: user.user_metadata?.avatar_url || null,
        tier: 'FREE',
        createdAt: user.created_at || '',
      };
      
      setProfileData(mockProfile);
      reset({
        nome: mockProfile.nome,
        cognome: mockProfile.cognome,
        phone: mockProfile.phone || '',
        bio: mockProfile.bio || '',
        avatarUrl: mockProfile.avatarUrl || '',
      });
    }
  }, [user, reset]);

  // Monitora changes per unsaved warning
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Warning per modifiche non salvate
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      setIsLoading(true);
      const result = await updateProfileAction(data);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        toast.success(result.message);
        reset(data); // Reset form dirty state
        setHasUnsavedChanges(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setValue('avatarUrl', url, { shouldDirty: true });
    setHasUnsavedChanges(true);
  };

  const getTierBadge = (tier: string) => {
    const configs = {
      FREE: { label: 'Gratuito', color: 'bg-gray-100 text-gray-800' },
      LEVEL1: { label: 'Level 1', color: 'bg-blue-100 text-blue-800' },
      PREMIUM: { label: 'Premium', color: 'bg-purple-100 text-purple-800' },
    };
    
    const config = configs[tier as keyof typeof configs] || configs.FREE;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Skeleton loading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Il mio profilo</h1>
            <p className="text-gray-600">Gestisci le tue informazioni personali e impostazioni account</p>
          </div>
          {getTierBadge(profileData.tier)}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonna sinistra */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dati Personali */}
            <ProfileSection
              title="Dati Personali"
              description="Le tue informazioni di base"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    {...register('nome')}
                    error={errors.nome?.message}
                    placeholder="Il tuo nome"
                  />
                  <Input
                    label="Cognome"
                    {...register('cognome')}
                    error={errors.cognome?.message}
                    placeholder="Il tuo cognome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Verificata
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    L'email non può essere modificata. Contatta il supporto se necessario.
                  </p>
                </div>

                <Input
                  label="Telefono"
                  {...register('phone')}
                  error={errors.phone?.message}
                  placeholder="+39 123 456 7890"
                  type="tel"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografia
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Racconta qualcosa di te..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {watch('bio')?.length || 0}/500 caratteri
                  </p>
                </div>
              </div>
            </ProfileSection>

            {/* Impostazioni Account */}
            <ProfileSection
              title="Impostazioni Account"
              description="Sicurezza e preferenze"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">Ultima modifica: Mai</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Cambia Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Autenticazione a due fattori</h4>
                    <p className="text-sm text-gray-600">Non attiva</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configura
                  </Button>
                </div>
              </div>
            </ProfileSection>
          </div>

          {/* Colonna destra */}
          <div className="space-y-6">
            {/* Avatar */}
            <ProfileSection
              title="Foto Profilo"
              description="La tua immagine"
            >
              <AvatarUpload
                currentAvatarUrl={watch('avatarUrl')}
                userName={`${profileData.nome} ${profileData.cognome}`}
                userId={profileData.id}
                onAvatarUpdate={handleAvatarUpdate}
              />
            </ProfileSection>

            {/* Abbonamento */}
            <ProfileSection
              title="Abbonamento"
              description="Il tuo piano attuale"
            >
              <div className="text-center space-y-4">
                <div>
                  {getTierBadge(profileData.tier)}
                  <h4 className="mt-2 font-medium text-gray-900">Piano Gratuito</h4>
                  <p className="text-sm text-gray-600">
                    Funzionalità di base incluse
                  </p>
                </div>

                {profileData.tier === 'FREE' && (
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      Upgrade a Premium
                    </Button>
                    <p className="text-xs text-gray-500">
                      • AI Coach illimitato<br/>
                      • Squadre multiple<br/>
                      • Analytics avanzate
                    </p>
                  </div>
                )}
              </div>
            </ProfileSection>
          </div>
        </div>

        {/* Actions */}
        {hasUnsavedChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-amber-800">
                  Hai modifiche non salvate
                </span>
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset();
                    setHasUnsavedChanges(false);
                  }}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvataggio...' : 'Salva modifiche'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}