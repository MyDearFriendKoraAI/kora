"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Bot, Settings } from 'lucide-react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickPrompts } from './QuickPrompts';
import { RateLimitIndicator } from './RateLimitIndicator';
import { ThreadStatus } from './ThreadStatus';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { useActiveTeamOperations } from '@/hooks/queries/useActiveTeam';
import { TeamContext } from '@/lib/openai/assistant-client';
import { cn } from '@/lib/utils';

interface AIChatProps {
  teamId: string;
  className?: string;
}

// Usa i tipi dall'Assistant API
import { AssistantMessage, ChatState } from '@/hooks/useAssistantChat';

export default function AIChat({ teamId, className }: AIChatProps) {
  const { activeTeam, currentUser } = useActiveTeamOperations();
  
  // Costruisci contesto team per l'Assistant
  const teamContext: TeamContext = {
    teamName: activeTeam?.name || 'Squadra',
    sport: activeTeam?.sport || 'CALCIO',
    category: activeTeam?.category || 'Sconosciuta',
    activePlayersCount: activeTeam?.players?.length || 0,
    userRole: activeTeam?.coachId === currentUser?.id ? 'owner' : 'assistant',
    userName: currentUser ? `${currentUser.nome} ${currentUser.cognome}` : 'Allenatore',
  };

  const {
    messages,
    state,
    error,
    threadId,
    remainingRequests,
    sendMessage,
    resetThread,
    clearError,
    isTyping,
  } = useAssistantChat(teamId, teamContext);

  const [showSettings, setShowSettings] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom quando arrivano nuovi messaggi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleResetChat = () => {
    if (confirm('Sei sicuro di voler iniziare una nuova conversazione? Tutti i messaggi precedenti andranno persi.')) {
      resetThread();
    }
  };

  const isLoading = state === 'sending' || state === 'assistant-processing' || state === 'receiving';
  const isDisabled = isLoading || state === 'rate-limited' || (remainingRequests !== undefined && remainingRequests <= 0);

  return (
    <Card className={cn('flex flex-col h-full max-h-[600px]', className)}>
      {/* Header */}
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Kora AI Coach</CardTitle>
              {remainingRequests !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {remainingRequests} richieste rimanenti oggi
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickPrompts(!showQuickPrompts)}
              className="h-8 w-8 p-0"
              title="Suggerimenti rapidi"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8 p-0"
              title="Impostazioni"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 space-y-3">
            {/* Thread Status */}
            <ThreadStatus
              state={state}
              threadId={threadId}
              messageCount={messages.length}
              onResetThread={handleResetChat}
            />
            
            {/* Rate Limit Info */}
            {currentUser && (
              <RateLimitIndicator
                remainingRequests={remainingRequests}
                userTier={currentUser.tier || 'FREE'}
              />
            )}
            
            {/* Team Context Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Contesto Squadra</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Nome:</span>
                  <span>{teamContext.teamName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sport:</span>
                  <span>{teamContext.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span>Categoria:</span>
                  <span>{teamContext.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giocatori:</span>
                  <span>{teamContext.activePlayersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ruolo:</span>
                  <span>{teamContext.userRole === 'owner' ? 'Allenatore' : 'Assistente'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages Area - con min-height per evitare collasso */}
      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="h-6 text-xs"
              >
                Chiudi
              </Button>
            </div>
          </div>
        )}

        {/* Messages List - con overflow e flex-1 per occupare spazio disponibile */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MessageList 
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts - opzionale */}
        {showQuickPrompts && (
          <QuickPrompts
            onSelectPrompt={(prompt) => {
              handleSendMessage(prompt);
              setShowQuickPrompts(false);
            }}
            disabled={isDisabled}
          />
        )}
        
        {/* Input Area - sempre visibile in fondo */}
        <div className="border-t bg-background flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isDisabled}
            placeholder={
              remainingRequests === 0 
                ? "Limite giornaliero raggiunto" 
                : state === 'rate-limited'
                ? "Limite raggiunto, riprova domani"
                : isLoading
                ? "L'AI sta elaborando..."
                : "Chiedi consigli al tuo AI Coach..."
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Export dei componenti per uso modulare
export { MessageList } from './MessageList';
export { ChatInput } from './ChatInput';