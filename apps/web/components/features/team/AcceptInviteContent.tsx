'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { toast } from 'sonner';
import { TeamInvite } from '@/lib/supabase/team-assistant';
import { acceptInviteAction } from '@/app/actions/team-assistant';

interface AcceptInviteContentProps {
  invite: TeamInvite;
  currentUser: User | null;
}

export function AcceptInviteContent({ invite, currentUser }: AcceptInviteContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAcceptInvite = async () => {
    if (!currentUser) {
      // Redirect to login with return URL
      const returnUrl = `/invites/accept?token=${invite.token}`;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Check if email matches
    if (currentUser.email !== invite.email) {
      toast.error('Devi accedere con l\'email invitata: ' + invite.email);
      return;
    }

    setIsLoading(true);
    try {
      const result = await acceptInviteAction(invite.token);

      if (result.success) {
        toast.success('Invito accettato con successo!');
        router.push(`/teams/${result.teamId}`);
      } else {
        toast.error(result.error || 'Errore durante l\'accettazione dell\'invito');
      }
    } catch (error) {
      toast.error('Errore durante l\'accettazione dell\'invito');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    const returnUrl = `/invites/accept?token=${invite.token}`;
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const handleRegisterRedirect = () => {
    const returnUrl = `/invites/accept?token=${invite.token}`;
    router.push(`/register?returnUrl=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(invite.email)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 text-center">
          <h1 className="text-2xl font-bold text-white">Kora</h1>
          <p className="text-blue-100 text-sm">Gestione Squadre Sportive</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Invitation Icon */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invito a Vice Allenatore
            </h2>
            <p className="text-gray-600">
              {invite.inviter.nome} {invite.inviter.cognome} ti ha invitato a diventare vice allenatore
            </p>
          </div>

          {/* Team Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              {invite.team.logo ? (
                <img
                  src={invite.team.logo}
                  alt={`Logo ${invite.team.name}`}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 font-bold text-lg">
                    {invite.team.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">{invite.team.name}</h3>
                <p className="text-sm text-blue-700">
                  {invite.team.sport} {invite.team.category && `• ${invite.team.category}`}
                </p>
                <p className="text-sm text-blue-700">
                  Stagione: {invite.team.season}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Message */}
          {invite.message && (
            <div className="border-l-4 border-gray-300 pl-4">
              <p className="text-sm text-gray-600 italic">
                "{invite.message}"
              </p>
            </div>
          )}

          {/* Permissions Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Come vice allenatore potrai:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Visualizzare i giocatori della squadra</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Vedere gli allenamenti programmati</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Accedere alle statistiche del team</span>
              </li>
            </ul>
          </div>

          {/* Invited Email */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <strong>Email invitata:</strong> {invite.email}
            </p>
          </div>

          {/* Actions */}
          {!currentUser ? (
            /* Not logged in */
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Devi accedere o registrarti per accettare l'invito
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accedi con il tuo account
                </button>
                <button
                  onClick={handleRegisterRedirect}
                  className="w-full px-4 py-3 bg-white text-blue-600 font-medium border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Crea nuovo account
                </button>
              </div>
            </div>
          ) : currentUser.email !== invite.email ? (
            /* Wrong email */
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Sei collegato come <strong>{currentUser.email}</strong>, ma l'invito è per <strong>{invite.email}</strong>.
                </p>
              </div>
              <div className="space-y-2">
                <Link
                  href="/logout"
                  className="block w-full px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors text-center"
                >
                  Disconnetti e accedi con {invite.email}
                </Link>
              </div>
            </div>
          ) : (
            /* Correct user - can accept */
            <div className="space-y-3">
              <button
                onClick={handleAcceptInvite}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Accettando...</span>
                  </div>
                ) : (
                  'Accetta Invito'
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Accettando l'invito diventerai vice allenatore di {invite.team.name}
              </p>
            </div>
          )}

          {/* Expiry Warning */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Questo invito scade il{' '}
              {new Date(invite.expiresAt).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}