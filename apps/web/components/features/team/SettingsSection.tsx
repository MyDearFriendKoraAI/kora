'use client';

import { ReactNode, useState } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function SettingsSection({
  title,
  description,
  children,
  className = '',
  collapsible = false,
  defaultExpanded = true
}: SettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <div 
        className={`p-4 bg-gray-50 ${collapsible ? 'cursor-pointer hover:bg-gray-100' : ''}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {collapsible && (
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className="p-6 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}