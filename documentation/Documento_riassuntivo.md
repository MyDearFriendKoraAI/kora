# Kora - Documento Riassuntivo Progetto

## 🎯 Vision del Prodotto

**Kora** è una web app multisport con agente AI per allenatori che permette di:
- Gestire squadre e programmare allenamenti
- Ricevere suggerimenti AI personalizzati  
- Analizzare prestazioni attraverso video e dati
- Supportare calcio, basket, pallavolo, rugby e altri sport

---

## 🏗️ Architettura del Prodotto

### Modello Freemium a 3 Livelli

| Piano | Prezzo | Funzionalità |
|-------|--------|--------------|
| **Base** | FREE | Gestione squadra, presenze, risultati partite, inserimento allenamenti manuali |
| **Level 1** | €7.99/mese (€49/anno) | Programmazione AI settimanale/mensile, suggerimenti personalizzati, analisi fatica da sondaggi |
| **Premium** | €19.99/mese (€199/anno) | Integrazione VEO, analisi video automatica, player rating AI |

### Stack Tecnologico Raccomandato
- **Frontend**: React/Next.js (web app responsive)
- **Backend**: Node.js con MongoDB/PostgreSQL
- **AI**: Claude API per conversazioni e analisi
- **Video Analysis**: VEO API integration
- **Deployment**: Vercel/Netlify

---

## 🎭 Strategia di Differenziazione

### Vs Concorrenti Esistenti
- **Coach Frank** (gratis ma solo calcio, funzionalità limitate)
- **CoachBetter** (€199/anno, complesso, costoso)
- **Assistant Coach** (multisport ma senza AI conversazionale)

### Nostro Vantaggio Competitivo
1. **Approccio graduale**: FREE → paid con valore crescente
2. **AI conversazionale**: Chat in tempo reale per consigli
3. **Multisport nativo**: Un'app per tutti gli sport
4. **Localizzazione italiana**: UX e contenuti specifici per il mercato italiano
5. **Integrazione VEO**: Unici a combinare coaching AI + video analysis automatica

---

## 💰 Business Model & Proiezioni

### Costi Operativi (Scenario Bootstrap - Founder Developer)
- **Marketing**: €500/mese
- **Infrastruttura Cloud**: €100/mese  
- **Operativi** (legal, business): €400/mese
- **Totale Fisso**: €1.000/mese

### Costi Variabili per Utente
- **Base**: €0.10 (solo storage)
- **Level 1**: €1.35 (AI API + storage)
- **Premium**: €5.75 (AI + VEO API + storage)

### Proiezioni di Crescita (3 Anni)
| Anno | Utenti Base | Level 1 | Premium | MRR | Profit Annuale |
|------|-------------|---------|---------|-----|----------------|
| 1 | 1.000 | 150 | 15 | €1.500 | -€3.500 |
| 2 | 2.500 | 400 | 50 | €4.200 | €18.600 |
| 3 | 4.000 | 800 | 120 | €8.800 | €48.400 |

**Break-even**: Mese 10-12 Anno 1 (150 Level 1 + 15 Premium)

---

## 🎯 Target Market

### Mercato Italiano
- **Squadre calcio giovanili**: ~15.000
- **Squadre basket/volley**: ~8.000
- **Altri sport**: ~5.000
- **Total Addressable Market**: ~28.000 squadre

### Segmentazione
- **70% Amatoriali**: Useranno principalmente tier Base e Level 1
- **25% Semi-Pro**: Target principale per Level 1 e Premium
- **5% Professionali**: Premium con integrazione VEO

---

## 🚀 Go-to-Market Strategy

### Fase 1 (Mesi 1-6): MVP + Validation
- **Geographic Focus**: Lombardia (calcio giovanile)
- **Target**: 200 squadre registrate, 50 conversioni Level 1
- **Marketing**: Content + local advertising (€500/mese)

### Fase 2 (Mesi 7-12): Scale + Premium Launch
- **Espansione**: Nord Italia + basket/volley
- **Launch**: Tier Premium con video analysis manuale
- **Obiettivo**: 1.000 utenti totali

### Fase 3 (Anno 2): National + VEO Partnership
- **Espansione**: Nazionale (Centro-Sud Italia)
- **Partnership**: Negoziazione integrazione VEO
- **B2B Sales**: Vendita diretta a club professionali

---

## 🔗 Integrazione VEO

### Opportunità Strategica
- **VEO Cam 3**: €1.998 + €100-300/mese abbonamento
- **API Disponibili**: Accesso a video, analytics, player tracking
- **VEO AI Incluso**: Event detection, highlights automatici, statistiche

### Nostra Proposta di Valore
- **VEO** = Analisi video partite passate
- **Kora** = Pianificazione allenamenti futuri + coaching conversazionale
- **Sinergia**: Trasformare dati VEO in piani di allenamento personalizzati

### Revenue Sharing Potential
- Partnership win-win: loro vendono più camere, noi accesso dati
- Target: Squadre che già investono €2-3K/anno in tech

---

## 💡 Investment Requirements

### Self-Funded Bootstrap (€15.000)
- **Marketing Iniziale**: €6.000 (12 mesi)
- **Infrastruttura**: €3.000 (12 mesi)
- **Operativo**: €4.800 (12 mesi)
- **Buffer**: €1.200

### Series A Opzionale (€200.000 - Anno 2)
- Solo se si vuole accelerare crescita nazionale
- **Marketing Scale**: €80.000
- **Team Expansion**: €60.000
- **Partnership VEO**: €30.000

---

## 📊 Key Success Metrics

### Unit Economics
- **CAC (Customer Acquisition Cost)**: €15-25
- **LTV Level 1**: €180 (24 mesi retention)
- **LTV Premium**: €480 (24 mesi retention)
- **LTV/CAC Ratio**: 7-20x (molto sano)

### Conversion Funnel
- **Free → Level 1**: 15% target
- **Level 1 → Premium**: 8% target
- **Monthly Churn**: 5% (ottimistico ma realistico)

---

## ⚠️ Risk Analysis

### Rischi Principali
1. **Concorrenza**: Coach Frank/altri espandono funzionalità AI
2. **VEO Partnership**: Termini sfavorevoli o rifiuto collaborazione
3. **Adozione Lenta**: Allenatori conservatori su nuove tecnologie
4. **Stagionalità**: Calo utilizzo durante pausa estiva

### Strategie di Mitigazione
1. **First-mover advantage** + focus su UX italiana
2. **Plan B**: Sviluppo video analysis proprietaria
3. **Education**: Content marketing intensivo + demo gratuite
4. **Diversificazione**: Sport indoor/outdoor, calcio a 5

---

## 🏆 Success Scenarios

### Conservative (Caso Base)
- **Anno 3**: 4.000+ utenti, €105K revenue annuale
- **Valuation**: €2-3M

### Optimistic
- **Anno 3**: 8.000+ utenti, €200K revenue annuale  
- **Valuation**: €5-8M

### Moonshot (VEO Partnership Success)
- **Anno 3**: 15.000+ utenti, €400K revenue annuale
- **Valuation**: €15-25M
- **Exit**: Acquisizione da VEO o competitor maggiore

---

## 📅 Timeline Esecutivo

### Q1 2025: MVP Development
- Sviluppo features core (gestione squadra, presenze)
- Beta testing con 10 squadre pilota
- Setup infrastruttura base

### Q2 2025: Public Launch
- Launch pubblico in Lombardia
- Target: 200 utenti registrati
- Primo feedback market validation

### Q3 2025: AI Features
- Launch Level 1 con AI planning
- Target: 500+ utenti, primi ricavi
- Analisi performance e ottimizzazioni

### Q4 2025: Premium Tier
- Launch Premium con video analysis manuale
- Target: 1.000+ utenti totali
- Break-even raggiunto

### 2026: Scale & Partnership
- Espansione nazionale
- Negoziazione partnership VEO
- Considerazione Series A se necessario

---

## ✅ Next Steps Immediati

1. **Validazione Mercato**: Interviste con 20 allenatori locali
2. **MVP Design**: Wireframe e user journey base
3. **Tech Setup**: Configurazione development environment
4. **Content Strategy**: Piano editorial per education market
5. **Legal Setup**: Costituzione società e privacy compliance

---

## 🎯 Conclusion

Il progetto **Kora** presenta:
- **Mercato validato** con competitors esistenti di successo
- **Differenziazione chiara** tramite AI conversazionale + multisport
- **Business model sostenibile** con costi contenuti
- **Path to profitability** realistico (12 mesi)
- **Scalabilità elevata** senza investimenti iniziali massivi

**Raccomandazione**: Procedere con sviluppo MVP mantenendo approccio bootstrap e controllo totale equity.