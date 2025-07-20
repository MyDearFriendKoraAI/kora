'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Team } from '@/lib/supabase/team';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from './ColorPicker';
import { LogoUpload } from './LogoUpload';
import { DeleteTeamModal } from './DeleteTeamModal';
import { 
  updateTeamSchema, 
  UpdateTeamFormData,
  COMMON_CATEGORIES 
} from '@/lib/validations/team';
import { updateTeamAction } from '@/app/actions/team';

interface TeamSettingsProps {
  team: Team;
}

export function TeamSettings({ team }: TeamSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateTeamFormData>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team.name,
      category: team.category || '',
      season: team.season,
      homeField: team.homeField || '',
      colors: team.colors || { primary: '#6366F1', secondary: '#EC4899' },
      logo: team.logo || '',
    },
  });

  const watchedColors = watch('colors');

  const onSubmit = async (data: UpdateTeamFormData) => {
    try {
      setIsLoading(true);
      const result = await updateTeamAction(team.id, data);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        toast.success(result.message);
        reset(data); // Reset form dirty state
      }
    } catch (error: any) {
      toast.error(error.message || 'Errore durante l\'aggiornamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpdate = (url: string) => {
    setValue('logo', url, { shouldDirty: true });
  };

  const handleTeamDeleted = () => {
    router.push('/teams');
  };

  return (
    <div className="space-y-8">
      {/* Logo Upload Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo squadra</h3>
        <LogoUpload
          teamId={team.id}
          currentLogo={team.logo}
          teamName={team.name}
          teamColors={team.colors}
          onLogoUpdate={handleLogoUpdate}
        />
      </div>

      {/* Team Details Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Informazioni squadra</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nome squadra"
              {...register('name')}
              error={errors.name?.message}
              placeholder="es. Juventus Academy"
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

            <Input
              label="Campo di casa"
              {...register('homeField')}
              error={errors.homeField?.message}
              placeholder="es. Stadio Comunale"
            />
          </div>
        </div>

        {/* Colors Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Colori squadra</h3>
          <ColorPicker
            colors={watchedColors || { primary: '#6366F1', secondary: '#EC4899' }}
            onChange={(colors) => setValue('colors', colors, { shouldDirty: true })}
          />
        </div>

        {/* Save Button */}
        {isDirty && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvataggio...
                </div>
              ) : (
                'Salva modifiche'
              )}
            </Button>
          </div>
        )}
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Zona pericolosa</h3>
        <p className="text-sm text-red-700 mb-4">
          Una volta eliminata, la squadra e tutti i dati associati non potranno essere recuperati.
        </p>
        <Button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Elimina squadra
        </Button>
      </div>

      {/* Delete Modal */}
      <DeleteTeamModal
        team={team}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={handleTeamDeleted}
      />
    </div>
  );
}