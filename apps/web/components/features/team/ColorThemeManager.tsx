'use client';

import { useState, useEffect } from 'react';
import { Team } from '@/lib/supabase/team';
import { TeamColors } from '@/lib/validations/team';
import { updateTeamColorsAction } from '@/app/actions/team-settings';
import { ColorPicker } from './ColorPicker';

interface ColorThemeManagerProps {
  team: Team;
  onUpdate: (data: Partial<Team>) => void;
}

// Preset popolari per sport
const SPORT_PRESETS = {
  CALCIO: [
    { name: 'Nerazzurro', primary: '#0047AB', secondary: '#000000' },
    { name: 'Rossonero', primary: '#AC0000', secondary: '#000000' },
    { name: 'Bianconero', primary: '#FFFFFF', secondary: '#000000' },
    { name: 'Giallorosso', primary: '#FFD700', secondary: '#DC143C' },
    { name: 'Azzurro', primary: '#0087BD', secondary: '#FFFFFF' },
  ],
  BASKET: [
    { name: 'Lakers', primary: '#552583', secondary: '#FDB927' },
    { name: 'Bulls', primary: '#CE1141', secondary: '#000000' },
    { name: 'Warriors', primary: '#1D428A', secondary: '#FFC72C' },
    { name: 'Celtics', primary: '#007A33', secondary: '#FFFFFF' },
  ],
  PALLAVOLO: [
    { name: 'Blu Royal', primary: '#4169E1', secondary: '#FFFFFF' },
    { name: 'Rosso Fuoco', primary: '#FF4500', secondary: '#FFFFFF' },
    { name: 'Verde Smeraldo', primary: '#50C878', secondary: '#FFFFFF' },
  ],
  DEFAULT: [
    { name: 'Blu Classico', primary: '#2563EB', secondary: '#FFFFFF' },
    { name: 'Rosso Energia', primary: '#DC2626', secondary: '#FFFFFF' },
    { name: 'Verde Natura', primary: '#16A34A', secondary: '#FFFFFF' },
    { name: 'Viola Elegante', primary: '#7C3AED', secondary: '#FFFFFF' },
  ]
};

export function ColorThemeManager({ team, onUpdate }: ColorThemeManagerProps) {
  const [colors, setColors] = useState<TeamColors>(
    team.colors || { primary: '#2563EB', secondary: '#FFFFFF' }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save con debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (JSON.stringify(colors) !== JSON.stringify(team.colors)) {
        setIsLoading(true);
        try {
          const result = await updateTeamColorsAction(team.id, colors);
          if (result.success) {
            onUpdate({ colors });
            setLastSaved(new Date());
          }
        } catch (error) {
          console.error('Error saving colors:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [colors, team.id, team.colors, onUpdate]);

  const presets = SPORT_PRESETS[team.sport as keyof typeof SPORT_PRESETS] || SPORT_PRESETS.DEFAULT;

  const handlePresetClick = (preset: { primary: string; secondary: string }) => {
    setColors(preset);
  };

  return (
    <div className="space-y-6">
      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Salvando...</span>
            </>
          ) : lastSaved ? (
            <>
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-600">
                Salvato alle {lastSaved.toLocaleTimeString()}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Anteprima Tema</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="h-24 flex items-center justify-center text-white font-bold text-lg"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` 
              }}
            >
              {team.name}
            </div>
            <div className="p-4">
              <h5 className="font-medium text-gray-900">Card Squadra</h5>
              <p className="text-sm text-gray-600">Preview del tema applicato</p>
              <div className="mt-3 flex space-x-2">
                <button 
                  className="px-3 py-1 text-xs rounded"
                  style={{ 
                    backgroundColor: colors.primary, 
                    color: colors.secondary 
                  }}
                >
                  Primario
                </button>
                <button 
                  className="px-3 py-1 text-xs rounded border"
                  style={{ 
                    borderColor: colors.primary, 
                    color: colors.primary 
                  }}
                >
                  Secondario
                </button>
              </div>
            </div>
          </div>

          {/* Logo Preview */}
          <div className="space-y-4">
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` 
                }}
              >
                {team.name.charAt(0)}
              </div>
              <p className="text-sm text-gray-600 mt-2">Logo Preview</p>
            </div>
            
            <div className="flex justify-center space-x-2">
              {['sm', 'md', 'lg'].map(size => (
                <div key={size} className="text-center">
                  <div 
                    className={`
                      rounded ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'}
                      flex items-center justify-center text-white font-bold
                      ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}
                    `}
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` 
                    }}
                  >
                    {team.name.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">{size.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker */}
      <ColorPicker
        colors={colors}
        onChange={setColors}
      />

      {/* Sport Presets */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Preset Popolari per {team.sport}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(preset)}
              className="group p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: preset.primary }}
                />
                <div 
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: preset.secondary }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}