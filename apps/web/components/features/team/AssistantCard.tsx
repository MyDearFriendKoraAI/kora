'use client';

import { useState } from 'react';
import { TeamAssistant } from '@/lib/supabase/team-assistant';

interface AssistantCardProps {
  assistant: TeamAssistant;
  onViewDetails: () => void;
  onRemove: () => void;
}

export function AssistantCard({ assistant, onViewDetails, onRemove }: AssistantCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Get user initials for avatar fallback
  const getInitials = (nome: string, cognome: string) => {
    return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase();
  };

  // Calculate time since joined
  const getTimeSinceJoined = (joinedAt: string) => {
    const joined = new Date(joinedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Oggi';
    if (diffDays <= 7) return `${diffDays} giorni fa`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} settimane fa`;
    return `${Math.ceil(diffDays / 30)} mesi fa`;
  };

  // Check if assistant is new (< 24h)
  const isNew = () => {
    const joined = new Date(assistant.joinedAt);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - joined.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Avatar */}
          <div className="relative">
            {assistant.user.avatarUrl ? (
              <img
                src={assistant.user.avatarUrl}
                alt={`${assistant.user.nome} ${assistant.user.cognome}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">
                  {getInitials(assistant.user.nome, assistant.user.cognome)}
                </span>
              </div>
            )}
            
            {/* New badge */}
            {isNew() && (
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                NEW
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {assistant.user.nome} {assistant.user.cognome}
              </h3>
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                Vice Allenatore
              </span>
            </div>
            
            <p className="text-sm text-gray-600 truncate mb-2">
              {assistant.user.email}
            </p>
            
            <div className="flex items-center text-xs text-gray-500 space-x-4">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Aggiunto {getTimeSinceJoined(assistant.joinedAt)}
              </span>
              
              {/* Mock last access - in futuro da database */}
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Ultimo accesso 2h fa
              </span>
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showActions && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowActions(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onViewDetails();
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Visualizza attività
                  </button>
                  
                  <button
                    onClick={() => {
                      onRemove();
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Rimuovi dal team
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">0</div>
            <div className="text-xs text-gray-500">Allenamenti creati</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">0</div>
            <div className="text-xs text-gray-500">Presenze registrate</div>
          </div>
        </div>
      </div>
    </div>
  );
}