'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logoutAction } from '@/app/actions/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  className?: string;
  variant?: 'mobile' | 'sidebar';
}

export function UserMenu({ className = '', variant = 'mobile' }: UserMenuProps) {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAction();
      toast.success('Disconnesso con successo');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Errore durante la disconnessione');
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U';

  const avatarUrl = user.user_metadata?.avatar_url;

  // Visualizzazione espansa per sidebar desktop
  if (variant === 'sidebar') {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* User Info */}
        <div className="flex items-center space-x-3 p-2 border-b border-gray-100">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              userInitials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="space-y-1">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profilo
          </button>
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="flex items-center w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Impostazioni
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-2 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isLoggingOut ? 'Disconnessione...' : 'Disconnetti'}
          </button>
        </div>
      </div>
    );
  }

  // Visualizzazione dropdown per mobile
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            userInitials
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/profile');
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Profilo
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard/settings');
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Impostazioni
              </button>
            </div>
            
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Disconnessione...' : 'Disconnetti'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}