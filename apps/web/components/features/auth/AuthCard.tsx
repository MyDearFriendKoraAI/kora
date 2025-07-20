'use client';

import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Kora</h1>
          <p className="mt-2 text-sm text-gray-600">Gestione squadre sportive con AI</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          {children}

          {footer && (
            <div className="pt-4 border-t border-gray-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}