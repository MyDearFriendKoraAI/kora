# Test Cases - Team Switcher & Limite 2 Squadre

## 🧪 Test Scenarios

### Scenario 1: User con 0 squadre
- **Comportamento atteso**: 
  - ❌ Team Switcher non viene mostrato
  - ✅ Può creare la prima squadra
  - ✅ Nessun banner di limite

### Scenario 2: User con 1 squadra  
- **Comportamento atteso**:
  - ✅ Team Switcher mostra nome fisso (no dropdown)
  - ✅ Può creare una seconda squadra
  - ⚠️ Banner warning "1/2 squadre utilizzate"

### Scenario 3: User con 2 squadre (limite raggiunto)
- **Comportamento atteso**:
  - ✅ Team Switcher dropdown attivo con entrambe le squadre
  - ❌ Bottone "Crea squadra" disabilitato  
  - 🔴 Banner errore "Limite raggiunto 2/2"
  - ✅ Switch tra squadre funzionante

### Scenario 4: Switch team
- **Comportamento atteso**:
  - ✅ LocalStorage aggiornato con currentTeamId
  - ✅ Zustand store sincronizzato
  - ✅ Redirect a `/teams/{teamId}`
  - ✅ UI aggiornata globalmente

## ✅ Implementazione Completata

### Core Components
- [x] **TeamSwitcher** - Dropdown con varianti desktop/mobile
- [x] **Zustand Store** - Gestione stato globale teams 
- [x] **useTeamData** - Hook per caricamento dati
- [x] **useTeamLimit** - Hook per limite squadre
- [x] **LimitBanner** - UI feedback per quota

### Integration Points  
- [x] **DashboardLayout** - TeamSwitcher in sidebar & mobile header
- [x] **Teams Page** - Aggiornata per usare store
- [x] **New Team Page** - Validazione limite + store sync
- [x] **Server Actions** - getUserTeamsAction endpoint

### Validations
- [x] **Frontend** - Hook useTeamLimit per UI logic
- [x] **Backend** - createTeamAction verifica limite 2 squadre
- [x] **Store Sync** - Auto-refresh dopo creazione team

## 🎯 Features

### Team Switcher UI
- Logo team/iniziali con colori personalizzati
- Badge "Mister" per owner (futuro "Vice Allenatore") 
- Sport icon + categoria se presente
- Dropdown con tutte le squadre + azioni
- "Crea nuova squadra" se sotto limite
- "Gestisci squadre" link alla pagina teams

### State Management
- Persistence currentTeam in localStorage
- Auto-selection prima squadra al login
- Cleanup team non più accessibili
- Real-time sync tra componenti

### Limit Enforcement
- 2 squadre max per account (FREE tier)
- Progress indicator visual 
- Smart disable/enable create buttons
- Tooltip informativi sui limiti

## 🚀 Next Steps

1. **Testing** - Verificare tutti gli scenari
2. **Vice Allenatori Integration** - Estendere store per squadre come assistant
3. **Team Switching Logic** - Context switching per queries
4. **Performance** - Ottimizzazione re-renders

## 🔧 Tech Stack Used

- **Zustand** - State management con persistence
- **TypeScript** - Type safety completa
- **Server Actions** - API sicure per team operations  
- **Local Storage** - Persistence currentTeam
- **Custom Hooks** - Reusable logic per limits & data