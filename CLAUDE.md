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