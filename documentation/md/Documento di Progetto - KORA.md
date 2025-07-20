# 📄 **DOCUMENTO DI PROGETTO - KORA**

## **1. EXECUTIVE SUMMARY**

### 1.1 Descrizione Progetto
Kora è una piattaforma SaaS multisport che integra intelligenza artificiale conversazionale per supportare allenatori nella gestione delle squadre e nella programmazione degli allenamenti.

### 1.2 Obiettivi Principali
- Sviluppare MVP entro Q2 2025
- Acquisire 1.000 utenti attivi entro 12 mesi
- Raggiungere break-even entro mese 12
- Creare partnership strategica con VEO entro 2026

### 1.3 Budget e Timeline
- **Budget totale**: €15.000 (bootstrap)
- **Durata sviluppo MVP**: 4 mesi
- **Time to market**: 6 mesi
- **ROI previsto**: 18 mesi

---

## **2. SCOPE DEL PROGETTO**

### 2.1 In Scope
✅ Web app responsive (mobile-first)
✅ Gestione squadre multisport (max 2 per account)
✅ Sistema di inviti per Vice Allenatori
✅ AI conversazionale per coaching
✅ Sistema presenze e statistiche
✅ Programmazione allenamenti
✅ Modello freemium a 3 livelli
✅ Localizzazione italiana

### 2.2 Out of Scope (Phase 1)
❌ App native iOS/Android
❌ Integrazione hardware (VEO)
❌ Live streaming partite
❌ E-commerce merchandising
❌ Multi-lingua (solo italiano)
❌ Gestione pagamenti squadra

---

## **3. STAKEHOLDER E RUOLI**

### 3.1 Team di Progetto

| Ruolo | Responsabilità | Commitment |
|-------|---------------|------------|
| **Product Owner** | Vision prodotto, priorità backlog | Full-time |
| **Tech Lead** | Architettura, code review | Full-time |
| **Full-Stack Dev** | Sviluppo frontend/backend | Full-time |
| **UX Designer** | Design system, user flows | Part-time (3 mesi) |
| **AI Specialist** | Integrazione Claude, prompt engineering | Consultant |

### 3.2 Ruoli Utente
- **Allenatore (Coach)**: Proprietario della squadra, accesso completo
- **Vice Allenatore (Assistant)**: Invitato dall'allenatore, accesso in lettura/scrittura
- **Admin**: Gestione piattaforma

### 3.3 Stakeholder Esterni
- **Beta Testers**: 10 allenatori + 5 vice allenatori selezionati
- **Advisor Sportivi**: 2-3 figure di riferimento
- **Partner Tecnologici**: Claude/Anthropic, VEO (futuro)
- **Federazioni Sportive**: FIGC, FIP per validazione

---

## **4. DELIVERABLES E MILESTONES**

### Phase 1: Foundation (Mesi 1-2)
**Deliverables**:
- [ ] Business plan dettagliato
- [ ] Wireframe completi
- [ ] Architettura tecnica
- [ ] Setup infrastruttura base
- [ ] Brand identity

**Milestone**: Design Approval ✓

### Phase 2: MVP Development (Mesi 3-4)
**Deliverables**:
- [ ] Core features sviluppate
- [ ] Sistema di inviti per vice allenatori
- [ ] Gestione permessi multi-ruolo
- [ ] Limite 2 squadre per account
- [ ] Integrazione AI base
- [ ] Testing interno completato
- [ ] Documentazione tecnica
- [ ] Deploy staging environment

**Milestone**: MVP Feature Complete ✓

### Phase 3: Beta Testing (Mesi 5-6)
**Deliverables**:
- [ ] Beta pubblica con 50 utenti
- [ ] Feedback incorporation
- [ ] Performance optimization
- [ ] Security audit
- [ ] Go-live production

**Milestone**: Production Launch ✓

### Phase 4: Growth (Mesi 7-12)
**Deliverables**:
- [ ] Feature iterations mensili
- [ ] Tier Premium launch
- [ ] 1.000 utenti acquisiti
- [ ] Partnership discussions
- [ ] Series A pitch deck

**Milestone**: Break-even Achieved ✓

---

## **5. WORK BREAKDOWN STRUCTURE (WBS)**

```
1. KORA PROJECT
   1.1 Project Management
       1.1.1 Planning & Documentation
       1.1.2 Sprint Management
       1.1.3 Stakeholder Communication
   
   1.2 Product Design
       1.2.1 User Research
       1.2.2 UX/UI Design
       1.2.3 Design System
   
   1.3 Technical Development
       1.3.1 Backend Development
             1.3.1.1 API Architecture
             1.3.1.2 Database Design
             1.3.1.3 Authentication System
             1.3.1.4 AI Integration
             1.3.1.5 Sistema Inviti Vice Allenatori
             1.3.1.6 Gestione Permessi Multi-ruolo
       
       1.3.2 Frontend Development
             1.3.2.1 React App Setup
             1.3.2.2 Core Components
             1.3.2.3 State Management
             1.3.2.4 Responsive Design
       
       1.3.3 Infrastructure
             1.3.3.1 Cloud Setup
             1.3.3.2 CI/CD Pipeline
             1.3.3.3 Monitoring
   
   1.4 Testing & QA
       1.4.1 Unit Testing
       1.4.2 Integration Testing
       1.4.3 User Acceptance Testing
   
   1.5 Marketing & Launch
       1.5.1 Content Creation
       1.5.2 Launch Campaign
       1.5.3 User Onboarding
```

---

## **6. BUDGET BREAKDOWN**

### 6.1 Costi di Sviluppo (One-time)
| Voce | Costo | Note |
|------|-------|------|
| UX/UI Design | €2.000 | 3 mesi part-time |
| Domain & Hosting Setup | €500 | Annuale |
| Legal & Compliance | €1.000 | Privacy, Terms |
| Marketing Materials | €1.500 | Logo, video, content |
| **Totale Setup** | **€5.000** | |

### 6.2 Costi Operativi (Mensili)
| Voce | Costo/mese | Annuale |
|------|------------|---------|
| Cloud Infrastructure | €100 | €1.200 |
| AI API (Claude) | €200 | €2.400 |
| Marketing | €500 | €6.000 |
| Varie & Tools | €200 | €2.400 |
| **Totale Mensile** | **€1.000** | **€12.000** |

### 6.3 Contingency
- **Buffer 20%**: €3.000
- **Totale Progetto Anno 1**: €15.000

---

## **7. RISK REGISTER**

| ID | Rischio | Probabilità | Impatto | Mitigation | Owner |
|----|---------|-------------|---------|------------|-------|
| R1 | Ritardo sviluppo | Media | Alto | Sprint bisettimanali, MVP scope ridotto | Tech Lead |
| R2 | Costi AI overrun | Bassa | Alto | Rate limiting, caching responses | Product Owner |
| R3 | Bassa adoption | Media | Alto | Beta testing esteso, pivot features | Marketing |
| R4 | Competitor copia | Alta | Medio | First-mover, community building | CEO |
| R5 | GDPR compliance | Bassa | Alto | Consulenza legale, privacy by design | Legal |
| R6 | Gestione permessi complessa | Media | Medio | UI/UX semplificata, testing esteso | UX Designer |

---

## **8. PIANO DI COMUNICAZIONE**

### 8.1 Comunicazione Interna
- **Daily Standup**: 15 min (team dev)
- **Sprint Review**: Bisettimanale
- **Stakeholder Update**: Mensile
- **Board Meeting**: Trimestrale

### 8.2 Comunicazione Esterna
- **Beta Testers**: Update settimanali
- **Blog Updates**: Bisettimanali
- **Social Media**: 3x/settimana
- **Newsletter**: Mensile

### 8.3 Canali
- Slack (team interno)
- Discord (community beta)
- Email (stakeholder)
- Blog (pubblico)

---

## **9. QUALITY ASSURANCE**

### 9.1 Standard di Qualità
- **Code Coverage**: >80%
- **Performance**: <3s page load
- **Uptime**: 99.9% SLA
- **Security**: OWASP compliance
- **Accessibility**: WCAG 2.1 AA

### 9.2 Testing Strategy
1. **Development**: Unit test per feature
2. **Staging**: Integration testing
3. **UAT**: 10 beta tester per 2 settimane
4. **Production**: Monitoring continuo

### 9.3 Definition of Done
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product Owner approval

---

## **10. SUCCESS CRITERIA**

### 10.1 KPI Tecnici
- Page Load Time <3 secondi
- Uptime >99.9%
- Zero critical security issues
- Mobile score >90/100

### 10.2 KPI Business
- 1.000 utenti registrati (12 mesi)
- 15% conversione free→paid
- MRR €2.000+ (mese 12)
- NPS >50
- Adozione feature vice allenatore >40%
- Media di 1.5 squadre per account attivo

### 10.3 KPI Prodotto
- Daily Active Users >30%
- Feature adoption >70%
- Support tickets <5% utenti
- Churn rate <5% mensile

---

## **11. TIER LIMITATIONS**

### 11.1 FREE Tier
- **Squadre**: 1 squadra come proprietario
- **Vice Allenatore**: Può essere vice di 1 altra squadra
- **Giocatori**: Max 20 per squadra
- **Vice per squadra**: Max 1
- **AI Requests**: 5 al giorno

### 11.2 LEVEL 1 Tier
- **Squadre**: 2 squadre come proprietario
- **Vice Allenatore**: Può essere vice illimitato
- **Giocatori**: Illimitati per squadra
- **Vice per squadra**: Max 2
- **AI Requests**: 20 al giorno

### 11.3 PREMIUM Tier
- **Squadre**: 2 squadre come proprietario
- **Vice Allenatore**: Può essere vice illimitato
- **Giocatori**: Illimitati per squadra
- **Vice per squadra**: Illimitati
- **AI Requests**: 100 al giorno
- **Features extra**: Video analysis (futuro), export avanzati

---

## **12. CHANGE MANAGEMENT**

### 12.1 Change Control Process
1. Change Request Form
2. Impact Analysis
3. Approval Board (>€500 o >1 sprint)
4. Implementation Plan
5. Verification

### 12.2 Scope Creep Prevention
- Feature freeze durante sprint
- Backlog grooming settimanale
- Strict MVP definition
- Post-launch roadmap

---

## **13. POST-LAUNCH PLAN**

### 13.1 Maintenance & Support
- Bug fixing prioritario
- Feature updates mensili
- Community management
- Customer success calls

### 13.2 Growth Initiatives
- Referral program
- Content marketing
- Partnership outreach
- Product iterations basate su feedback

### 13.3 Scale Planning
- Infrastructure scaling automatico
- Team expansion (mese 6+)
- Internazionalizzazione (anno 2)
- Mobile app nativa (anno 2)

---

## **14. APPROVAZIONI**

| Ruolo | Nome | Firma | Data |
|-------|------|-------|------|
| Product Owner | ____________ | ____________ | ___/___/___ |
| Tech Lead | ____________ | ____________ | ___/___/___ |
| Stakeholder | ____________ | ____________ | ___/___/___ |

---

## **15. ALLEGATI**

1. **Allegato A**: Analisi di mercato dettagliata
2. **Allegato B**: Specifiche tecniche complete
3. **Allegato C**: Mockup e wireframe
4. **Allegato D**: Piano marketing dettagliato
5. **Allegato E**: Analisi competitiva
6. **Allegato F**: Proiezioni finanziarie
7. **Allegato G**: Flusso inviti Vice Allenatori

---

**Documento Versione**: 1.1  
**Data Creazione**: [Data Originale]  
**Ultimo Aggiornamento**: [Data Odierna]  
**Prossima Review**: [Data + 30 giorni]

**Changelog v1.1**:
- Aggiunto sistema inviti Vice Allenatori
- Implementato limite 2 squadre per account
- Definiti limiti per tier di abbonamento
- Aggiunto risk management per gestione permessi