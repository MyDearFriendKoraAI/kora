'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Team } from '@/lib/supabase/team';
import { sendAssistantInviteAction } from '@/app/actions/team-assistant';

const inviteSchema = z.object({
  email: z
    .string()
    .email('Inserisci un indirizzo email valido')
    .min(1, 'Email obbligatoria'),
  message: z
    .string()
    .max(500, 'Il messaggio non può superare i 500 caratteri')
    .optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteAssistantModalProps {
  team: Team;
  currentAssistants?: number;
  assistantLimit?: number;
  onClose: () => void;
  onSuccess?: (email: string) => void;
}

export function InviteAssistantModal({
  team,
  currentAssistants = 0,
  assistantLimit = 1,
  onClose,
  onSuccess,
}: InviteAssistantModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const watchedEmail = watch('email');
  const watchedMessage = watch('message');

  const onSubmit = async (data: InviteFormData) => {
    if (currentAssistants >= assistantLimit) {
      toast.error('Hai raggiunto il limite di vice allenatori per il tuo piano');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendAssistantInviteAction({
        email: data.email,
        teamId: team.id,
        message: data.message,
      });

      if (result.success) {
        toast.success('Invito inviato con successo!');
        if (onSuccess) {
          onSuccess(data.email);
        } else {
          onClose();
          // Refresh the page to show new invite
          window.location.reload();
        }
      } else {
        toast.error(result.error || 'Errore durante l\'invio dell\'invito');
      }
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'invito');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Invita Vice Allenatore
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!previewMode ? (
          /* Form Mode */
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Team Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Squadra: {team.name}</h3>
              <p className="text-sm text-blue-700">
                Stai per invitare un nuovo vice allenatore per questa squadra.
                Avrà accesso alla visualizzazione di giocatori e allenamenti.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Vice allenatori: {currentAssistants}/{assistantLimit === 999 ? '∞' : assistantLimit}
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email destinatario *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="mario.rossi@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Messaggio personalizzato (opzionale)
              </label>
              <textarea
                {...register('message')}
                id="message"
                rows={4}
                placeholder="Ciao! Ti invito come vice allenatore della nostra squadra..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {watchedMessage?.length || 0}/500 caratteri
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                disabled={!watchedEmail}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              >
                Anteprima Email
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !watchedEmail}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Inviando...</span>
                    </div>
                  ) : (
                    'Invia Invito'
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Preview Mode */
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Anteprima Email</h3>
              
              {/* Email Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="text-center border-b border-gray-100 pb-4">
                  <h1 className="text-2xl font-bold text-blue-600">Kora</h1>
                  <p className="text-sm text-gray-600">Gestione Squadre Sportive</p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Sei stato invitato come Vice Allenatore!
                  </h2>

                  <p className="text-gray-700">
                    Ciao! Sei stato invitato a diventare vice allenatore della squadra:
                  </p>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900">{team.name}</h3>
                    <p className="text-sm text-blue-700">
                      Sport: {team.sport} {team.category && `• Categoria: ${team.category}`}
                    </p>
                    <p className="text-sm text-blue-700">
                      Stagione: {team.season}
                    </p>
                  </div>

                  {watchedMessage && (
                    <div className="border-l-4 border-gray-300 pl-4">
                      <p className="text-sm text-gray-600 italic">
                        "{watchedMessage}"
                      </p>
                    </div>
                  )}

                  <p className="text-gray-700">
                    Come vice allenatore potrai:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Visualizzare i giocatori della squadra</li>
                    <li>Vedere gli allenamenti programmati</li>
                    <li>Accedere alle statistiche del team</li>
                  </ul>

                  <div className="text-center pt-4">
                    <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg">
                      Accetta Invito
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Questo invito scade tra 7 giorni. Se non hai un account, potrai crearne uno durante l'accettazione.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setPreviewMode(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Modifica
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {isLoading ? 'Inviando...' : 'Invia Invito'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}