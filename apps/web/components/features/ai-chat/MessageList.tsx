"use client";

import { forwardRef } from 'react';
import { Bot, User, Clock, AlertCircle } from 'lucide-react';
import { AssistantMessage } from '@/lib/openai/assistant-client';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: AssistantMessage[];
  isLoading?: boolean;
  isTyping?: boolean;
  className?: string;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isLoading, isTyping, className }, ref) => {
    if (messages.length === 0) {
      return (
        <div className={cn('flex items-center justify-center p-8', className)}>
          <div className="text-center max-w-md">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Ciao! Sono Kora AI Coach</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sono qui per aiutarti con la gestione della tua squadra. Posso consigliarti su:
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Piani di allenamento personalizzati</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Analisi tattiche e formazioni</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Motivazione e psicologia sportiva</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Prevenzione infortuni</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Scrivi la tua prima domanda per iniziare!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('', className)}>
        <div className="space-y-4 p-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Loading/Typing indicators */}
          {(isLoading || isTyping) && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted p-3 rounded-2xl rounded-bl-md max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isTyping ? 'Kora sta scrivendo...' : 'Kora sta pensando...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageList.displayName = 'MessageList';

interface MessageBubbleProps {
  message: AssistantMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.content.includes('Errore:') || message.content.includes('errore');

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full h-fit">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={cn('flex flex-col gap-1 max-w-[85%]', isUser && 'items-end')}>
        <div
          className={cn(
            'p-3 rounded-2xl',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : isError
              ? 'bg-destructive/10 border border-destructive/20 text-destructive rounded-bl-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          {isError && (
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Errore</span>
            </div>
          )}
          
          <MessageContent content={message.content} />
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3" />
          <span>{formatTime(message.timestamp)}</span>
          {message.role === 'assistant' && (
            <span className="text-xs text-blue-600 ml-2">AI Coach</span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="p-2 bg-primary rounded-full h-fit">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

interface MessageContentProps {
  content: string;
}

function MessageContent({ content }: MessageContentProps) {
  // Se il contenuto ha struttura markdown-like, formattalo
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith('##')) {
          return (
            <h3 key={index} className="font-semibold text-sm mt-3 mb-1">
              {line.replace('##', '').trim()}
            </h3>
          );
        }
        
        // Lists
        if (line.match(/^[\d]+\./)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="text-xs font-medium text-primary">
                {line.match(/^[\d]+/)?.[0]}.
              </span>
              <span className="text-sm flex-1">
                {line.replace(/^[\d]+\./, '').trim()}
              </span>
            </div>
          );
        }
        
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={index} className="flex gap-2">
              <span className="text-primary">•</span>
              <span className="text-sm flex-1">
                {line.replace(/^[-•]\s*/, '').trim()}
              </span>
            </div>
          );
        }
        
        // Bold text
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <p key={index} className="text-sm">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          );
        }
        
        // Regular text
        if (line.trim()) {
          return (
            <p key={index} className="text-sm leading-relaxed">
              {line}
            </p>
          );
        }
        
        // Empty line - space
        return <div key={index} className="h-2" />;
      })}
    </div>
  );
}

function formatTime(date: Date): string {
  // Verifica che la data sia valida
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '--:--';
  }
  
  try {
    return new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.warn('Errore formattazione data:', error);
    return '--:--';
  }
}