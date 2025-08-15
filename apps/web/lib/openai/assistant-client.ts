import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

export interface TeamContext {
  teamName: string;
  sport: string;
  category: string;
  activePlayersCount: number;
  userRole: 'owner' | 'assistant';
  userName: string;
}

export interface ThreadInfo {
  id: string;
  threadId: string;
  messageCount: number;
  lastUsed: Date;
}

export enum AssistantError {
  THREAD_NOT_FOUND = 'Thread non trovato, creane uno nuovo',
  ASSISTANT_UNAVAILABLE = 'Kora è temporaneamente non disponibile',
  RATE_LIMITED = 'Hai raggiunto il limite giornaliero',
  CONTEXT_TOO_LONG = 'Conversazione troppo lunga, iniziane una nuova',
  TIMEOUT = 'Risposta troppo lenta, riprova',
  ASSISTANT_NOT_CONFIGURED = 'Assistant non configurato correttamente'
}

export type RunStatus = 'queued' | 'in_progress' | 'requires_action' | 'cancelling' | 'cancelled' | 'failed' | 'completed' | 'expired';

export interface AssistantMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  threadId: string;
}

class KoraAssistantClient {
  private openai: OpenAI;
  private assistantId: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY non configurata');
    }
    
    if (!process.env.OPENAI_ASSISTANT_ID) {
      throw new Error('OPENAI_ASSISTANT_ID non configurata');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.assistantId = process.env.OPENAI_ASSISTANT_ID;
  }

  /**
   * Crea un nuovo thread OpenAI per l'utente e team
   */
  async createThread(userId: string, teamId: string): Promise<ThreadInfo> {
    try {
      // Elimina thread esistente se presente
      await this.deleteExistingThread(userId, teamId);

      // Crea nuovo thread su OpenAI
      const thread = await this.openai.beta.threads.create();

      // Salva nel database
      const chatThread = await prisma.chatThread.create({
        data: {
          userId,
          teamId,
          threadId: thread.id,
          messageCount: 0,
        },
      });

      return {
        id: chatThread.id,
        threadId: thread.id,
        messageCount: 0,
        lastUsed: chatThread.lastUsed,
      };
    } catch (error) {
      console.error('Errore creazione thread:', error);
      throw new Error(AssistantError.ASSISTANT_UNAVAILABLE);
    }
  }

  /**
   * Recupera thread esistente per utente e team
   */
  async getThread(userId: string, teamId: string): Promise<ThreadInfo | null> {
    try {
      const chatThread = await prisma.chatThread.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId,
          },
        },
      });

      if (!chatThread) {
        return null;
      }

      // Verifica che il thread esista ancora su OpenAI
      try {
        await this.openai.beta.threads.retrieve(chatThread.threadId);
      } catch (error) {
        // Thread non esiste più su OpenAI, eliminalo dal DB
        await prisma.chatThread.delete({
          where: { id: chatThread.id },
        });
        return null;
      }

      return {
        id: chatThread.id,
        threadId: chatThread.threadId,
        messageCount: chatThread.messageCount,
        lastUsed: chatThread.lastUsed,
      };
    } catch (error) {
      console.error('Errore recupero thread:', error);
      return null;
    }
  }

  /**
   * Recupera o crea thread per utente e team
   */
  async getOrCreateThread(userId: string, teamId: string): Promise<ThreadInfo> {
    const existingThread = await this.getThread(userId, teamId);
    
    if (existingThread) {
      return existingThread;
    }

    return this.createThread(userId, teamId);
  }

  /**
   * Invia messaggio all'assistant
   */
  async sendMessage(
    threadId: string,
    message: string,
    teamContext: TeamContext
  ): Promise<{ runId: string; messageId: string }> {
    try {
      // Costruisci contesto minimo per l'assistant
      const contextMessage = this.buildContextString(teamContext);
      const fullMessage = `${contextMessage}\n\nRichiesta: ${message}`;

      // Aggiungi messaggio al thread
      const threadMessage = await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: fullMessage,
      });

      // Avvia run con l'assistant
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
      });

      return {
        runId: run.id,
        messageId: threadMessage.id,
      };
    } catch (error) {
      console.error('Errore invio messaggio:', error);
      throw new Error(AssistantError.ASSISTANT_UNAVAILABLE);
    }
  }

  /**
   * Controlla lo status di un run
   */
  async checkRunStatus(threadId: string, runId: string): Promise<RunStatus> {
    try {
      const run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
      return run.status as RunStatus;
    } catch (error) {
      console.error('Errore controllo status run:', error);
      throw new Error(AssistantError.ASSISTANT_UNAVAILABLE);
    }
  }

  /**
   * Attendi completamento run con timeout
   */
  async waitForCompletion(
    threadId: string,
    runId: string,
    timeoutMs: number = 30000
  ): Promise<RunStatus> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const status = await this.checkRunStatus(threadId, runId);
      
      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        return status;
      }
      
      // Attendi 500ms prima del prossimo check
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    throw new Error(AssistantError.TIMEOUT);
  }

  /**
   * Recupera messaggi del thread
   */
  async getThreadMessages(threadId: string, limit: number = 20): Promise<AssistantMessage[]> {
    try {
      const messages = await this.openai.beta.threads.messages.list(threadId, {
        limit,
        order: 'desc',
      });

      return messages.data.map(msg => ({
        id: msg.id,
        content: this.extractTextContent(msg.content),
        role: msg.role as 'user' | 'assistant',
        timestamp: msg.created_at ? new Date(msg.created_at * 1000) : new Date(),
        threadId,
      })).reverse(); // Inverti per avere ordine cronologico
    } catch (error) {
      console.error('Errore recupero messaggi:', error);
      return [];
    }
  }

  /**
   * Recupera ultimo messaggio dell'assistant
   */
  async getLatestAssistantMessage(threadId: string): Promise<AssistantMessage | null> {
    try {
      const messages = await this.openai.beta.threads.messages.list(threadId, {
        limit: 1,
        order: 'desc',
      });

      const latestMessage = messages.data[0];
      if (!latestMessage || latestMessage.role !== 'assistant') {
        return null;
      }

      return {
        id: latestMessage.id,
        content: this.extractTextContent(latestMessage.content),
        role: 'assistant',
        timestamp: latestMessage.created_at ? new Date(latestMessage.created_at * 1000) : new Date(),
        threadId,
      };
    } catch (error) {
      console.error('Errore recupero ultimo messaggio:', error);
      return null;
    }
  }

  /**
   * Elimina thread
   */
  async deleteThread(userId: string, teamId: string): Promise<void> {
    try {
      const chatThread = await prisma.chatThread.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId,
          },
        },
      });

      if (chatThread) {
        // Elimina da OpenAI
        try {
          await this.openai.beta.threads.del(chatThread.threadId);
        } catch (error) {
          // Ignora errori se thread già eliminato
          console.warn('Thread già eliminato su OpenAI:', error);
        }

        // Elimina dal database
        await prisma.chatThread.delete({
          where: { id: chatThread.id },
        });
      }
    } catch (error) {
      console.error('Errore eliminazione thread:', error);
      throw new Error('Errore durante eliminazione thread');
    }
  }

  /**
   * Aggiorna contatore messaggi
   */
  async updateMessageCount(userId: string, teamId: string): Promise<void> {
    try {
      await prisma.chatThread.update({
        where: {
          userId_teamId: {
            userId,
            teamId,
          },
        },
        data: {
          messageCount: {
            increment: 1,
          },
          lastUsed: new Date(),
        },
      });
    } catch (error) {
      console.error('Errore aggiornamento contatore:', error);
    }
  }

  // PRIVATE METHODS

  private async deleteExistingThread(userId: string, teamId: string): Promise<void> {
    try {
      await this.deleteThread(userId, teamId);
    } catch (error) {
      // Ignora errori durante eliminazione
      console.warn('Errore eliminazione thread esistente:', error);
    }
  }

  private buildContextString(context: TeamContext): string {
    return `CONTESTO SQUADRA:
Nome: ${context.teamName}
Sport: ${context.sport}
Categoria: ${context.category}
Giocatori attivi: ${context.activePlayersCount}
Ruolo utente: ${context.userRole === 'owner' ? 'Allenatore principale' : 'Vice allenatore'}
Nome utente: ${context.userName}`;
  }

  private extractTextContent(content: any[]): string {
    for (const item of content) {
      if (item.type === 'text') {
        return item.text.value;
      }
    }
    return '';
  }
}

// Singleton instance
export const assistantClient = new KoraAssistantClient();