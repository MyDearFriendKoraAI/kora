'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';

import { FormSteps, StepNavigation } from '@/components/features/team/FormSteps';
import { SportSelector } from '@/components/features/team/SportIcon';
import { ColorPicker } from '@/components/features/team/ColorPicker';
import { Input } from '@/components/ui/Input';
import { LimitBanner } from '@/components/features/team/LimitBanner';
import { 
  createTeamSchema, 
  CreateTeamFormData,
  COMMON_CATEGORIES,
  SPORT_DEFAULT_COLORS,
  SportTypeEnum 
} from '@/lib/validations/team';
import { createTeamAction, getUserTeamsAction } from '@/app/actions/team';
import { useTeamStore } from '@/stores/team-store';

const STEPS = [
  { id: 1, title: 'Sport', description: 'Scegli lo sport' },
  { id: 2, title: 'Dettagli', description: 'Nome e categoria' },
  { id: 3, title: 'Personalizzazione', description: 'Colori e campo' },
];

export default function NewTeamPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { teams, setUserTeams } = useTeamStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      season: '2024/2025',
      colors: SPORT_DEFAULT_COLORS.CALCIO,
      name: '',
      category: '',
      homeField: '',
    },
  });

  const watchedSport = watch('sport');
  const watchedColors = watch('colors');

  // Check team limit
  const teamCount = teams.length;
  const maxCount = 2;
  const isAtLimit = teamCount >= maxCount;

  // Update default colors when sport changes
  const handleSportSelect = (sport: SportTypeEnum) => {
    setValue('sport', sport);
    setValue('colors', SPORT_DEFAULT_COLORS[sport]);
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateTeamFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['sport'];
        break;
      case 2:
        fieldsToValidate = ['name', 'category', 'season'];
        break;
      case 3:
        fieldsToValidate = ['homeField', 'colors'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: CreateTeamFormData) => {
    try {
      setIsLoading(true);
      const result = await createTeamAction(data);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.success && result.teamId) {
        // Refresh teams data in store
        const teamsResult = await getUserTeamsAction();
        if (teamsResult.success && teamsResult.teams) {
          setUserTeams(teamsResult.teams);
        }
        
        toast.success('Squadra creata con successo!');
        router.push(`/teams/${result.teamId}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Errore durante la creazione della squadra');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!watchedSport;
      case 2:
        return !!(watch('name') && watch('category'));
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crea nuova squadra</h1>
          <p className="text-gray-600">Configura la tua squadra in 3 semplici passi</p>
        </div>

        {/* Team Limit Banner - Solo se non al limite */}
        {!isAtLimit && teamCount > 0 && (
          <LimitBanner
            variant="warning"
            currentCount={teamCount}
            maxCount={maxCount}
            className="mb-8"
          />
        )}

        {/* Only show form if not at limit */}
        {!isAtLimit && (
          <FormSteps steps={STEPS} currentStep={currentStep}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Sport Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Che sport praticate?
                  </h2>
                  <p className="text-gray-600">
                    Seleziona lo sport principale della squadra
                  </p>
                </div>

                <SportSelector
                  selectedSport={watchedSport}
                  onSelect={handleSportSelect}
                />

                {errors.sport && (
                  <p className="text-sm text-red-500 text-center">{errors.sport.message}</p>
                )}
              </div>
            )}

            {/* Step 2: Team Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Dettagli della squadra
                  </h2>
                  <p className="text-gray-600">
                    Inserisci le informazioni base
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Nome squadra"
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder="es. Juventus Academy"
                    autoFocus
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleziona categoria</option>
                      {COMMON_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>

                  <Input
                    label="Stagione"
                    {...register('season')}
                    error={errors.season?.message}
                    placeholder="2024/2025"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Customization */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Personalizza la squadra
                  </h2>
                  <p className="text-gray-600">
                    Aggiungi colori e informazioni aggiuntive (opzionale)
                  </p>
                </div>

                <div className="space-y-6">
                  <Input
                    label="Campo di casa"
                    {...register('homeField')}
                    error={errors.homeField?.message}
                    placeholder="es. Stadio Comunale, PalaSport..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Colori squadra
                    </label>
                    <ColorPicker
                      colors={watchedColors || SPORT_DEFAULT_COLORS.CALCIO}
                      onChange={(colors) => setValue('colors', colors)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <StepNavigation
              currentStep={currentStep}
              totalSteps={STEPS.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmit(onSubmit)}
              isLoading={isLoading}
              canProceed={canProceed()}
            />
          </form>
        </FormSteps>
        )}
      </div>
    </div>
  );
}