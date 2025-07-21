'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TeamInvite } from '@/lib/supabase/team-assistant';
import { resendTeamInviteAction, cancelTeamInviteAction } from '@/app/actions/team-assistant';

interface InviteListItemProps {
  invite: TeamInvite;
  onUpdate: () => void;
}

export function InviteListItem({ invite, onUpdate }: InviteListItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if invite is expired
  const isExpired = new Date(invite.expiresAt) < new Date();
  
  // Calculate time until expiry
  const getTimeUntilExpiry = () => {
    const expiry = new Date(invite.expiresAt);
    const now = new Date();
    
    if (isExpired) {
      return 'Scaduto';
    }
    
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return diffHours <= 1 ? 'Scade tra meno di 1h' : `Scade tra ${diffHours}h`;
    }
    
    return `Scade tra ${diffDays} giorni`;
  };

  // Copy invite link to clipboard
  const handleCopyLink = async () => {
    const inviteUrl = `${window.location.origin}/invites/accept?token=${invite.token}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Link copiato negli appunti');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copiato negli appunti');
    }
    
    setShowActions(false);
  };

  // Resend invite
  const handleResend = async () => {
    setIsLoading(true);
    setShowActions(false);
    
    try {
      const result = await resendTeamInviteAction(invite.id);
      if (result.success) {
        toast.success('Invito inviato nuovamente');
        onUpdate();
      } else {
        toast.error(result.error || 'Errore durante l\'invio');
      }
    } catch (error) {
      toast.error('Errore durante l\'invio dell\'invito');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel invite
  const handleCancel = async () => {
    setIsLoading(true);
    setShowActions(false);
    
    try {
      const result = await cancelTeamInviteAction(invite.id);
      if (result.success) {
        toast.success('Invito annullato');
        onUpdate();
      } else {
        toast.error(result.error || 'Errore durante l\'annullamento');
      }
    } catch (error) {
      toast.error('Errore durante l\'annullamento dell\'invito');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4 flex-1">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        </div>

        {/* Invite Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {invite.email}
            </p>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
              isExpired 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isExpired ? 'Scaduto' : 'In attesa'}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Inviato {new Date(invite.createdAt).toLocaleDateString('it-IT')}
            </span>
            
            <span className={`flex items-center ${isExpired ? 'text-red-500' : ''}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {getTimeUntilExpiry()}
            </span>
          </div>
          
          {/* Message preview */}
          {invite.message && (
            <p className="text-xs text-gray-600 mt-1 truncate">
              "{invite.message}"
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Loading spinner */}
        {isLoading && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        )}
        
        {/* Quick actions */}
        <div className="flex items-center space-x-1">
          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
            title="Copia link invito"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showActions && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowActions(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={handleResend}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reinvia
                    </button>
                    
                    <button
                      onClick={handleCancel}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annulla
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}