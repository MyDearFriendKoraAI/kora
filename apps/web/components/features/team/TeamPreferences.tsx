'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Team } from '@/lib/supabase/team';
import { DeleteTeamModal } from './DeleteTeamModal';
import { useTeamStore } from '@/stores/team-store';
import { getUserTeamsAction } from '@/app/actions/team';

interface Preferences {
  notifications: {
    email: boolean;
    training: boolean;
    matches: boolean;
    general: boolean;
  };
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  language: 'it' | 'en' | 'es' | 'fr';
  privacy: {
    publicTeam: boolean;
    allowSearching: boolean;
    showStatistics: boolean;
  };
}

interface TeamPreferencesProps {
  team: Team;
  onUpdate: (data: Partial<Team>) => void;
}

export function TeamPreferences({ team, onUpdate }: TeamPreferencesProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>({
    notifications: {
      email: false,
      training: false,
      matches: false,
      general: false
    },
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    language: 'it',
    privacy: {
      publicTeam: false,
      allowSearching: false,
      showStatistics: false
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleNotificationChange = (key: keyof Preferences['notifications']) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePrivacyChange = (key: keyof Preferences['privacy']) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Preferences saved:', preferences);
    } finally {
      setIsSaving(false);
    }
  };

  const { setUserTeams } = useTeamStore();

  const handleTeamDeleted = async () => {
    setShowDeleteModal(false);
    
    // Refresh teams in store to remove deleted team immediately
    try {
      const result = await getUserTeamsAction();
      if (result.success && result.teams) {
        setUserTeams(result.teams);
      }
    } catch (error) {
      console.error('Error refreshing teams:', error);
    }
    
    router.push('/teams');
  };

  return (
    <div className="space-y-8">
      {/* Notifications */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Notifiche Email</h4>
        <div className="space-y-4">
          {[
            { key: 'email' as const, label: 'Ricevi notifiche via email', description: 'Attiva tutte le notifiche email' },
            { key: 'training' as const, label: 'Allenamenti', description: 'Notifiche per nuovi allenamenti e modifiche' },
            { key: 'matches' as const, label: 'Partite', description: 'Notifiche per partite e risultati' },
            { key: 'general' as const, label: 'Aggiornamenti generali', description: 'Newsletter e aggiornamenti della piattaforma' }
          ].map((item) => (
            <div key={item.key} className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={preferences.notifications[item.key]}
                  onChange={() => handleNotificationChange(item.key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  {item.label}
                </label>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date & Time Format */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Formato Data e Ora</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato Data
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                dateFormat: e.target.value as Preferences['dateFormat'] 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato Ora
            </label>
            <select
              value={preferences.timeFormat}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                timeFormat: e.target.value as Preferences['timeFormat'] 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="24h">24 ore (18:30)</option>
              <option value="12h">12 ore (6:30 PM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Lingua</h4>
        <div className="md:w-1/2">
          <select
            value={preferences.language}
            onChange={(e) => setPreferences(prev => ({ 
              ...prev, 
              language: e.target.value as Preferences['language'] 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            La lingua per comunicazioni e interfaccia
          </p>
        </div>
      </div>

      {/* Privacy */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Privacy e Visibilità</h4>
        <div className="space-y-4">
          {[
            { 
              key: 'publicTeam' as const, 
              label: 'Squadra pubblica', 
              description: 'La squadra è visibile nelle ricerche pubbliche' 
            },
            { 
              key: 'allowSearching' as const, 
              label: 'Permetti ricerca', 
              description: 'Altri utenti possono trovare questa squadra' 
            },
            { 
              key: 'showStatistics' as const, 
              label: 'Mostra statistiche', 
              description: 'Le statistiche sono visibili ai membri della squadra' 
            }
          ].map((item) => (
            <div key={item.key} className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={preferences.privacy[item.key]}
                  onChange={() => handlePrivacyChange(item.key)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">
                  {item.label}
                </label>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h5 className="text-sm font-medium text-blue-900">Informazioni sulla Privacy</h5>
            <p className="text-sm text-blue-700 mt-1">
              I tuoi dati sono protetti e utilizzati solo per migliorare l'esperienza della squadra. 
              Puoi modificare queste impostazioni in qualsiasi momento.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-8 border-t border-gray-200">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-red-900 mb-2">Zona di Pericolo</h4>
          <p className="text-sm text-red-700 mb-4">
            Queste azioni non possono essere annullate. Procedi con cautela.
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h5 className="font-medium text-red-900">Elimina squadra</h5>
              <p className="text-sm text-red-600">
                Elimina definitivamente questa squadra e tutti i dati associati
              </p>
            </div>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Elimina Squadra
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={savePreferences}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Salvando...</span>
            </div>
          ) : (
            'Salva Preferenze'
          )}
        </button>
      </div>

      {/* Delete Team Modal */}
      {showDeleteModal && (
        <DeleteTeamModal
          team={team}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={handleTeamDeleted}
        />
      )}
    </div>
  );
}