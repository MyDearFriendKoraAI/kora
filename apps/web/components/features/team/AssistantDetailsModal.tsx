'use client';

import { useState } from 'react';
import { TeamAssistant } from '@/lib/supabase/team-assistant';
import { Team } from '@/lib/supabase/team';

interface AssistantDetailsModalProps {
  assistant: TeamAssistant;
  team: Team;
  onClose: () => void;
  onRemove: () => void;
}

export function AssistantDetailsModal({ assistant, team, onClose, onRemove }: AssistantDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'permissions' | 'activity'>('stats');

  // Mock data - in futuro da database
  const mockStats = {
    trainingsCreated: 0,
    attendanceRecords: 0,
    lastLogin: '2 ore fa',
    totalLogins: 15,
    joinedDaysAgo: Math.ceil((new Date().getTime() - new Date(assistant.joinedAt).getTime()) / (1000 * 60 * 60 * 24))
  };

  const mockPermissions = {
    viewPlayers: true,
    editPlayers: false,
    viewTrainings: true,
    editTrainings: false,
    viewStats: true,
    manageAttendance: true,
    inviteAssistants: false,
    removeAssistants: false,
    editTeamSettings: false
  };

  const mockActivityLog = [
    { id: 1, action: 'Ha registrato le presenze per l\'allenamento del 15/01', time: '2 ore fa' },
    { id: 2, action: 'Ha visualizzato la lista giocatori', time: '5 ore fa' },
    { id: 3, action: 'Ha effettuato l\'accesso', time: '1 giorno fa' },
    { id: 4, action: 'Ha visualizzato le statistiche del team', time: '2 giorni fa' },
    { id: 5, action: 'Ha registrato le presenze per l\'allenamento del 12/01', time: '3 giorni fa' }
  ];

  const getInitials = (nome: string, cognome: string) => {
    return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              {assistant.user.avatarUrl ? (
                <img
                  src={assistant.user.avatarUrl}
                  alt={`${assistant.user.nome} ${assistant.user.cognome}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-lg">
                    {getInitials(assistant.user.nome, assistant.user.cognome)}
                  </span>
                </div>
              )}
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {assistant.user.nome} {assistant.user.cognome}
                </h2>
                <p className="text-gray-600">{assistant.user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    Vice Allenatore
                  </span>
                  <span className="text-sm text-gray-500">
                    Nel team da {mockStats.joinedDaysAgo} giorni
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'stats', name: 'Statistiche', icon: '📊' },
                { id: 'permissions', name: 'Permessi', icon: '🔐' },
                { id: 'activity', name: 'Attività', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockStats.trainingsCreated}</div>
                    <div className="text-sm text-blue-800">Allenamenti creati</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{mockStats.attendanceRecords}</div>
                    <div className="text-sm text-green-800">Presenze registrate</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{mockStats.totalLogins}</div>
                    <div className="text-sm text-purple-800">Accessi totali</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-sm font-medium text-orange-600">Ultimo accesso</div>
                    <div className="text-sm text-orange-800">{mockStats.lastLogin}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Informazioni</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aggiunto al team:</span>
                      <span className="font-medium">{new Date(assistant.joinedAt).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ruolo:</span>
                      <span className="font-medium">Vice Allenatore</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Team:</span>
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Gestione Permessi</h4>
                  <p className="text-blue-800 text-sm">
                    La gestione granulare dei permessi sarà disponibile in un prossimo aggiornamento. 
                    Attualmente tutti i vice allenatori hanno permessi di visualizzazione e gestione presenze.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Permessi Attuali</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(mockPermissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm font-medium text-gray-900">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                        <span className={`text-xs font-medium ${value ? 'text-green-600' : 'text-gray-500'}`}>
                          {value ? 'Attivo' : 'Non attivo'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Ultime 10 attività</h4>
                
                <div className="space-y-3">
                  {mockActivityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Membro dal {new Date(assistant.joinedAt).toLocaleDateString('it-IT')}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Chiudi
              </button>
              <button
                onClick={onRemove}
                className="px-4 py-2 text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Rimuovi dal team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}