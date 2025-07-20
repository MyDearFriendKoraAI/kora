'use client';

import Link from 'next/link';

interface LimitBannerProps {
  variant: 'warning' | 'error';
  currentCount: number;
  maxCount: number;
  className?: string;
}

export function LimitBanner({ variant, currentCount, maxCount, className = '' }: LimitBannerProps) {
  const isAtLimit = currentCount >= maxCount;
  const remainingCount = maxCount - currentCount;

  const variantStyles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconStyles = {
    warning: 'text-amber-500',
    error: 'text-red-500'
  };

  const getMessage = () => {
    if (isAtLimit) {
      return 'Hai raggiunto il limite massimo di 2 squadre per account';
    }
    
    if (remainingCount === 1) {
      return 'Puoi creare ancora 1 squadra';
    }
    
    return `${currentCount} squadra di ${maxCount} create`;
  };

  const getIcon = () => {
    if (variant === 'error') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${iconStyles[variant]}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium">{getMessage()}</p>
          {isAtLimit && (
            <div className="mt-2">
              <p className="text-sm opacity-90 mb-3">
                Per creare nuove squadre devi eliminarne una esistente
              </p>
              <Link
                href="/teams"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors"
              >
                Gestisci squadre esistenti
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}