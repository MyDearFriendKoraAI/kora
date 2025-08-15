"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Bot, Settings } from 'lucide-react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useAIChat } from '@/hooks/useAIChat';
import { cn } from '@/lib/utils';

interface AIChatProps {
  teamId: string;
  className?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  metadata?: {
    requestType?: string;
    promptTokens?: number;
    optimization?: {
      tokensUsed: number;
      tokensOverhead: number;
      efficiency: string;
    };
  };
}

export default function AIChat({ teamId, className }: AIChatProps) {
  const {
    messages,
    isLoading,
    error,
    remainingRequests,
    sendMessage,
    clearError,
    conversationId,
  } = useAIChat(teamId);

  const [promptType, setPromptType] = useState<'trainingPlan' | 'tacticalAnalysis' | 'motivationalCoaching' | 'injuryPrevention'>('trainingPlan');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom quando arrivano nuovi messaggi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message, promptType);
  };

  const promptTypeLabels = {
    trainingPlan: 'Piano Allenamento',
    tacticalAnalysis: 'Analisi Tattica',
    motivationalCoaching: 'Coaching Motivazionale',
    injuryPrevention: 'Prevenzione Infortuni',
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <CardHeader className="pb-3 border-b">
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
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Tipo di Consulenza:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(promptTypeLabels).map(([type, label]) => (
                <Button
                  key={type}
                  variant={promptType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPromptType(type as typeof promptType)}
                  className="text-xs h-8"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
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

        {/* Messages List */}
        <div className="flex-1 overflow-hidden">
          <MessageList 
            messages={messages}
            isLoading={isLoading}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-background">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading || (remainingRequests !== undefined && remainingRequests <= 0)}
            placeholder={
              remainingRequests === 0 
                ? "Limite giornaliero raggiunto" 
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