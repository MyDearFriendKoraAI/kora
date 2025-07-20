'use client';

import { useState } from 'react';
import { TeamColors } from '@/lib/validations/team';

interface ColorPickerProps {
  colors: TeamColors;
  onChange: (colors: TeamColors) => void;
  className?: string;
}

// Preset colors for quick selection
const PRESET_COLORS = [
  '#FF6B35', '#004E89', '#FF8500', '#8B0000', '#FFD700', '#1E90FF',
  '#228B22', '#FFFFFF', '#8B4513', '#F5DEB3', '#6366F1', '#EC4899',
  '#DC2626', '#059669', '#7C3AED', '#EA580C', '#0891B2', '#BE185D',
];

export function ColorPicker({ colors, onChange, className = '' }: ColorPickerProps) {
  const [activeField, setActiveField] = useState<'primary' | 'secondary' | null>(null);

  const handleColorChange = (field: 'primary' | 'secondary', color: string) => {
    onChange({
      ...colors,
      [field]: color,
    });
  };

  const handlePresetClick = (color: string) => {
    if (activeField) {
      handleColorChange(activeField, color);
      setActiveField(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Color inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colore Primario
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveField(activeField === 'primary' ? null : 'primary')}
              className={`
                w-12 h-12 rounded-lg border-2 transition-all duration-200 flex-shrink-0
                ${activeField === 'primary' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: colors.primary }}
            />
            <input
              type="text"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#228B22"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colore Secondario
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveField(activeField === 'secondary' ? null : 'secondary')}
              className={`
                w-12 h-12 rounded-lg border-2 transition-all duration-200 flex-shrink-0
                ${activeField === 'secondary' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: colors.secondary }}
            />
            <input
              type="text"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Anteprima:</span>
          <div 
            className="w-16 h-8 rounded-md flex items-center justify-center text-white text-xs font-medium"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` 
            }}
          >
            Logo
          </div>
        </div>
        <div className="text-sm text-gray-600">
          I colori della squadra saranno utilizzati per logo, divise e elementi grafici
        </div>
      </div>

      {/* Preset colors */}
      {activeField && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Colori suggeriti per {activeField === 'primary' ? 'primario' : 'secondario'}:
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handlePresetClick(color)}
                className="w-10 h-10 sm:w-8 sm:h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setActiveField(null)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Chiudi palette
          </button>
        </div>
      )}
    </div>
  );
}

// Simplified color display component
interface ColorDisplayProps {
  colors: TeamColors;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ColorDisplay({ colors, size = 'md', className = '' }: ColorDisplayProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded border border-gray-200`}
        style={{ backgroundColor: colors.primary }}
        title={`Primario: ${colors.primary}`}
      />
      <div 
        className={`${sizeClasses[size]} rounded border border-gray-200`}
        style={{ backgroundColor: colors.secondary }}
        title={`Secondario: ${colors.secondary}`}
      />
    </div>
  );
}