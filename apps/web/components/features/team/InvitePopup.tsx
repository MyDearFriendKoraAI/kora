'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Clock, User, Calendar } from 'lucide-react';
import { ButtonModern } from '@/components/ui/ButtonModern';
import { SportIcon } from '@/components/features/team/SportIcon';
import { usePendingInvites, useHandleInvite } from '@/hooks/queries/useTeamInvites';
import { SportTypeEnum, SPORT_LABELS } from '@/lib/validations/team';
import { cn } from '@kora/shared/utils';

interface InvitePopupProps {
  showOnMount?: boolean;
  onClose?: () => void;
}

export function InvitePopup({ showOnMount = true, onClose }: InvitePopupProps) {
  const { data: invites = [], isLoading } = usePendingInvites();
  const handleInvite = useHandleInvite();
  const [isVisible, setIsVisible] = useState(false);
  const [currentInviteIndex, setCurrentInviteIndex] = useState(0);

  // Mostra popup se ci sono inviti e showOnMount è true
  useEffect(() => {
    if (showOnMount && invites.length > 0 && !isLoading) {
      setIsVisible(true);
    }
  }, [invites.length, isLoading, showOnMount]);

  // Chiudi popup quando non ci sono più inviti
  useEffect(() => {
    if (invites.length === 0 && isVisible) {
      setIsVisible(false);
      onClose?.();
    }
  }, [invites.length, isVisible, onClose]);

  const closePopup = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleNextInvite = () => {
    if (currentInviteIndex < invites.length - 1) {
      setCurrentInviteIndex(prev => prev + 1);
    } else {
      closePopup();
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    handleInvite.mutate(
      { inviteId, action: 'accept' },
      {
        onSuccess: () => {
          handleNextInvite();
        }
      }
    );
  };

  const handleRejectInvite = async (inviteId: string) => {
    handleInvite.mutate(
      { inviteId, action: 'reject' },
      {
        onSuccess: () => {
          handleNextInvite();
        }
      }
    );
  };

  // Calcola giorni rimanenti
  const calculateDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const days = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 'Scaduto';
    if (days === 1) return '1 giorno rimanente';
    return `${days} giorni rimanenti`;
  };

  if (isLoading || !isVisible || invites.length === 0) {
    return null;
  }

  const currentInvite = invites[currentInviteIndex];

  if (!currentInvite) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header con chiusura */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Invito Ricevuto
            </h3>
          </div>
          <button
            onClick={closePopup}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo del popup */}
        <div className="p-6 space-y-6">
          {/* Info squadra */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <SportIcon 
                sport={currentInvite.team.sport as SportTypeEnum} 
                size="lg" 
                className="w-8 h-8 text-white" 
              />
            </div>
            
            <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {currentInvite.team.name}
            </h4>
            
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <SportIcon sport={currentInvite.team.sport as SportTypeEnum} size="sm" className="w-4 h-4" />
              <span>{SPORT_LABELS[currentInvite.team.sport as SportTypeEnum]}</span>
              {currentInvite.team.category && (
                <>
                  <span>•</span>
                  <span>{currentInvite.team.category}</span>
                </>
              )}
            </div>
          </div>

          {/* Dettagli invito */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Invitato da
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {currentInvite.inviter.nome} {currentInvite.inviter.cognome}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <Shield className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Ruolo proposto
                </p>
                <p className="text-sm text-purple-600 font-medium">
                  Vice Allenatore
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Scadenza
                </p>
                <p className="text-sm text-amber-600 font-medium">
                  {calculateDaysRemaining(currentInvite.expiresAt)}
                </p>
              </div>
            </div>

            {/* Messaggio personalizzato */}
            {currentInvite.message && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                  Messaggio dell'allenatore:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 italic">
                  "{currentInvite.message}"
                </p>
              </div>
            )}
          </div>

          {/* Contatore inviti */}
          {invites.length > 1 && (
            <div className="text-center">
              <p className="text-xs text-neutral-500">
                Invito {currentInviteIndex + 1} di {invites.length}
              </p>
            </div>
          )}
        </div>

        {/* Footer con azioni */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
          <ButtonModern
            variant="outline"
            className="flex-1"
            onClick={() => handleRejectInvite(currentInvite.id)}
            disabled={handleInvite.isPending}
          >
            Rifiuta
          </ButtonModern>
          <ButtonModern
            variant="primary"
            className="flex-1"
            onClick={() => handleAcceptInvite(currentInvite.id)}
            disabled={handleInvite.isPending}
            loading={handleInvite.isPending}
          >
            Accetta Invito
          </ButtonModern>
        </div>
      </div>
    </div>
  );
}