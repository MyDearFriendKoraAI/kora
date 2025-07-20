'use client';

import { useState } from 'react';
import { Team } from '@/lib/supabase/team';
import { TeamOverview } from './TeamOverview';
import { ColorThemeManager } from './ColorThemeManager';
import { LogoManager } from './LogoManager';
import { VenueManager } from './VenueManager';
import { SeasonSettings } from './SeasonSettings';
import { TeamPreferences } from './TeamPreferences';
import { SettingsSection } from './SettingsSection';

interface TeamTabsProps {
  team: Team;
  stats: {
    playersCount: number;
    trainingsCount: number;
    upcomingTrainings: number;
    lastTraining?: string;
    nextTraining?: string;
  };
}

type TabId = 'overview' | 'customization' | 'structure' | 'season' | 'preferences';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    name: 'Panoramica',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'customization',
    name: 'Personalizzazione',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
      </svg>
    ),
  },
  {
    id: 'structure',
    name: 'Struttura',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'season',
    name: 'Stagione',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'preferences',
    name: 'Preferenze',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function TeamTabs({ team, stats }: TeamTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [teamData, setTeamData] = useState(team);

  const handleTeamUpdate = (updatedData: Partial<Team>) => {
    setTeamData(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Tab headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2 sm:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'overview' && (
          <TeamOverview team={teamData} stats={stats} />
        )}
        
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
          </div>
        )}

        {activeTab === 'season' && (
          <div className="space-y-8">
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
  );
}