'use client';

import { useState } from 'react';
import { Team } from '@/lib/supabase/team';

interface SeasonConfig {
  startDate: string;
  endDate: string;
  trainingDays: string[];
  trainingTime: string;
  breaks: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }>;
}

interface SeasonSettingsProps {
  team: Team;
  onUpdate: (data: Partial<Team>) => void;
}

const WEEKDAYS = [
  { value: 'monday', label: 'Lunedì' },
  { value: 'tuesday', label: 'Martedì' },
  { value: 'wednesday', label: 'Mercoledì' },
  { value: 'thursday', label: 'Giovedì' },
  { value: 'friday', label: 'Venerdì' },
  { value: 'saturday', label: 'Sabato' },
  { value: 'sunday', label: 'Domenica' },
];

export function SeasonSettings({ team, onUpdate }: SeasonSettingsProps) {
  const [config, setConfig] = useState<SeasonConfig>({
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    trainingDays: ['tuesday', 'thursday'],
    trainingTime: '18:00',
    breaks: [
      {
        id: '1',
        name: 'Vacanze Natalizie',
        startDate: '2024-12-23',
        endDate: '2025-01-07'
      },
      {
        id: '2',
        name: 'Vacanze Pasquali',
        startDate: '2025-04-17',
        endDate: '2025-04-22'
      }
    ]
  });

  const [isAddingBreak, setIsAddingBreak] = useState(false);
  const [newBreak, setNewBreak] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const handleTrainingDayToggle = (day: string) => {
    setConfig(prev => ({
      ...prev,
      trainingDays: prev.trainingDays.includes(day)
        ? prev.trainingDays.filter(d => d !== day)
        : [...prev.trainingDays, day]
    }));
  };

  const handleAddBreak = () => {
    if (!newBreak.name.trim() || !newBreak.startDate || !newBreak.endDate) return;

    const breakPeriod = {
      id: Date.now().toString(),
      name: newBreak.name,
      startDate: newBreak.startDate,
      endDate: newBreak.endDate
    };

    setConfig(prev => ({
      ...prev,
      breaks: [...prev.breaks, breakPeriod]
    }));

    setNewBreak({ name: '', startDate: '', endDate: '' });
    setIsAddingBreak(false);
  };

  const handleDeleteBreak = (breakId: string) => {
    setConfig(prev => ({
      ...prev,
      breaks: prev.breaks.filter(b => b.id !== breakId)
    }));
  };

  const generateCalendarPreview = () => {
    // This would generate a preview of the training calendar
    // For now, we'll show a simple preview
    const totalWeeks = Math.ceil(
      (new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / 
      (7 * 24 * 60 * 60 * 1000)
    );
    const totalTrainings = totalWeeks * config.trainingDays.length;

    return {
      totalWeeks,
      totalTrainings,
      trainingDays: config.trainingDays.length
    };
  };

  const preview = generateCalendarPreview();

  return (
    <div className="space-y-6">
      {/* Season Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inizio Stagione
          </label>
          <input
            type="date"
            value={config.startDate}
            onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fine Stagione
          </label>
          <input
            type="date"
            value={config.endDate}
            onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Training Schedule */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Programma Allenamenti</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giorni della Settimana
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {WEEKDAYS.map((day) => (
                <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.trainingDays.includes(day.value)}
                    onChange={() => handleTrainingDayToggle(day.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orario Standard
            </label>
            <input
              type="time"
              value={config.trainingTime}
              onChange={(e) => setConfig(prev => ({ ...prev, trainingTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Season Breaks */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Periodi di Pausa</h4>
        
        <div className="space-y-3">
          {config.breaks.map((breakPeriod) => (
            <div key={breakPeriod.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">{breakPeriod.name}</h5>
                <p className="text-sm text-gray-600">
                  {new Date(breakPeriod.startDate).toLocaleDateString('it-IT')} - {' '}
                  {new Date(breakPeriod.endDate).toLocaleDateString('it-IT')}
                </p>
              </div>
              <button
                onClick={() => handleDeleteBreak(breakPeriod.id)}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add Break Form */}
        {isAddingBreak ? (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-3">Aggiungi Periodo di Pausa</h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Periodo
                </label>
                <input
                  type="text"
                  value={newBreak.name}
                  onChange={(e) => setNewBreak(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="es. Vacanze Estive"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Inizio
                  </label>
                  <input
                    type="date"
                    value={newBreak.startDate}
                    onChange={(e) => setNewBreak(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fine
                  </label>
                  <input
                    type="date"
                    value={newBreak.endDate}
                    onChange={(e) => setNewBreak(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleAddBreak}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Aggiungi
              </button>
              <button
                onClick={() => {
                  setIsAddingBreak(false);
                  setNewBreak({ name: '', startDate: '', endDate: '' });
                }}
                className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingBreak(true)}
            className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Aggiungi Periodo</span>
          </button>
        )}
      </div>

      {/* Calendar Preview */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Anteprima Calendario</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{preview.totalWeeks}</div>
            <div className="text-sm text-gray-600">Settimane Totali</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{preview.totalTrainings}</div>
            <div className="text-sm text-gray-600">Allenamenti Programmati</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{preview.trainingDays}</div>
            <div className="text-sm text-gray-600">Giorni a Settimana</div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>
            <strong>Programma:</strong> {config.trainingDays.map(day => 
              WEEKDAYS.find(w => w.value === day)?.label
            ).join(', ')} alle {config.trainingTime}
          </p>
          <p className="mt-1">
            <strong>Periodi di pausa:</strong> {config.breaks.length} configurati
          </p>
        </div>
        
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          Genera Calendario Completo
        </button>
      </div>
    </div>
  );
}