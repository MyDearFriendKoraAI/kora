'use client';

import { useState, useEffect } from 'react';
import { Team } from '@/lib/supabase/team';
import { ColorThemeManager } from './ColorThemeManager';
import { LogoManager } from './LogoManager';
import { VenueManager } from './VenueManager';
import { SeasonSettings } from './SeasonSettings';
import { TeamPreferences } from './TeamPreferences';
import { SettingsSection } from './SettingsSection';

interface TeamSettingsContentProps {
  team: Team;
}

type ActiveTab = 'customization' | 'structure' | 'preferences';

export function TeamSettingsContent({ team }: TeamSettingsContentProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('customization');
  const [teamData, setTeamData] = useState(team);

  const tabs = [
    {
      id: 'customization' as ActiveTab,
      name: 'Personalizzazione',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      )
    },
    {
      id: 'structure' as ActiveTab,
      name: 'Struttura Sportiva',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'preferences' as ActiveTab,
      name: 'Preferenze',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const handleTeamUpdate = (updatedData: Partial<Team>) => {
    setTeamData(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: teamData.colors?.primary 
                ? `linear-gradient(135deg, ${teamData.colors.primary}, ${teamData.colors.secondary || teamData.colors.primary})`
                : 'linear-gradient(135deg, #6366F1, #EC4899)'
            }}
          >
            {teamData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Impostazioni Squadra</h1>
            <p className="text-gray-600">{teamData.name} - Personalizza la tua squadra</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'customization' && (
            <div className="space-y-8">
              <SettingsSection
                title="Tema Colori"
                description="Personalizza i colori della tua squadra"
              >
                <ColorThemeManager team={teamData} onUpdate={handleTeamUpdate} />
              </SettingsSection>

              <SettingsSection
                title="Logo Squadra"
                description="Gestisci il logo e l'immagine della squadra"
              >
                <LogoManager team={teamData} onUpdate={handleTeamUpdate} />
              </SettingsSection>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-8">
              <SettingsSection
                title="Campi e Palestre"
                description="Gestisci le strutture sportive della squadra"
              >
                <VenueManager team={teamData} onUpdate={handleTeamUpdate} />
              </SettingsSection>

              <SettingsSection
                title="Configurazione Stagione"
                description="Imposta date e calendario della stagione sportiva"
              >
                <SeasonSettings team={teamData} onUpdate={handleTeamUpdate} />
              </SettingsSection>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <SettingsSection
                title="Preferenze Generali"
                description="Configura notifiche e impostazioni personalizzate"
              >
                <TeamPreferences team={teamData} onUpdate={handleTeamUpdate} />
              </SettingsSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}