# 📱 **WIREFRAME DOCUMENTATION - KORA**
## Phase 1: Foundation Design

---

## **1. INFORMATION ARCHITECTURE**

### 1.1 Sitemap Principale
```
KORA
├── Landing Page (non autenticato)
│   ├── Home
│   ├── Funzionalità
│   ├── Prezzi
│   ├── Login/Registrazione
│   └── Contatti
│
└── App Dashboard (autenticato)
    ├── Dashboard Home
    ├── La Mia Squadra
    │   ├── Roster Giocatori
    │   ├── Staff Tecnico
    │   └── Impostazioni Squadra
    ├── Allenamenti
    │   ├── Calendario
    │   ├── Pianifica Allenamento
    │   ├── Storico
    │   └── Presenze
    ├── AI Coach
    │   ├── Chat Assistente
    │   ├── Suggerimenti
    │   └── Programmi Salvati
    ├── Partite
    │   ├── Calendario Partite
    │   ├── Risultati
    │   └── Statistiche
    └── Profilo
        ├── Account
        ├── Abbonamento
        └── Impostazioni
```

---

## **2. WIREFRAME DETTAGLIATI**

### 2.1 **LANDING PAGE**

```
┌─────────────────────────────────────────────────┐
│  [Logo KORA]     Funzionalità  Prezzi  [Accedi] │
├─────────────────────────────────────────────────┤
│                                                 │
│         L'AI Coach per Ogni Allenatore          │
│                                                 │
│    Gestisci la tua squadra e pianifica gli     │
│    allenamenti con l'intelligenza artificiale   │
│                                                 │
│         [Inizia Gratis]  [Guarda Demo]          │
│                                                 │
├─────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  📱     │  │  🤖     │  │  📊     │        │
│  │Gestione │  │   AI    │  │Analytics│        │
│  │ Squadra │  │ Coach   │  │  Smart  │        │
│  └─────────┘  └─────────┘  └─────────┘        │
├─────────────────────────────────────────────────┤
│              Come Funziona                      │
│  1️⃣ ──────> 2️⃣ ──────> 3️⃣ ──────> 4️⃣         │
│  Registra   Aggiungi   Chatta    Applica      │
│  Squadra    Giocatori  con AI    Consigli     │
├─────────────────────────────────────────────────┤
│                  PREZZI                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  FREE    │ │ LEVEL 1  │ │ PREMIUM  │      │
│  │  €0/mese │ │€7.99/mese│ │€19.99/mese│     │
│  │ ✓ Base   │ │ ✓ AI     │ │ ✓ Video  │      │
│  └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────┘
```

### 2.2 **REGISTRAZIONE/ONBOARDING**

```
Step 1: Account
┌─────────────────────────────────────────────────┐
│              Benvenuto in KORA! 🎯              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Email*         [_____________________]         │
│                                                 │
│  Password*      [_____________________]         │
│                                                 │
│  Nome*          [_____________________]         │
│                                                 │
│  Cognome*       [_____________________]         │
│                                                 │
│  ☐ Accetto termini e condizioni                │
│                                                 │
│           [Continua] ──────────>                │
│                                                 │
│  Hai già un account? [Accedi]                  │
└─────────────────────────────────────────────────┘

Step 2: Sport Selection
┌─────────────────────────────────────────────────┐
│         Quale sport alleni? ⚽                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │    ⚽    │  │    🏀    │  │    🏐    │       │
│  │ Calcio  │  │ Basket  │  │Pallavolo│        │
│  └─────────┘  └─────────┘  └─────────┘        │
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │    🏈    │  │    🎾    │  │    ➕    │       │
│  │  Rugby  │  │ Tennis  │  │  Altro  │        │
│  └─────────┘  └─────────┘  └─────────┘        │
│                                                 │
│  [← Indietro]            [Continua →]           │
└─────────────────────────────────────────────────┘

Step 3: Team Setup
┌─────────────────────────────────────────────────┐
│         Crea la tua squadra 👥                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Nome Squadra*   [_____________________]        │
│                                                 │
│  Categoria       [Seleziona ▼]                  │
│                  • Under 10                     │
│                  • Under 12                     │
│                  • Under 14                     │
│                  • Prima Squadra                │
│                                                 │
│  Stagione        [2024/2025 ▼]                  │
│                                                 │
│  Campo/Palestra  [_____________________]        │
│                                                 │
│  [← Indietro]      [Completa Setup ✓]           │
└─────────────────────────────────────────────────┘
```

### 2.3 **DASHBOARD HOME**

```
┌─────────────────────────────────────────────────┐
│ 🏠 Dashboard   [👤 Marco Rossi ▼]    [🔔]  [⚙️] │
├─────────────────────────────────────────────────┤
│                                                 │
│  Ciao Marco! 👋                                 │
│  Ecco il riepilogo di oggi                     │
│                                                 │
│  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Prossimo Allen. │  │ Presenze Ultima │      │
│  │   📅 Oggi       │  │   📊 85%        │      │
│  │   ⏰ 18:30      │  │   👥 17/20      │      │
│  │ [Vedi Dettagli] │  │ [Gestisci]      │      │
│  └─────────────────┘  └─────────────────┘      │
│                                                 │
│  ┌─────────────────────────────────────┐       │
│  │ 💬 Chiedi all'AI Coach              │       │
│  │                                     │       │
│  │ "Come posso migliorare il possesso │       │
│  │  palla della squadra?"             │       │
│  │                                     │       │
│  │            [Chiedi Ora →]           │       │
│  └─────────────────────────────────────┘       │
│                                                 │
│  📊 Quick Stats                                 │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │
│  │Giocatori│Allenamenti│Presenza│ Partite │    │
│  │   20   │    42    │  82%   │  W:8 L:2│    │
│  └───────┘ └───────┘ └───────┘ └───────┘     │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │[🏠] [👥] [📅] [🤖] [⚽] │
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 2.4 **GESTIONE SQUADRA/ROSTER**

```
┌─────────────────────────────────────────────────┐
│ ← La Mia Squadra                   [+ Aggiungi] │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Tutti ▼] [Ruolo ▼] [🔍 Cerca...]              │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 👤 Marco Bianchi          #10 • Attaccante  ││
│ │ ✅ Presente ultimo allenamento               ││
│ │ 📊 Presenze: 95% | ⚽ Goal: 12              ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 👤 Luca Verdi             #7 • Centrocampo  ││
│ │ ⚠️ Infortunato - Rientro previsto: 2 sett    ││
│ │ 📊 Presenze: 78% | 🅰️ Assist: 8             ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 👤 Giuseppe Neri          #1 • Portiere     ││
│ │ ✅ Presente ultimo allenamento               ││
│ │ 📊 Presenze: 88% | 🧤 Clean Sheet: 5        ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Mostra più giocatori...                         │
│                                                 │
│ [Esporta CSV] [Statistiche Squadra]             │
└─────────────────────────────────────────────────┘
```

### 2.5 **PIANIFICA ALLENAMENTO**

```
┌─────────────────────────────────────────────────┐
│ ← Nuovo Allenamento              [Salva Bozza] │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📅 Data e Ora                                   │
│ [25/03/2025 ▼] [18:30 ▼] Durata: [90 min ▼]   │
│                                                 │
│ 📍 Luogo                                        │
│ [Campo Principale ▼]                            │
│                                                 │
│ 🎯 Focus Allenamento                            │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│ │Tecnica│ │Tattica│ │Fisico│ │Possesso│ │Tiri│ │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
│                                                 │
│ 📝 Struttura Allenamento                        │
│ ┌─────────────────────────────────────────────┐│
│ │ Riscaldamento (15 min)                      ││
│ │ [Aggiungi esercizi...]                      ││
│ ├─────────────────────────────────────────────┤│
│ │ Parte Principale (60 min)                   ││
│ │ [Aggiungi esercizi...]                      ││
│ ├─────────────────────────────────────────────┤│
│ │ Defaticamento (15 min)                      ││
│ │ [Aggiungi esercizi...]                      ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ 🤖 Suggerimento AI                              │
│ [Chiedi all'AI di creare un programma]          │
│                                                 │
│ [Annulla]              [Salva e Programma]      │
└─────────────────────────────────────────────────┘
```

### 2.6 **AI COACH CHAT**

```
┌─────────────────────────────────────────────────┐
│ ← AI Coach                          [Cronologia]│
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 🤖 AI Coach                                  ││
│ │ Ciao Marco! Come posso aiutarti oggi con    ││
│ │ la tua squadra Under 14?                     ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 👤 Tu                                        ││
│ │ Vorrei migliorare il gioco di possesso      ││
│ │ palla. Abbiamo difficoltà a mantenere       ││
│ │ il controllo sotto pressione.                ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 🤖 AI Coach                                  ││
│ │ Capisco. Per l'U14, ecco 3 esercizi         ││
│ │ progressivi per il possesso palla:          ││
│ │                                              ││
│ │ 1. Rondo 4v2 (10 min)                       ││
│ │ 2. Possesso 6v6+3 jolly (15 min)           ││
│ │ 3. Partita a tema con zone (20 min)        ││
│ │                                              ││
│ │ [Vedi Dettagli] [Salva Programma]           ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 💬 Scrivi un messaggio...           [Invia] ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### 2.7 **TRACKING PRESENZE**

```
┌─────────────────────────────────────────────────┐
│ ← Presenze Allenamento          25/03/2025 18:30│
├─────────────────────────────────────────────────┤
│                                                 │
│ 📊 Riepilogo: 17/20 presenti (85%)             │
│                                                 │
│ [✅ Tutti Presenti] [❌ Tutti Assenti]          │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ ✅ Bianchi Marco              #10           ││
│ │ ✅ Verdi Luca                 #7            ││
│ │ ❌ Neri Giuseppe              #1            ││
│ │    └─ 🏥 Infortunato                       ││
│ │ ✅ Russo Antonio              #5            ││
│ │ ⚠️ Romano Paolo               #11           ││
│ │    └─ ⏰ Ritardo (10 min)                  ││
│ │ ✅ Ferrari Andrea             #9            ││
│ │ ❌ Colombo Matteo             #3            ││
│ │    └─ 📚 Motivi di studio                  ││
│ │ ✅ Ricci Francesco            #4            ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ 📝 Note Allenamento                             │
│ [_________________________________________]     │
│                                                 │
│ [Annulla]                    [Salva Presenze]   │
└─────────────────────────────────────────────────┘
```

---

## **3. DESIGN PATTERNS & COMPONENTI**

### 3.1 Navigation Pattern
- **Mobile**: Tab bar fissa in basso con 5 icone principali
- **Desktop**: Sidebar laterale collassabile
- **Breadcrumb** per navigazione profonda

### 3.2 Card Components
```
Standard Card:
┌─────────────────────────┐
│ [Icon] Title           │
│ Description text here   │
│ Metric: Value          │
│ [Primary Action]       │
└─────────────────────────┘
```

### 3.3 Form Elements
- Input fields con label floating
- Validazione real-time
- Error states chiari
- Success feedback immediato

### 3.4 Empty States
```
┌─────────────────────────┐
│         [Icon]         │
│   Nessun dato ancora   │
│ [Aggiungi Primo Item]  │
└─────────────────────────┘
```

---

## **4. RESPONSIVE BEHAVIOR**

### 4.1 Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

### 4.2 Layout Adaptation
- **Mobile**: Single column, stacked cards
- **Tablet**: 2 column grid dove appropriato
- **Desktop**: Multi-column con sidebar

### 4.3 Touch Targets
- Minimo 44x44px per elementi interattivi
- Spacing adeguato tra elementi
- Swipe gestures per azioni comuni

---

## **5. INTERACTION FLOWS**

### 5.1 Quick Add Player
1. Tap "+" su roster
2. Form modale con campi essenziali
3. Save → Ritorno a lista con success toast

### 5.2 AI Conversation Flow
1. Tap su AI Coach
2. Typing indicator durante risposta
3. Opzioni di azione post-risposta
4. Save conversation per riferimento

### 5.3 Attendance Flow
1. Pre-popolato con tutti presenti
2. Toggle rapido per assenze
3. Opzione note per assenza
4. Conferma con riepilogo

---

## **6. ACCESSIBILITY REQUIREMENTS**

- **Contrast Ratio**: Minimo 4.5:1 per testo normale
- **Font Size**: Minimo 16px per body text
- **Touch Targets**: Minimo 44x44px
- **Screen Reader**: Label appropriate per tutti gli elementi
- **Keyboard Navigation**: Tab order logico

---

## **7. NEXT STEPS**

1. **Validazione con utenti**: Test wireframe con 5 allenatori
2. **High-fidelity mockups**: Conversione in design finale
3. **Prototype interattivo**: Figma/Adobe XD
4. **Design system**: Documentazione componenti
5. **Handoff sviluppatori**: Specifiche tecniche dettagliate

---

**Documento Versione**: 1.0
**Data**: [Data corrente]
**Designer**: [Nome]
**Approvato da**: [Product Owner]