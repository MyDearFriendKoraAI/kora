'use client';

interface AssistantLimitBannerProps {
  used: number;
  limit: number;
  tier: 'FREE' | 'LEVEL1' | 'PREMIUM';
}

export function AssistantLimitBanner({ used, limit, tier }: AssistantLimitBannerProps) {
  const progressPercentage = Math.min(100, (used / limit) * 100);
  
  const tierInfo = {
    FREE: {
      name: 'Gratuito',
      nextTier: 'Level 1',
      nextLimit: 2,
      price: '€7.99/mese'
    },
    LEVEL1: {
      name: 'Level 1',
      nextTier: 'Premium',
      nextLimit: 999,
      price: '€19.99/mese'
    },
    PREMIUM: {
      name: 'Premium',
      nextTier: null,
      nextLimit: null,
      price: null
    }
  };

  const currentTier = tierInfo[tier];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-amber-900">
              Limite raggiunto per il tuo piano {currentTier.name}
            </h3>
            <span className="text-sm font-medium text-amber-700">
              {used}/{limit === 999 ? '∞' : limit}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Message */}
          <p className="text-amber-800 mb-4">
            Hai utilizzato tutti i {limit} vice allenatori disponibili per il piano {currentTier.name}.
            {currentTier.nextTier && (
              <> Per invitare più vice allenatori, passa al piano {currentTier.nextTier}.</>
            )}
          </p>

          {/* Upgrade CTA */}
          {currentTier.nextTier && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white border border-amber-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">
                  Piano {currentTier.nextTier}
                </h4>
                <p className="text-sm text-gray-600">
                  {currentTier.nextLimit === 999 
                    ? 'Vice allenatori illimitati' 
                    : `Fino a ${currentTier.nextLimit} vice allenatori`
                  } + funzionalità avanzate
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-900">
                  {currentTier.price}
                </span>
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Passa a {currentTier.nextTier}
                </button>
              </div>
            </div>
          )}

          {/* Alternative actions */}
          <div className="mt-4 text-sm text-amber-700">
            <p>
              Puoi anche{' '}
              <button className="underline hover:text-amber-800 transition-colors">
                rimuovere un vice allenatore esistente
              </button>
              {' '}per fare spazio a un nuovo membro del team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}