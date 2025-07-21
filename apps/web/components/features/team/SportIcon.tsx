import { SportTypeEnum } from '@/lib/validations/team';

interface SportIconProps {
  sport: SportTypeEnum;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function SportIcon({ sport, className = '', size = 'md' }: SportIconProps) {
  const sizeClass = sizeClasses[size];
  
  const icons = {
    CALCIO: (
      <svg className={`${sizeClass} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    ),
    BASKET: (
      <svg className={`${sizeClass} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm2-13h-4v2h4V7zm-4 4v2h4v-2H10zm0 4v2h4v-2H10z"/>
      </svg>
    ),
    PALLAVOLO: (
      <svg className={`${sizeClass} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-9c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
      </svg>
    ),
    TENNIS: (
      <svg className={`${sizeClass} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v-2h-2v2zm0-4h2V9h-2v2zm0-4h2V5h-2v2z"/>
      </svg>
    ),
    RUGBY: (
      <svg className={`${sizeClass} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-13h4v2h-4V7zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z"/>
      </svg>
    ),
    ALTRO: (
      <svg className={`${sizeClass} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  };

  return icons[sport] || icons.ALTRO;
}

// Funzione helper per ottenere il label dello sport
export function getSportLabel(sport: SportTypeEnum): string {
  const labels = {
    CALCIO: 'Calcio',
    BASKET: 'Basket', 
    PALLAVOLO: 'Pallavolo',
    TENNIS: 'Tennis',
    RUGBY: 'Rugby',
    ALTRO: 'Altro',
  };
  
  return labels[sport] || 'Sport';
}

// Componente per selezione sport con icone grandi
interface SportSelectorProps {
  selectedSport?: SportTypeEnum;
  onSelect: (sport: SportTypeEnum) => void;
  className?: string;
}

export function SportSelector({ selectedSport, onSelect, className = '' }: SportSelectorProps) {
  const sports: { key: SportTypeEnum; label: string; color: string }[] = [
    { key: 'CALCIO', label: 'Calcio', color: 'text-green-600' },
    { key: 'BASKET', label: 'Basket', color: 'text-orange-600' },
    { key: 'PALLAVOLO', label: 'Pallavolo', color: 'text-blue-600' },
    { key: 'TENNIS', label: 'Tennis', color: 'text-emerald-600' },
    { key: 'RUGBY', label: 'Rugby', color: 'text-amber-600' },
    { key: 'ALTRO', label: 'Altro', color: 'text-purple-600' },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {sports.map((sport) => (
        <button
          key={sport.key}
          type="button"
          onClick={() => onSelect(sport.key)}
          className={`
            flex flex-col items-center p-6 rounded-lg border-2 transition-all duration-200
            ${selectedSport === sport.key
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <SportIcon 
            sport={sport.key} 
            size="xl" 
            className={selectedSport === sport.key ? 'text-blue-600' : sport.color} 
          />
          <span className="mt-3 text-sm font-medium">{sport.label}</span>
        </button>
      ))}
    </div>
  );
}