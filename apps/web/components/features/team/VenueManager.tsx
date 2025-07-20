'use client';

import { useState } from 'react';
import { Team } from '@/lib/supabase/team';

interface Venue {
  id: string;
  name: string;
  address: string;
  type: 'primary' | 'secondary';
  coordinates?: { lat: number; lng: number };
}

interface VenueManagerProps {
  team: Team;
  onUpdate: (data: Partial<Team>) => void;
}

export function VenueManager({ team, onUpdate }: VenueManagerProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const [editingVenue, setEditingVenue] = useState<string | null>(null);

  const [newVenue, setNewVenue] = useState<{
    name: string;
    address: string;
    type: 'primary' | 'secondary';
  }>({
    name: '',
    address: '',
    type: 'secondary'
  });

  const handleAddVenue = () => {
    if (!newVenue.name.trim() || !newVenue.address.trim()) return;

    const venue: Venue = {
      id: Date.now().toString(),
      name: newVenue.name,
      address: newVenue.address,
      type: newVenue.type
    };

    setVenues(prev => [...prev, venue]);
    setNewVenue({ name: '', address: '', type: 'secondary' });
    setIsAddingVenue(false);
  };

  const handleDeleteVenue = (venueId: string) => {
    setVenues(prev => prev.filter(v => v.id !== venueId));
  };

  const handleSetPrimary = (venueId: string) => {
    setVenues(prev => prev.map(v => ({
      ...v,
      type: v.id === venueId ? 'primary' : 'secondary'
    })));
    
    const primaryVenue = venues.find(v => v.id === venueId);
    if (primaryVenue) {
      onUpdate({ homeField: primaryVenue.name });
    }
  };

  return (
    <div className="space-y-6">
      {/* Venues List */}
      {venues.length > 0 ? (
        <div className="space-y-4">
          {venues.map((venue) => (
          <div key={venue.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-medium text-gray-900">{venue.name}</h4>
                  {venue.type === 'primary' && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Principale
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{venue.address}</p>
                
                <div className="flex items-center space-x-4 mt-3">
                  <button
                    onClick={() => handleSetPrimary(venue.id)}
                    disabled={venue.type === 'primary'}
                    className={`text-sm font-medium ${
                      venue.type === 'primary'
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {venue.type === 'primary' ? 'Campo principale' : 'Imposta come principale'}
                  </button>
                  
                  <button className="text-sm font-medium text-gray-600 hover:text-gray-700">
                    Modifica
                  </button>
                  
                  {venue.type !== 'primary' && (
                    <button
                      onClick={() => handleDeleteVenue(venue.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Elimina
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-shrink-0 ml-4">
                <div className="w-24 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun campo configurato</h3>
          <p className="text-gray-600 mb-4">Aggiungi il primo campo o palestra per la tua squadra</p>
        </div>
      )}

      {/* Add New Venue */}
      {isAddingVenue ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Aggiungi Nuovo Campo</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Campo/Palestra
              </label>
              <input
                type="text"
                value={newVenue.name}
                onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="es. Centro Sportivo Comunale"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indirizzo
              </label>
              <input
                type="text"
                value={newVenue.address}
                onChange={(e) => setNewVenue(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Via dello Sport, 123, Milano"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={newVenue.type}
                onChange={(e) => setNewVenue(prev => ({ ...prev, type: e.target.value as 'primary' | 'secondary' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="secondary">Secondario</option>
                <option value="primary">Principale</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleAddVenue}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Aggiungi Campo
            </button>
            <button
              onClick={() => {
                setIsAddingVenue(false);
                setNewVenue({ name: '', address: '', type: 'secondary' });
              }}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingVenue(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Aggiungi Campo/Palestra</span>
          </div>
        </button>
      )}

      {/* Map Integration Placeholder */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Mappa Interattiva</h4>
        <p className="text-gray-600 mb-4">
          Visualizza tutti i campi su una mappa interattiva
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          Apri Mappa
        </button>
      </div>
    </div>
  );
}