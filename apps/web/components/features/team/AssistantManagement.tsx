'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Team } from '@/lib/supabase/team';
import { TeamAssistant, TeamInvite } from '@/lib/supabase/team-assistant';
import { getTeamAssistantsAction, getTeamInvitesAction, removeAssistantAction } from '@/app/actions/team-assistant';
import { AssistantCard } from './AssistantCard';
import { InviteListItem } from './InviteListItem';
import { AssistantLimitBanner } from './AssistantLimitBanner';
import { InviteAssistantModal } from './InviteAssistantModal';
import { AssistantDetailsModal } from './AssistantDetailsModal';
import { RemoveAssistantModal } from './RemoveAssistantModal';
import { Button } from '@/components/ui/Button';

interface AssistantManagementProps {
  team: Team;
}

// Simula tier utente - in futuro da context/store
const getUserTier = () => 'FREE' as const; // FREE | LEVEL1 | PREMIUM

const getAssistantLimit = (tier: string) => {
  switch (tier) {
    case 'FREE': return 1;
    case 'LEVEL1': return 2;
    case 'PREMIUM': return 999;
    default: return 1;
  }
};

export function AssistantManagement({ team }: AssistantManagementProps) {
  const [assistants, setAssistants] = useState<TeamAssistant[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<TeamAssistant | null>(null);

  const userTier = getUserTier();
  const limit = getAssistantLimit(userTier);
  const used = assistants.length;
  const canInvite = used < limit;

  // Auto-refresh invites every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadInvites();
    }, 30000);

    return () => clearInterval(interval);
  }, [team.id]);

  const loadAssistants = async () => {
    try {
      const result = await getTeamAssistantsAction(team.id);
      if (result.success && result.assistants) {
        setAssistants(result.assistants);
      }
    } catch (error) {
      console.error('Error loading assistants:', error);
    }
  };

  const loadInvites = async () => {
    try {
      const result = await getTeamInvitesAction(team.id);
      if (result.success && result.invites) {
        setInvites(result.invites);
      }
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadAssistants(), loadInvites()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [team.id]);

  const handleInviteSuccess = (email: string) => {
    toast.success(`Invito inviato a ${email}`);
    loadInvites(); // Refresh invites
    setShowInviteModal(false);
  };

  const handleRemoveAssistant = async (assistantId: string) => {
    try {
      const result = await removeAssistantAction(assistantId, team.id);
      if (result.success) {
        toast.success('Vice allenatore rimosso con successo');
        loadAssistants(); // Refresh assistants
        setShowRemoveModal(false);
        setSelectedAssistant(null);
      } else {
        toast.error(result.error || 'Errore durante la rimozione');
      }
    } catch (error) {
      toast.error('Errore durante la rimozione del vice allenatore');
    }
  };

  const handleViewDetails = (assistant: TeamAssistant) => {
    setSelectedAssistant(assistant);
    setShowDetailsModal(true);
  };

  const handleRemoveClick = (assistant: TeamAssistant) => {
    setSelectedAssistant(assistant);
    setShowRemoveModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-6 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vice Allenatori</h2>
          <p className="text-gray-600">
            {used} di {limit === 999 ? '∞' : limit} vice allenator{limit === 1 ? 'e' : 'i'} utilizzat{used === 1 ? 'o' : 'i'}
          </p>
        </div>
        
        <Button
          onClick={() => setShowInviteModal(true)}
          disabled={!canInvite}
          className={canInvite ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invita Vice Allenatore
        </Button>
      </div>

      {/* Limit Banner */}
      {!canInvite && (
        <AssistantLimitBanner 
          used={used}
          limit={limit}
          tier={userTier}
        />
      )}

      {/* Vice Allenatori Attivi */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Vice Allenatori Attivi
          {assistants.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({assistants.length})
            </span>
          )}
        </h3>
        
        {assistants.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assistants.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                assistant={assistant}
                onViewDetails={() => handleViewDetails(assistant)}
                onRemove={() => handleRemoveClick(assistant)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nessun vice allenatore
            </h4>
            <p className="text-gray-600 mb-6">
              Invita il tuo primo vice allenatore per iniziare a collaborare nella gestione della squadra.
            </p>
            {canInvite && (
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Invita Vice Allenatore
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Inviti Pendenti */}
      {invites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Inviti Pendenti
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({invites.length})
            </span>
          </h3>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {invites.map((invite) => (
              <InviteListItem
                key={invite.id}
                invite={invite}
                onUpdate={loadInvites}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteAssistantModal
          team={team}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      {showDetailsModal && selectedAssistant && (
        <AssistantDetailsModal
          assistant={selectedAssistant}
          team={team}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAssistant(null);
          }}
          onRemove={() => {
            setShowDetailsModal(false);
            setShowRemoveModal(true);
          }}
        />
      )}

      {showRemoveModal && selectedAssistant && (
        <RemoveAssistantModal
          assistant={selectedAssistant}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedAssistant(null);
          }}
          onConfirm={() => handleRemoveAssistant(selectedAssistant.id)}
        />
      )}
    </div>
  );
}