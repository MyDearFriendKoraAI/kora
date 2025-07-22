# 🚀 **KORA DEVELOPMENT ROADMAP - UPDATED**

## **PHASE 1: MVP FOUNDATION** (Settimane 1-4)

### ✅ **Sprint 1: Setup & Authentication** (Settimana 1)
- [x] Project setup con monorepo structure
- [x] **Authentication Flow**
  - [x] Login/Register pages
  - [x] Supabase Auth integration
  - [x] Email verification
  - [x] Password reset
  - [x] Protected routes middleware
  - [x] User profile setup
  - [x] Account limits validation (2 teams max)

### 📋 **Sprint 2: Team Management** (Settimana 2)
- [x] **Team CRUD**
  - [x] Create team flow (sport, category, season)
  - [x] Team dashboard
  - [x] Edit team details
  - [x] Delete team (with confirmation)
  - [x] Team switcher (max 2 teams)
  - [x] Limite 2 squadre per account enforced
- [x] **Vice Allenatore System**
  - [x] Invito via email con Resend
  - [x] Pagina accettazione/rifiuto invito
  - [x] Gestione permessi owner/assistant
  - [x] Lista vice allenatori
  - [x] Rimozione vice allenatori
  - [x] Limiti per tier (1/2/unlimited)
- [x] **Team Settings**
  - [x] Colors and logo upload
  - [x] Home field management
  - [x] Season configuration
  - [x] Assistant management UI

### 👥 **Sprint 3: Player Management** (Settimana 3)
- [x] **Player Roster**
  - [x] Add player form
  - [x] Player list view (cards)
  - [x] Player detail page
  - [x] Edit player info
  - [x] Archive/activate players
  - [x] Permissions check (owner + assistant)
- [x] **Import/Export**
  - [x] CSV import roster
  - [x] Export to CSV/PDF (owner only)
  - [x] Bulk operations
- [x] **Player Features**
  - [x] Photo upload
  - [x] Medical notes
  - [x] Parent contacts (for minors)

### 🏃 **Sprint 4: Training Core** (Settimana 4)
- [x] **Training Sessions**
  - [x] Calendar view
  - [x] Create training session (owner + assistant)
  - [x] Training types and focus areas
  - [x] Duration and location
  - [x] Training plan structure
  - [x] Creator tracking (who created)
- [x] **Attendance System**
  - [x] Quick attendance marking
  - [x] Absence justification
  - [x] Attendance history
  - [x] Statistics dashboard
  - [x] Marker tracking (who marked)

---

## **PHASE 2: AI INTEGRATION** (Settimane 5-8)

### 🤖 **Sprint 5: AI Coach Basic** (Settimana 5)
- [ ] **Chat Interface**
  - [ ] AI chat UI component
  - [ ] Message history
  - [ ] Typing indicators
  - [ ] Error handling
  - [ ] Context awareness (team role)
- [ ] **OpenAI Integration**
  - [ ] GPT-4o mini setup
  - [ ] Prompt engineering
  - [ ] Response caching
  - [ ] Rate limiting by tier

### 📊 **Sprint 6: AI Features** (Settimana 6)
- [ ] **Training Generation**
  - [ ] AI-powered training plans
  - [ ] Exercise suggestions
  - [ ] Customization options
  - [ ] Save generated plans
  - [ ] Share with team (owner to assistant)
- [ ] **Coaching Insights**
  - [ ] Team performance analysis
  - [ ] Player development tips
  - [ ] Tactical suggestions
  - [ ] Personalized by role

### 📈 **Sprint 7: Analytics & Stats** (Settimana 7)
- [ ] **Dashboard Metrics**
  - [ ] Attendance trends
  - [ ] Training frequency
  - [ ] Player participation
  - [ ] Team statistics
  - [ ] Multi-team overview (2 teams)
- [ ] **Reports**
  - [ ] Monthly summaries
  - [ ] Player progress cards
  - [ ] Exportable reports (owner only)
  - [ ] Assistant activity logs

### 🎯 **Sprint 8: Match Management** (Settimana 8)
- [ ] **Match Calendar**
  - [ ] Add matches (owner + assistant)
  - [ ] Results tracking
  - [ ] Lineup management
  - [ ] Basic match stats
- [ ] **Pre/Post Match**
  - [ ] AI match preparation
  - [ ] Post-match analysis
  - [ ] Player ratings
  - [ ] Shared insights

---

## **PHASE 3: MONETIZATION** (Settimane 9-12)

### 💳 **Sprint 9: Subscription System** (Settimana 9)
- [ ] **Pricing Pages**
  - [ ] Plan comparison
  - [ ] Feature gates
  - [ ] Upgrade prompts
  - [ ] Team/Assistant limits display
- [ ] **Stripe Integration**
  - [ ] Payment processing
  - [ ] Subscription management
  - [ ] Invoice generation
  - [ ] Payment methods

### 🔒 **Sprint 10: Premium Features** (Settimana 10)
- [ ] **Tier Limitations Enforcement**
  - [ ] Free: 1 team owned, 1 as assistant, 1 vice
  - [ ] Level 1: 2 teams owned, unlimited as assistant, 2 vice
  - [ ] Premium: 2 teams owned, unlimited vice + video
- [ ] **Advanced AI**
  - [ ] Detailed analysis
  - [ ] Custom training programs
  - [ ] Season planning
  - [ ] Video analysis prep

### 📱 **Sprint 11: PWA Enhancement** (Settimana 11)
- [ ] **Offline Support**
  - [ ] Offline attendance
  - [ ] Data sync
  - [ ] Cache management
  - [ ] Multi-team sync
- [ ] **Mobile Optimizations**
  - [ ] Touch gestures
  - [ ] Native features
  - [ ] Push notifications
  - [ ] Install prompts
  - [ ] Team quick switch

### 🚀 **Sprint 12: Launch Prep** (Settimana 12)
- [ ] **Performance**
  - [ ] Image optimization
  - [ ] Code splitting
  - [ ] SEO setup
  - [ ] Analytics integration
- [ ] **Polish**
  - [ ] Error boundaries
  - [ ] Loading states
  - [ ] Empty states
  - [ ] Onboarding tour
  - [ ] Invite flow testing

---

## **PHASE 4: GROWTH** (Post-Launch)

### 🌟 **Month 4: Enhanced Features**
- [ ] Multi-language support
- [ ] Email notifications for assistants
- [ ] Team communication tools
- [ ] Advanced statistics
- [ ] Video integration prep
- [ ] Assistant permissions customization

### 📊 **Month 5: Scale & Optimize**
- [ ] Performance monitoring
- [ ] User feedback integration
- [ ] A/B testing
- [ ] Referral program (bonus vice slots)
- [ ] Content marketing tools
- [ ] Team collaboration features

### 🎮 **Month 6: Gamification**
- [ ] Achievement system
- [ ] Coach leaderboards
- [ ] Player awards
- [ ] Season challenges
- [ ] Community features
- [ ] Team vs Team comparisons

---

## **FUTURE ROADMAP** (Year 2)

### 📱 **Q1 2026: Mobile Apps**
- [ ] React Native setup
- [ ] iOS app development
- [ ] Android app development
- [ ] App store deployment
- [ ] Push notifications
- [ ] Offline-first architecture

### 🎥 **Q2 2026: Video Analysis**
- [ ] VEO integration
- [ ] Video upload
- [ ] AI video analysis
- [ ] Highlight generation
- [ ] Sharing with assistants
- [ ] Player clips

### 🌍 **Q3 2026: Expansion**
- [ ] Multi-language (ES, FR, DE)
- [ ] Federation partnerships
- [ ] API for third parties
- [ ] White-label options
- [ ] Multi-sport templates
- [ ] Coach marketplace

### 🏆 **Q4 2026: Pro Features**
- [ ] Scout network
- [ ] Tournament management
- [ ] Live match tracking
- [ ] Advanced analytics AI
- [ ] Team hierarchies (youth to senior)
- [ ] Multi-club management

---

## **SUCCESS METRICS**

### 📈 **Technical KPIs**
- Page load: <3s
- Uptime: 99.9%
- Mobile score: >90
- Invite acceptance rate: >70%

### 💰 **Business KPIs**
- Month 3: 200 teams
- Month 6: 500 teams
- Month 12: 1000 teams
- Conversion: 15% free→paid
- Assistant adoption: >40%
- Teams per user: 1.5 avg

### 😊 **User KPIs**
- DAU: >30%
- NPS: >50
- Churn: <5%/month
- Feature adoption: >70%
- Assistant engagement: >60%
- Multi-team usage: >25%

---

## **PRIORITY LEGEND**
- 🔴 **Critical**: Core functionality
- 🟡 **Important**: Key differentiators  
- 🟢 **Nice-to-have**: Enhancements
- 🔵 **Future**: Long-term vision

---

## **TEAM & ASSISTANT LIMITS BY TIER**

### 🆓 **FREE Tier**
- **Teams as Owner**: 1
- **Teams as Assistant**: 1 
- **Total Teams**: Max 2
- **Vice Allenatori**: 1 per team
- **Players**: 20 per team
- **AI Requests**: 5/day

### 📊 **LEVEL 1 Tier** 
- **Teams as Owner**: 2
- **Teams as Assistant**: Unlimited
- **Total Teams**: 2 owned + unlimited as assistant
- **Vice Allenatori**: 2 per team
- **Players**: Unlimited per team
- **AI Requests**: 20/day

### 🏆 **PREMIUM Tier**
- **Teams as Owner**: 2
- **Teams as Assistant**: Unlimited
- **Total Teams**: 2 owned + unlimited as assistant
- **Vice Allenatori**: Unlimited per team
- **Players**: Unlimited per team
- **AI Requests**: 100/day
- **Extra**: Video analysis, API access

---

## **DEVELOPMENT PRIORITIES**

### Week 1-2: Foundation
1. Auth system with team limits
2. Team creation with 2-team limit
3. Basic invite system

### Week 3-4: Core Features  
1. Player management with permissions
2. Training creation by owner/assistant
3. Attendance tracking

### Week 5-6: AI Integration
1. GPT-4o mini setup
2. Context-aware responses
3. Rate limiting by tier

### Week 7-8: Polish
1. Analytics dashboard
2. Match management
3. Mobile optimization

### Week 9-12: Monetization
1. Stripe integration
2. Tier enforcement
3. Premium features
4. Launch preparation
