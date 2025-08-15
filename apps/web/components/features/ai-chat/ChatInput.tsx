"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const QUICK_SUGGESTIONS = [
  "Crea un piano di allenamento per questa settimana",
  "Analizza la formazione ideale per la squadra",
  "Consigli per migliorare il morale del team",
  "Suggerimenti per prevenire infortuni",
];

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Scrivi la tua domanda...",
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea (con limite)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSendMessage(message.trim());
    setMessage('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as any;
      handleSubmit(formEvent);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Il riconoscimento vocale non è supportato nel tuo browser');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'it-IT';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(prev => prev + transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className={cn('relative', className)}>
      {/* Quick Suggestions */}
      {showSuggestions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Suggerimenti rapidi</span>
            </div>
          </div>
          <div className="p-2">
            {QUICK_SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 text-sm rounded hover:bg-muted transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          {/* Suggestions button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="h-10 w-10 p-0 flex-shrink-0"
            disabled={disabled}
          >
            <Lightbulb className={cn(
              "h-4 w-4",
              showSuggestions ? "text-yellow-500" : "text-muted-foreground"
            )} />
          </Button>

          {/* Text input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-[80px] resize-none pr-12"
              rows={1}
            />
            
            {/* Character count */}
            {message.length > 0 && (
              <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-background px-1 rounded">
                {message.length}/1000
              </div>
            )}
          </div>

          {/* Voice input button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={cn(
              "h-10 w-10 p-0 flex-shrink-0",
              isRecording && "bg-red-100 text-red-600 dark:bg-red-900/20"
            )}
            disabled={disabled}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* Send button */}
          <Button
            type="submit"
            disabled={disabled || !message.trim() || message.length > 1000}
            className="h-10 w-10 p-0 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Help text */}
        <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>Premi Cmd/Ctrl + Invio per inviare rapidamente</span>
          {disabled && (
            <span className="text-destructive">
              {placeholder.includes('Limite') ? 'Limite raggiunto' : 'Invio in corso...'}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// Aggiungi tipi per speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}