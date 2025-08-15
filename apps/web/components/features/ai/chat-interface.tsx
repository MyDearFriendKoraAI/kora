"use client";

import { useActiveTeamOperations } from '@/hooks/queries/useActiveTeam';
import AIChat from '../ai-chat/AIChat';

export default function ChatInterface() {
  const { activeTeam, isLoading } = useActiveTeamOperations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">Caricamento...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!activeTeam) {
    return (
      <div className="flex items-center justify-center h-[600px] text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">Seleziona una squadra</p>
          <p className="text-sm">Per usare l'AI Coach, seleziona prima una squadra dal menu.</p>
        </div>
      </div>
    );
  }

  return <AIChat teamId={activeTeam.id} className="h-[600px]" />;
}