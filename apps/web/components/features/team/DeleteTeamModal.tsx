'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Team } from '@/lib/supabase/team';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  deleteTeamSchema, 
  DeleteTeamFormData 
} from '@/lib/validations/team';
import { deleteTeamAction } from '@/app/actions/team';

interface DeleteTeamModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteTeamModal({ team, isOpen, onClose, onDeleted }: DeleteTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<DeleteTeamFormData>({
    resolver: zodResolver(deleteTeamSchema),
  });

  const confirmName = watch('confirmName');
  const canDelete = confirmName === team.name;

  const onSubmit = async (data: DeleteTeamFormData) => {
    try {
      setIsLoading(true);
      const result = await deleteTeamAction(team.id, data);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        toast.success(result.message);
        onDeleted();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Errore durante l\'eliminazione');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Elimina squadra
              </h3>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  <p className="mb-2">
                    Stai per eliminare definitivamente la squadra{' '}
                    <span className="font-semibold text-gray-900">{team.name}</span>.
                  </p>
                  <p className="mb-4">
                    Questa azione eliminerà:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Tutti i giocatori della squadra</li>
                    <li>Cronologia degli allenamenti</li>
                    <li>Statistiche e risultati</li>
                    <li>Logo e personalizzazioni</li>
                  </ul>
                  <p className="mt-4 font-medium text-red-600">
                    Questa azione non può essere annullata.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per confermare, digita il nome della squadra:
                    </label>
                    <Input
                      {...register('confirmName')}
                      error={errors.confirmName?.message}
                      placeholder={team.name}
                      autoComplete="off"
                      className="font-mono"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Annulla
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canDelete || isLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Eliminazione...
                        </div>
                      ) : (
                        'Elimina squadra'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}