# Kora - Piattaforma SaaS Gestione Squadre Sportive

## Panoramica del Progetto
Kora è una piattaforma SaaS per la gestione di squadre sportive con AI coach integrato, sviluppata con architettura monorepo usando Turborepo e PNPM workspaces.

## Tech Stack apps/web
- **Framework**: Next.js 14 con App Router e TypeScript strict
- **Styling**: Tailwind CSS + componenti UI custom
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **ORM**: Prisma per type-safe queries
- **State**: Zustand per state management
- **Forms**: React Hook Form + Zod per validazione
- **AI**: OpenAI GPT-4o mini per features AI
- **PWA**: next-pwa per Progressive Web App
- **Deploy**: Ottimizzato per Vercel

## Struttura del Progetto

### Monorepo
```
Kora/
├── apps/
│   ├── web/          # Next.js 14 PWA (focus principale)
│   └── mobile/       # Placeholder React Native (futuro)
├── packages/
│   ├── shared/       # Utilities e tipi condivisi
│   └── config/       # Configurazioni ESLint/TypeScript
└── prisma/           # Schema database
```

### Architettura apps/web

#### Struttura Route
- `app/(auth)/` - Route pubbliche (login, register)
- `app/(dashboard)/` - Route protette (dashboard, teams, trainings, ai-coach)

#### Componenti
- `components/ui/` - Componenti base (Button, Card, Input, Dialog)
- `components/features/` - Componenti feature-specific (team/, player/, training/, ai/)

#### Servizi
- `lib/supabase/` - Client setup per server e browser
- `lib/openai/` - Integrazione GPT-4o mini per AI Coach
- `hooks/` - Custom hooks (useAuth, useTeam, useMediaQuery)
- `stores/` - Zustand stores per state management

## Database Schema (Prisma)

### Modelli Principali
- **User**: Utenti con tier (FREE/LEVEL1/PREMIUM)
- **Team**: Squadre multisport 
- **Player**: Giocatori con ruoli e numeri maglia
- **Training**: Allenamenti con durata e descrizione
- **Attendance**: Presenze agli allenamenti
- **Conversation**: Chat con AI Coach
- **Subscription**: Gestione abbonamenti Stripe

## Configurazione Ambiente

### Variabili Ambiente (.env)
```bash
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# OpenAI
OPENAI_API_KEY="..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## Comandi di Sviluppo

### Setup Iniziale
```bash
# Installazione dipendenze
pnpm install

# Setup database
pnpm db:generate
pnpm db:push

# Avvio sviluppo
pnpm dev
```

### Altri Comandi Utili
```bash
pnpm build        # Build production
pnpm lint         # Lint codebase
pnpm type-check   # TypeScript check
```

## Features Implementate

### Autenticazione
- ✅ Middleware per route protection
- ✅ Pages login/register con Supabase
- ✅ Redirect automatici auth/dashboard

### Dashboard
- ✅ Layout responsive mobile-first
- ✅ Navigation sidebar + bottom mobile
- ✅ Cards statistiche principali
- ✅ Feed attività recenti

### Gestione Squadre
- ✅ Lista squadre con info base
- ✅ Cards interattive con azioni
- ✅ Mock data per sviluppo

### Allenamenti
- ✅ Lista allenamenti programmati
- ✅ Sidebar con statistiche
- ✅ Calendario prossimi eventi

### AI Coach
- ✅ Chat interface con OpenAI
- ✅ Messaggi con loading states
- ✅ Suggerimenti rapidi
- ✅ Statistiche utilizzo AI

## Design System

### Localizzazione
- 🇮🇹 Solo italiano
- Date/time formato IT
- UI copy in italiano

### Responsive
- Mobile-first approach (70% utenti mobile)
- Breakpoints Tailwind standard
- Bottom navigation per mobile

### Modello Business
- **FREE**: Funzionalità base
- **LEVEL1**: Features intermedie  
- **PREMIUM**: Accesso completo + AI avanzato

## Prossimi Sviluppi

### Database Integration
- [ ] Setup completo Supabase
- [ ] Auth funzionante con redirect
- [ ] CRUD operazioni team/player/training

### AI Features
- [ ] Integrazione OpenAI API
- [ ] Context-aware coaching
- [ ] Analisi statistiche avanzate

### Subscription
- [ ] Integrazione Stripe
- [ ] Tier-based feature gating
- [ ] Billing dashboard

### Mobile App
- [ ] React Native setup
- [ ] Shared packages integration
- [ ] Cross-platform components

## Note Sviluppo

- Priorità: completare apps/web prima di mobile
- Focus mobile-first per UI/UX
- Type safety con TypeScript strict
- Componenti riutilizzabili cross-platform
- Performance PWA per web
- SEO optimization per landing pages

## Troubleshooting Database (Prisma + Supabase)

### Problema: "The table `public.table_name` does not exist"
Questo errore indica che le tabelle non sono state sincronizzate nel database Supabase.

**Soluzione:**
1. Usa la connessione diretta (porta 5432) invece di pgbouncer (porta 6543)
2. Esegui il push con il flag `--accept-data-loss`

```bash
# Comando SEMPRE DA ESEGUIRE dopo modifiche allo schema
DATABASE_URL="postgres://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" npx prisma db push --accept-data-loss
```

## REGOLA IMPORTANTE: Database Push Automatico

**OGNI volta che modifichi il file `prisma/schema.prisma` DEVI SEMPRE eseguire il push su Supabase:**

1. **Dopo ogni modifica al schema Prisma:**
   ```bash
   # 1. Rigenera il client Prisma
   npx prisma generate
   
   # 2. Push immediato su Supabase (USA SEMPRE la connessione diretta porta 5432)
   DATABASE_URL="postgres://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" npx prisma db push --accept-data-loss
   
   # 3. Riavvia il server se necessario
   pnpm dev
   ```

2. **Verifica sempre che il push sia andato a buon fine** controllando su Supabase Dashboard o con:
   ```bash
   npx prisma studio
   ```

3. **Non lasciare mai il database locale/development diverso da quello production su Supabase**

4. **Se ci sono conflitti, risolverli IMMEDIATAMENTE prima di continuare**

## Regole di Integrità Referenziale Database

Il database utilizza le seguenti regole di eliminazione a cascata per mantenere l'integrità:

### onDelete: Cascade (Eliminazione a cascata)
- **User → Team**: Se elimino un utente, si eliminano tutte le sue squadre
- **Team → Player**: Se elimino una squadra, si eliminano tutti i giocatori
- **Team → Training**: Se elimino una squadra, si eliminano tutti gli allenamenti
- **Team → TeamAssistant**: Se elimino una squadra, si eliminano tutti gli assistenti
- **Team → TeamInvite**: Se elimino una squadra, si eliminano tutti gli inviti
- **Team → TeamCustomField**: Se elimino una squadra, si eliminano tutti i campi custom
- **Training → Attendance**: Se elimino un allenamento, si eliminano tutte le presenze
- **Player → MedicalRecord**: Se elimino un giocatore, si eliminano tutte le sue cartelle mediche

### onDelete: SetNull (Imposta a NULL)
- **Training → parentTraining**: Se elimino un allenamento padre, i figli perdono il riferimento
- **TrainingTemplate → training**: Se elimino un allenamento, i template perdono il riferimento

### Principi da Seguire:
1. **Cascade per dati dipendenti**: Dati che non hanno senso senza il genitore
2. **SetNull per riferimenti opzionali**: Riferimenti che possono esistere indipendentemente
3. **Restrict per dati critici**: Mai implementato, preferiamo soft delete con flag `isDeleted`

### Problema: "Cannot read properties of undefined (reading 'findFirst')"
Questo errore indica che il client Prisma non è aggiornato con i nuovi modelli.

**Soluzione:**
1. Rigenera il client Prisma dopo modifiche allo schema
2. Riavvia il server di sviluppo

```bash
# Rigenera client Prisma
npx prisma generate

# Riavvia development server
pnpm dev
```

### Workflow Completo per Modifiche Schema
```bash
# 1. Modifica prisma/schema.prisma
# 2. Rigenera client
npx prisma generate

# 3. Push al database (usa connessione diretta)
DATABASE_URL="postgres://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" npx prisma db push --accept-data-loss

# 4. Riavvia dev server
pnpm dev
```

## React Query - Aggiornamento Cache dopo Operazioni CRUD

### Problema: Dati non aggiornati dopo eliminazione/modifica
Quando si elimina o modifica un'entità (es. squadra, giocatore), i dati potrebbero rimanere visibili nella UI anche dopo l'operazione completata con successo, richiedendo un refresh manuale della pagina.

### Soluzione: Aggiornamento Immediato della Cache
Utilizzare `setQueryData` di React Query per aggiornare immediatamente la cache locale prima che il refetch avvenga.

#### Esempio: Eliminazione Squadra con Aggiornamento Immediato

```typescript
// hooks/queries/useTeams.ts
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, data }) => deleteTeamAction(teamId, data),
    onSuccess: (result, variables) => {
      if (result?.success) {
        // 1. RIMUOVI IMMEDIATAMENTE dalla cache (update ottimistico)
        queryClient.setQueryData(queryKeys.teams.lists(), (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter((team) => team.id !== variables.teamId);
        });
        
        // 2. Aggiorna contatori correlati
        queryClient.setQueryData([...queryKeys.teams.all(), 'count'], (oldCount) => {
          return Math.max(0, (oldCount || 1) - 1);
        });
        
        // 3. Rimuovi query specifiche del team eliminato
        queryClient.removeQueries({ queryKey: queryKeys.teams.detail(variables.teamId) });
        queryClient.removeQueries({ queryKey: queryKeys.teams.players(variables.teamId) });
        queryClient.removeQueries({ queryKey: queryKeys.teams.trainings(variables.teamId) });
        
        // 4. Invalida per refresh futuro (background)
        queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
        
        toast.success('Squadra eliminata con successo!');
      }
    },
  });
}
```

#### Principi Chiave:
1. **`setQueryData` per aggiornamenti immediati**: Modifica direttamente la cache per riflettere istantaneamente i cambiamenti nella UI
2. **`removeQueries` per pulizia**: Rimuove dati obsoleti dalla cache per entità eliminate
3. **`invalidateQueries` per sincronizzazione**: Garantisce che i dati vengano ricaricati dal server in background
4. **Aggiornamento di tutte le query correlate**: Non dimenticare contatori, liste associate, ecc.

#### Pattern per altre operazioni:

**Creazione:**
```typescript
onSuccess: (result) => {
  // Aggiungi il nuovo item alla lista
  queryClient.setQueryData(queryKeys.teams.lists(), (old) => [...(old || []), result.data]);
}
```

**Modifica:**
```typescript
onSuccess: (result, variables) => {
  // Aggiorna l'item nella lista
  queryClient.setQueryData(queryKeys.teams.lists(), (old) => 
    old?.map(item => item.id === variables.id ? result.data : item)
  );
}
```

### Best Practices:
- Usa sempre `setQueryData` per aggiornamenti immediati dell'UI
- Combina con `invalidateQueries` per mantenere i dati sincronizzati
- Gestisci tutti i dati correlati (contatori, liste figlie, ecc.)
- Implementa questo pattern per tutte le operazioni CRUD

## Design System Sportivo Moderno - Linee Guida UI/UX

### 🎨 Principi di Design
Kora utilizza un design system moderno e sportivo che bilancia **energia** e **professionalità**.

#### Mood e Personalità
- **Energico**: Colori vivaci e animazioni fluide
- **Professionale**: Layout puliti e tipografia leggibile  
- **Sportivo**: Elementi visivi ispirati al mondo dello sport
- **Mobile-First**: Ottimizzato per l'uso durante allenamenti

### 🎯 Palette Colori Sportiva

#### Primary - Blu Energico
```css
primary: {
  50: '#e6f7ff',   // Sfondi chiari
  500: '#1890ff',  // Colore principale
  600: '#096dd9',  // Hover states
  900: '#002766'   // Dark mode
}
```

#### Secondary - Verde Campo
```css
secondary: {
  50: '#f6ffed',   // Success backgrounds
  500: '#52c41a',  // Conferme e positivi
  700: '#237804'   // Active states
}
```

#### Accent - Arancione Energia  
```css
accent: {
  500: '#fa8c16',  // Call-to-action
  600: '#d46b08'   // Highlights
}
```

#### Sport-Specific Colors
```css
sport: {
  soccer: '#52c41a',      // Verde calcio
  basketball: '#fa8c16',  // Arancione basket
  volleyball: '#1890ff',  // Blu volley
  tennis: '#fadb14',      // Giallo tennis
  swimming: '#13c2c2',    // Ciano nuoto
  athletics: '#eb2f96',   // Rosa atletica
  rugby: '#722ed1',       // Viola rugby
  baseball: '#f5222d'     // Rosso baseball
}
```

### 📝 Sistema Tipografico

#### Font Stack
```css
font-sans: ['Inter', 'system-ui', 'sans-serif']     // Testo generale
font-display: ['Bebas Neue', 'Inter', 'sans-serif'] // Titoli impact
font-mono: ['JetBrains Mono', 'monospace']          // Codici/statistiche
```

#### Gerarchia
- **Display**: Hero titles, numeri grandi (font-display)
- **Headings**: Sezioni (font-sans, semibold/bold)  
- **Body**: Paragrafi (font-sans, regular)
- **Caption**: Metadati e note (font-sans, small)

### 🧩 Componenti Base

#### Button Sportivo
```tsx
// Uso delle utility classes
<button className="btn-primary">       // Gradiente blu
<button className="btn-secondary">     // Gradiente verde  
<button className="btn-sport">         // Gradiente arcobaleno
```

#### Card Sportiva
```tsx
// Card con glassmorphism
<div className="sport-card">           // Sfondo vetro + blur
<div className="stat-card">            // Per statistiche con gradiente
```

#### Input Moderni  
```tsx
<input className="input-sport" />      // Input arrotondati con focus animato
```

### ✨ Animazioni e Micro-Interazioni

#### Principi Animazione
- **Duration**: 300ms standard, 150ms per micro-interazioni
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` per fluidità
- **Hover**: Scale leggeri (1.02-1.05), non eccessivi
- **Loading**: Skeleton shimmer, spinner colorati

#### Utility Classes Animate
```css
.hover-lift         // Sollevamento al hover
.hover-glow         // Ombra luminosa al hover  
.animate-float      // Fluttuazione continua
.animate-bounce-in  // Entrata elastica
.animate-shimmer    // Loading effect
```

### 📱 Mobile-First Guidelines

#### Touch Targets
- **Minimum Size**: 44px x 44px (standard iOS/Android)
- **Padding**: Generoso intorno a elementi interattivi
- **Spacing**: 16px minimum tra elementi toccabili

#### Responsive Breakpoints
```css
sm: '640px',   // Mobile large
md: '768px',   // Tablet  
lg: '1024px',  // Desktop
xl: '1280px'   // Desktop large
```

#### Safe Areas iOS
```css
.safe-top     // padding-top: env(safe-area-inset-top)
.safe-bottom  // padding-bottom: env(safe-area-inset-bottom)  
.pb-safe      // Solo bottom padding
```

### 🎭 Accessibility (WCAG 2.1 AA)

#### Focus Management
- **Focus Ring**: Ring blu 2px con offset
- **Keyboard Navigation**: Tab order logico
- **Skip Links**: Per navigation rapida

#### Contrast Standards
- **Normal Text**: 4.5:1 minimum contrast
- **Large Text**: 3:1 minimum contrast  
- **Interactive Elements**: Focus indicators visibili

#### Screen Readers
```tsx
// ARIA labels obbligatori
<button aria-label="Elimina squadra">
<input aria-describedby="error-message">
```

### 🔧 Utility Classes Personalizzate

#### Glassmorphism
```css
.glass              // Effetto vetro chiaro
.glass-dark         // Effetto vetro scuro
.glass-effect       // Backdrop blur completo
```

#### Gradient Utils
```css
.bg-gradient-sport  // Gradiente primary→accent  
.bg-gradient-field  // Gradiente verde campo
.text-gradient      // Testo con gradiente
```

#### Effetti Performance
```css
.gpu-accelerated    // Ottimizzazione GPU
.field-pattern      // Pattern campo sportivo
```

### 🚀 Best Practices Implementazione

#### Component Structure
```tsx
// Sempre seguire questo pattern
'use client';                    // Per interattività
import { cn } from '@kora/shared/utils';  // Utility class merge
import { useState, useEffect } from 'react';
import { Lucide Icons } from 'lucide-react';
```

#### Naming Conventions
```tsx
// File: ComponentNameModern.tsx
export function ComponentNameModern({
  variant = "primary",           // Props con default
  size = "md", 
  className,                     // Sempre accettare className custom
  ...props 
}: ComponentProps) {
  return (
    <div className={cn(
      "base-classes",              // Classi base sempre prime
      variants[variant],           // Varianti dinamiche  
      sizes[size],
      className                    // User override sempre ultimo
    )}>
```

#### Performance
```tsx
// Lazy loading componenti pesanti
const HeavyChart = lazy(() => import('./HeavyChart'));

// Optimistic updates per feedback immediato
const { mutate } = useMutation({
  onMutate: () => {
    // Update UI immediately
  }
});
```

### 📋 Checklist Pre-Release

#### Design Review
- [ ] Responsive su 320px-1920px
- [ ] Touch targets ≥44px  
- [ ] Contrast ratio ≥4.5:1
- [ ] Animazioni fluide <300ms
- [ ] Dark mode compatibile

#### Code Quality
- [ ] TypeScript strict mode
- [ ] Component props documented  
- [ ] Accessibility attributes
- [ ] Performance optimized
- [ ] Cross-browser tested

### 🎯 Componenti Prioritari Redesignati

1. ✅ **DashboardHero** - Hero section con statistiche animate
2. ✅ **TeamCardModern** - Card squadre con glassmorphism  
3. ✅ **ButtonModern** - Sistema button completo
4. ⏳ **PlayerCard** - Card giocatori stile gaming
5. ⏳ **TrainingCalendar** - Calendario con drag & drop
6. ⏳ **AIChatInterface** - Chat moderna stile ChatGPT

Seguire sempre queste linee guida per mantenere consistenza e qualità nel design system sportivo di Kora.