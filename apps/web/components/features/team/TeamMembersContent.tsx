'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { Team } from '@/lib/supabase/team';
import { TeamAssistant, TeamInvite, getAssistantLimitByTier } from '@/lib/supabase/team-assistant';
import { InviteAssistantModal } from './InviteAssistantModal';
import { RemoveAssistantModal } from './RemoveAssistantModal';

interface TeamMembersContentProps {
  team: Team;
  assistants: TeamAssistant[];
  invites: TeamInvite[];
  userRole: 'owner' | 'assistant';
  currentUser: User;
}

export function TeamMembersContent({
  team,
  assistants,
  invites,
  userRole,
  currentUser,
}: TeamMembersContentProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [assistantToRemove, setAssistantToRemove] = useState<TeamAssistant | null>(null);

  // Get user tier from metadata or default to FREE
  const userTier = (currentUser.user_metadata?.tier || 'FREE') as 'FREE' | 'LEVEL1' | 'PREMIUM';
  const assistantLimit = getAssistantLimitByTier(userTier);
  const isAtLimit = assistants.length >= assistantLimit;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membri Team</h1>
          <p className="text-gray-600">
            Gestisci i vice allenatori per {team.name}
          </p>
        </div>
        
        <Link
          href={`/teams/${team.id}`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Torna alla squadra
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mister Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mister</h2>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    {currentUser.user_metadata?.nome || currentUser.email} {currentUser.user_metadata?.cognome || ''}
                  </p>
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Mister
                  </span>
                </div>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vice Allenatori Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Vice Allenatori ({assistants.length}/{assistantLimit === 999 ? '∞' : assistantLimit})
            </h2>
            {userRole === 'owner' && !isAtLimit && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Invita Vice
              </button>
            )}
          </div>

          {/* Assistant Limit Banner */}
          {userRole === 'owner' && isAtLimit && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Limite vice allenatori raggiunto
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Piano {userTier}: massimo {assistantLimit} vice allenator{assistantLimit === 1 ? 'e' : 'i'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assistants List */}
          {assistants.length > 0 ? (
            <div className="space-y-3">
              {assistants.map((assistant) => (
                <div key={assistant.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        {assistant.user.avatarUrl ? (
                          <img
                            src={assistant.user.avatarUrl}
                            alt={`${assistant.user.nome} ${assistant.user.cognome}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {assistant.user.nome} {assistant.user.cognome}
                          </p>
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Vice
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{assistant.user.email}</p>
                        <p className="text-xs text-gray-500">
                          Aggiunto il {formatDate(assistant.joinedAt)}
                        </p>
                      </div>
                    </div>
                    
                    {userRole === 'owner' && (
                      <button
                        onClick={() => setAssistantToRemove(assistant)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Rimuovi vice allenatore"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun vice allenatore ancora</h3>
              <p className="text-gray-600 mb-4">
                Invita altri allenatori per aiutarti a gestire la squadra
              </p>
              {userRole === 'owner' && !isAtLimit && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Invita primo vice allenatore
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Inviti in Attesa ({invites.length})
          </h2>
          
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-sm text-gray-600">
                      Invitato il {formatDate(invite.createdAt)} • Scade il {formatDate(invite.expiresAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      In Attesa
                    </span>
                    {userRole === 'owner' && (
                      <button className="text-gray-600 hover:text-gray-700 p-1" title="Annulla invito">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteAssistantModal
          team={team}
          currentAssistants={assistants.length}
          assistantLimit={assistantLimit}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {assistantToRemove && (
        <RemoveAssistantModal
          assistant={assistantToRemove}
          teamName={team.name}
          onClose={() => setAssistantToRemove(null)}
        />
      )}
    </div>
  );
}