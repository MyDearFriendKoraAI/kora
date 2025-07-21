'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTeamStore } from '@/stores/team-store';
import { SportIcon, getSportLabel } from './SportIcon';
import type { Team } from '@/lib/supabase/team';

interface TeamSwitcherProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export function TeamSwitcher({ variant = 'desktop', className = '' }: TeamSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { currentTeam, teams, setCurrentTeam } = useTeamStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setCurrentTeam(team);
    setIsOpen(false);
    
    // Redirect to team's dashboard/overview
    router.push(`/teams/${team.id}`);
  };

  // Get team initials for logo fallback
  const getTeamInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Don't show switcher if no teams
  if (teams.length === 0) {
    return null;
  }

  // Single team - show name without dropdown
  if (teams.length === 1) {
    const team = teams[0];
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Team Logo */}
        <div className="relative">
          {team.logo ? (
            <img
              src={team.logo}
              alt={`${team.name} logo`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{
                backgroundColor: team.colors?.primary || '#3B82F6',
              }}
            >
              {getTeamInitials(team.name)}
            </div>
          )}
        </div>
        
        {/* Team Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {team.name}
          </p>
          <p className="text-xs text-gray-500">
            {getSportLabel(team.sport)}
          </p>
        </div>
      </div>
    );
  }

  // Multiple teams - show dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current Team Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg
          hover:bg-gray-50 transition-colors
          ${variant === 'mobile' ? 'px-4 py-3' : ''}
        `}
      >
        {/* Current Team Logo */}
        <div className="relative">
          {currentTeam?.logo ? (
            <img
              src={currentTeam.logo}
              alt={`${currentTeam.name} logo`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{
                backgroundColor: currentTeam?.colors?.primary || '#3B82F6',
              }}
            >
              {currentTeam ? getTeamInitials(currentTeam.name) : 'T'}
            </div>
          )}
        </div>
        
        {/* Current Team Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentTeam?.name || 'Seleziona squadra'}
          </p>
          <p className="text-xs text-gray-500">
            {currentTeam ? getSportLabel(currentTeam.sport) : 'Nessuna squadra'}
          </p>
        </div>
        
        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200
            ${variant === 'mobile' ? 'w-72' : 'min-w-64'}
          `}
        >
          <div className="py-1">
            {/* Team Options */}
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 text-left
                  hover:bg-gray-50 transition-colors
                  ${currentTeam?.id === team.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''}
                `}
              >
                {/* Team Logo */}
                <div className="relative">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{
                        backgroundColor: team.colors?.primary || '#3B82F6',
                      }}
                    >
                      {getTeamInitials(team.name)}
                    </div>
                  )}
                </div>
                
                {/* Team Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {team.name}
                    </p>
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Mister
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <SportIcon sport={team.sport} size="sm" />
                    <span className="text-xs text-gray-500">
                      {getSportLabel(team.sport)}
                    </span>
                    {team.category && (
                      <>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{team.category}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Current Team Indicator */}
                {currentTeam?.id === team.id && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
            
            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>
            
            {/* Create New Team */}
            {teams.length < 2 ? (
              <Link
                href="/teams/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-blue-600"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Crea nuova squadra</p>
                  <p className="text-xs text-gray-500">
                    {2 - teams.length} squadra disponibile
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center space-x-3 px-4 py-3 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Limite raggiunto</p>
                  <p className="text-xs text-gray-500">
                    Massimo 2 squadre per account
                  </p>
                </div>
              </div>
            )}
            
            {/* Manage Teams */}
            <Link
              href="/teams"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Gestisci squadre</p>
                <p className="text-xs text-gray-500">
                  Visualizza tutte le squadre
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}