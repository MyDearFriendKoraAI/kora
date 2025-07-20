import { SportIcon } from './SportIcon';
import { ColorDisplay } from './ColorPicker';
import { SPORT_LABELS, SportTypeEnum } from '@/lib/validations/team';
import { Team } from '@/lib/supabase/team';

interface TeamHeaderProps {
  team: Team;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  // Generate initials for fallback logo
  const initials = team.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Logo/Avatar */}
          <div className="relative mx-auto sm:mx-0">
            {team.logo ? (
              <img
                src={team.logo}
                alt={`Logo ${team.name}`}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl border-4 border-white shadow-lg"
                style={{
                  background: team.colors?.primary 
                    ? `linear-gradient(135deg, ${team.colors.primary}, ${team.colors.secondary || team.colors.primary})`
                    : 'linear-gradient(135deg, #6366F1, #EC4899)'
                }}
              >
                {initials}
              </div>
            )}
            
            {/* Sport badge */}
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 sm:p-2 border border-gray-200 shadow-sm">
              <SportIcon sport={team.sport as SportTypeEnum} size="sm" className="text-gray-600" />
            </div>
          </div>

          {/* Team info */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-0">{team.name}</h1>
              <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mx-auto sm:mx-0 w-fit">
                {SPORT_LABELS[team.sport as SportTypeEnum]}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0 text-sm text-gray-600">
              {team.category && (
                <div className="flex items-center justify-center sm:justify-start">
                  <span className="font-medium">Categoria:</span>
                  <span className="ml-1">{team.category}</span>
                </div>
              )}
              
              <div className="flex items-center justify-center sm:justify-start">
                <span className="font-medium">Stagione:</span>
                <span className="ml-1">{team.season}</span>
              </div>
              
              {team.homeField && (
                <div className="flex items-center justify-center sm:justify-start">
                  <span className="font-medium">Campo:</span>
                  <span className="ml-1">{team.homeField}</span>
                </div>
              )}
            </div>

            {/* Colors */}
            {team.colors && (
              <div className="flex items-center justify-center sm:justify-start space-x-2 mt-3">
                <span className="text-sm text-gray-600 font-medium">Colori:</span>
                <ColorDisplay colors={team.colors} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}