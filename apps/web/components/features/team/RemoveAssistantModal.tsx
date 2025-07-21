'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TeamAssistant } from '@/lib/supabase/team-assistant';
import { removeAssistantAction } from '@/app/actions/team-assistant';

interface RemoveAssistantModalProps {
  assistant: TeamAssistant;
  teamName?: string;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
}

export function RemoveAssistantModal({
  assistant,
  teamName,
  onClose,
  onConfirm,
}: RemoveAssistantModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    if (onConfirm) {
      // Use external confirm handler
      await onConfirm();
    } else {
      // Use internal logic
      setIsLoading(true);
      try {
        const result = await removeAssistantAction(assistant.id, assistant.teamId);

        if (result.success) {
          toast.success('Vice allenatore rimosso con successo');
          onClose();
          // Refresh the page to show updated list
          window.location.reload();
        } else {
          toast.error(result.error || 'Errore durante la rimozione del vice allenatore');
        }
      } catch (error) {
        toast.error('Errore durante la rimozione del vice allenatore');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Rimuovi Vice Allenatore
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

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conferma rimozione
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Sei sicuro di voler rimuovere <strong>{assistant.user.nome} {assistant.user.cognome}</strong> come vice allenatore di <strong>{teamName}</strong>?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Cosa succederà:</p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-700">
                      <li>Perderà l'accesso immediato alla squadra</li>
                      <li>Non potrà più vedere giocatori e allenamenti</li>
                      <li>Potrà essere invitato di nuovo in futuro</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Annulla
          </button>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Rimuovendo...</span>
              </div>
            ) : (
              'Rimuovi Vice Allenatore'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}