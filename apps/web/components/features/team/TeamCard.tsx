import Link from 'next/link';
import { SportIcon } from './SportIcon';
import { SPORT_LABELS, SportTypeEnum, TeamColors } from '@/lib/validations/team';

interface TeamCardProps {
  id: string;
  name: string;
  sport: SportTypeEnum;
  category?: string;
  logo?: string;
  colors?: TeamColors;
  playerCount: number;
  className?: string;
}

export function TeamCard({
  id,
  name,
  sport,
  category,
  logo,
  colors,
  playerCount,
  className = '',
}: TeamCardProps) {
  // Iniziali del nome squadra per fallback logo
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/teams/${id}`}>
      <div className={`
        bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md 
        transition-all duration-200 hover:scale-[1.02] cursor-pointer
        p-6 ${className}
      `}>
        {/* Header con logo/iniziali */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            {logo ? (
              <img
                src={logo}
                alt={`Logo ${name}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-gray-100"
                style={{
                  background: colors?.primary 
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`
                    : 'linear-gradient(135deg, #6366F1, #EC4899)'
                }}
              >
                {initials}
              </div>
            )}
            
            {/* Badge sport */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-200">
              <SportIcon sport={sport} size="sm" className="text-gray-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
            <p className="text-sm text-gray-500">{SPORT_LABELS[sport]}</p>
          </div>
        </div>

        {/* Informazioni squadra */}
        <div className="space-y-2">
          {category && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Categoria</span>
              <span className="text-sm font-medium text-gray-900">{category}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Giocatori</span>
            <span className="text-sm font-medium text-gray-900">{playerCount}</span>
          </div>
        </div>

        {/* Footer con badge */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className={`
              inline-flex px-2 py-1 text-xs font-medium rounded-full
              ${playerCount > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {playerCount > 0 ? 'Attiva' : 'Da configurare'}
            </span>
            
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loading per TeamCard
export function TeamCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}