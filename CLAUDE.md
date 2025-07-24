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