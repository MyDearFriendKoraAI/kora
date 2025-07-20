# 🏗️ **ARCHITETTURA TECNICA KORA - DEVELOPER HANDOFF**

## **1. TECH STACK OVERVIEW**

### 1.1 Frontend Stack
```javascript
// Web App (Progressive Web App)
{
  "framework": "Next.js 14+ (App Router)",
  "ui_library": "React 18+",
  "styling": "Tailwind CSS 3.4+",
  "state_management": "Zustand",
  "forms": "React Hook Form + Zod",
  "api_client": "TanStack Query (React Query)",
  "animations": "Framer Motion",
  "pwa": "next-pwa",
  "typescript": "5.0+"
}

// Mobile App (Future - React Native)
{
  "framework": "React Native 0.73+",
  "navigation": "React Navigation 6",
  "state": "Zustand",
  "ui": "NativeWind (Tailwind for RN)",
  "expo": "SDK 50+"
}
```

### 1.2 Backend Stack
```javascript
{
  "database": "Supabase (PostgreSQL)",
  "orm": "Prisma ORM",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage", 
  "realtime": "Supabase Realtime",
  "edge_functions": "Supabase Edge Functions",
  "ai": "OpenAI GPT-4o mini (fallback: Claude 3 Haiku)",
  "email": "Resend",
  "monitoring": "Sentry",
  "deployment": "Vercel (frontend) + Supabase (backend)"
}
```

---

## **2. PROJECT STRUCTURE**

### 2.1 Simplified Structure (Vercel + Supabase)
```bash
kora/
├── app/                       # Next.js App Router
│   ├── (auth)/               # Auth pages
│   ├── (dashboard)/          # Protected pages
│   ├── api/                  # API routes (if needed)
│   └── layout.tsx            # Root layout
│
├── components/               # React components
│   ├── ui/                  # Base UI components
│   ├── features/            # Feature components
│   └── layouts/             # Layout components
│
├── lib/                      # Utilities
│   ├── supabase/           # Supabase client
│   ├── openai/             # GPT-4o mini client
│   └── utils/              # Helpers
│
├── hooks/                    # Custom React hooks
├── stores/                   # Zustand stores
├── types/                    # TypeScript types
├── prisma/                   # Database schema
│   └── schema.prisma
│
├── public/                   # Static assets
├── styles/                   # Global styles
│
├── .env.local               # Environment variables
├── next.config.js           # Next.js config
├── tailwind.config.js       # Tailwind config
└── package.json
```

---

## **3. DATABASE SCHEMA (PRISMA) - UPDATED**

### 3.1 Core Models
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Management - UPDATED
model User {
  id               String    @id @default(cuid())
  email           String    @unique
  password        String
  firstName       String
  lastName        String
  role            UserRole  @default(COACH)
  subscriptionTier Tier     @default(FREE)
  emailVerified   Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  ownedTeams      Team[]    @relation("TeamOwner")
  assistantTeams  TeamAssistant[]
  conversations   Conversation[]
  subscription    Subscription?
  invitesSent     TeamInvite[] @relation("InviteSender")
  invitesReceived TeamInvite[] @relation("InviteRecipient")
}

enum UserRole {
  COACH
  ASSISTANT
  ADMIN
}

enum Tier {
  FREE
  LEVEL1
  PREMIUM
}

// Team Management - UPDATED
model Team {
  id          String    @id @default(cuid())
  name        String
  sport       Sport
  category    String    // "U14", "Prima Squadra", etc
  season      String    // "2024/2025"
  homeField   String?
  colors      Json?     // { primary: "#color", secondary: "#color" }
  logo        String?   // S3 URL
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  ownerId     String
  owner       User      @relation("TeamOwner", fields: [ownerId], references: [id])
  assistants  TeamAssistant[]
  players     Player[]
  trainings   Training[]
  matches     Match[]
  invites     TeamInvite[]
  
  @@index([ownerId])
}

// NEW: Team Assistant Relationship
model TeamAssistant {
  id          String    @id @default(cuid())
  joinedAt    DateTime  @default(now())
  permissions Json      @default("{}") // Extensible permissions
  
  // Relations
  teamId      String
  team        Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  @@unique([teamId, userId])
  @@index([userId])
}

// NEW: Team Invites
model TeamInvite {
  id          String    @id @default(cuid())
  email       String
  role        TeamRole  @default(ASSISTANT)
  status      InviteStatus @default(PENDING)
  token       String    @unique @default(cuid())
  expiresAt   DateTime
  invitedAt   DateTime  @default(now())
  acceptedAt  DateTime?
  
  // Relations
  teamId      String
  team        Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  inviterId   String
  inviter     User      @relation("InviteSender", fields: [inviterId], references: [id])
  inviteeId   String?
  invitee     User?     @relation("InviteRecipient", fields: [inviteeId], references: [id])
  
  @@index([email])
  @@index([teamId])
  @@index([token])
}

enum TeamRole {
  ASSISTANT
}

enum InviteStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
  CANCELLED
}

enum Sport {
  SOCCER
  BASKETBALL
  VOLLEYBALL
  RUGBY
  TENNIS
  OTHER
}

// Player Management
model Player {
  id              String    @id @default(cuid())
  firstName       String
  lastName        String
  dateOfBirth     DateTime
  position        String
  jerseyNumber    Int?
  photo           String?   // S3 URL
  medicalNotes    String?
  parentEmail     String?
  parentPhone     String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  teamId          String
  team            Team      @relation(fields: [teamId], references: [id])
  attendances     Attendance[]
  stats           PlayerStats[]
  
  @@index([teamId])
}

// Training Management
model Training {
  id              String    @id @default(cuid())
  date            DateTime
  duration        Int       // minutes
  location        String
  type            TrainingType
  focus           String[]  // ["tecnica", "tattica", "fisico"]
  plan            Json      // Structured training plan
  notes           String?
  completed       Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String    // userId of creator (owner or assistant)
  
  // Relations
  teamId          String
  team            Team      @relation(fields: [teamId], references: [id])
  attendances     Attendance[]
  
  @@index([teamId, date])
}

enum TrainingType {
  REGULAR
  MATCH_PREP
  RECOVERY
  TACTICAL
  TECHNICAL
  PHYSICAL
}

// Attendance Tracking
model Attendance {
  id              String    @id @default(cuid())
  status          AttendanceStatus
  arrivedLate     Boolean   @default(false)
  leftEarly       Boolean   @default(false)
  notes           String?
  markedBy        String    // userId of who marked attendance
  
  // Relations
  playerId        String
  player          Player    @relation(fields: [playerId], references: [id])
  trainingId      String
  training        Training  @relation(fields: [trainingId], references: [id])
  
  @@unique([playerId, trainingId])
  @@index([trainingId])
}

enum AttendanceStatus {
  PRESENT
  ABSENT_JUSTIFIED
  ABSENT_UNJUSTIFIED
  INJURED
}

// Match Management
model Match {
  id              String    @id @default(cuid())
  date            DateTime
  opponent        String
  isHome          Boolean
  location        String
  result          String?   // "2-1", "W", "L", "D"
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  teamId          String
  team            Team      @relation(fields: [teamId], references: [id])
  
  @@index([teamId, date])
}

// Player Statistics
model PlayerStats {
  id              String    @id @default(cuid())
  matchId         String?
  trainingId      String?
  goals           Int       @default(0)
  assists         Int       @default(0)
  minutesPlayed   Int       @default(0)
  rating          Float?    // 1-10
  notes           String?
  
  // Relations
  playerId        String
  player          Player    @relation(fields: [playerId], references: [id])
  
  @@index([playerId])
}

// AI Integration
model Conversation {
  id              String    @id @default(cuid())
  title           String?
  context         Json      // Team info, recent performance, etc
  messages        Json      // Array of messages
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  @@index([userId])
}

// Subscription Management
model Subscription {
  id              String    @id @default(cuid())
  stripeCustomerId String?
  stripePriceId   String?
  status          SubscriptionStatus
  currentPeriodEnd DateTime?
  cancelAtPeriodEnd Boolean @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  UNPAID
  TRIALING
}
```

---

## **4. API IMPLEMENTATION WITH SUPABASE - UPDATED**

### 4.1 Team Assistant API Routes
```typescript
// app/api/teams/[teamId]/assistants/invite/route.ts
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendInviteEmail } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const { email } = body
  
  // Verify user owns the team
  const team = await prisma.team.findFirst({
    where: { 
      id: params.teamId,
      ownerId: user.id
    }
  })
  
  if (!team) {
    return Response.json({ error: 'Team not found or unauthorized' }, { status: 404 })
  }
  
  // Check team limits based on owner's tier
  const owner = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      ownedTeams: true,
      assistantTeams: true
    }
  })
  
  const assistantCount = await prisma.teamAssistant.count({
    where: { teamId: params.teamId }
  })
  
  const limits = {
    FREE: 1,
    LEVEL1: 2,
    PREMIUM: 999
  }
  
  if (assistantCount >= limits[owner!.subscriptionTier]) {
    return Response.json({ 
      error: 'Limite vice allenatori raggiunto per il tuo piano' 
    }, { status: 403 })
  }
  
  // Create invite
  const invite = await prisma.teamInvite.create({
    data: {
      email,
      teamId: params.teamId,
      inviterId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    include: {
      team: true,
      inviter: true
    }
  })
  
  // Send invite email
  await sendInviteEmail({
    to: email,
    inviterName: `${invite.inviter.firstName} ${invite.inviter.lastName}`,
    teamName: invite.team.name,
    inviteToken: invite.token
  })
  
  return Response.json({ invite }, { status: 201 })
}

// app/api/invites/[inviteToken]/accept/route.ts
export async function POST(
  request: Request,
  { params }: { params: { inviteToken: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const invite = await prisma.teamInvite.findUnique({
    where: { 
      token: params.inviteToken,
      status: 'PENDING'
    },
    include: { team: true }
  })
  
  if (!invite || invite.expiresAt < new Date()) {
    return Response.json({ error: 'Invito non valido o scaduto' }, { status: 400 })
  }
  
  // Check if user can accept (team limits)
  const userWithTeams = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      ownedTeams: true,
      assistantTeams: true
    }
  })
  
  const totalTeams = userWithTeams!.ownedTeams.length + userWithTeams!.assistantTeams.length
  
  if (userWithTeams!.subscriptionTier === 'FREE' && totalTeams >= 2) {
    return Response.json({ 
      error: 'Hai raggiunto il limite di squadre per il piano Free' 
    }, { status: 403 })
  }
  
  // Accept invite in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update invite
    await tx.teamInvite.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        inviteeId: user.id
      }
    })
    
    // Create assistant relationship
    const assistant = await tx.teamAssistant.create({
      data: {
        teamId: invite.teamId,
        userId: user.id,
        permissions: {
          canManagePlayers: true,
          canManageTrainings: true,
          canMarkAttendance: true,
          canViewStats: true
        }
      }
    })
    
    return assistant
  })
  
  return Response.json({ 
    message: 'Invito accettato con successo',
    teamId: invite.teamId 
  })
}
```

### 4.2 Middleware for Team Access
```typescript
// middleware/teamAccess.ts
export async function canAccessTeam(
  userId: string, 
  teamId: string
): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      OR: [
        { ownerId: userId },
        { assistants: { some: { userId } } }
      ]
    }
  })
  
  return !!team
}

export async function getTeamRole(
  userId: string,
  teamId: string
): Promise<'owner' | 'assistant' | null> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      assistants: {
        where: { userId }
      }
    }
  })
  
  if (!team) return null
  if (team.ownerId === userId) return 'owner'
  if (team.assistants.length > 0) return 'assistant'
  return null
}
```

---

## **5. FRONTEND IMPLEMENTATION GUIDE - UPDATED**

### 5.1 Team Switcher Component
```typescript
// components/features/TeamSwitcher.tsx
export function TeamSwitcher() {
  const { teams, currentTeam, setCurrentTeam } = useTeamStore()
  const [isOpen, setIsOpen] = useState(false)
  
  const userTeams = teams.filter(t => 
    t.role === 'owner' || t.role === 'assistant'
  ).slice(0, 2) // Max 2 teams enforced
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <TeamIcon className="w-4 h-4" />
            <span className="font-medium">{currentTeam?.name}</span>
            {currentTeam?.role === 'assistant' && (
              <Badge variant="secondary" className="text-xs">Vice</Badge>
            )}
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-2">
        <div className="space-y-1">
          {userTeams.map((team) => (
            <button
              key={team.id}
              onClick={() => {
                setCurrentTeam(team.id)
                setIsOpen(false)
              }}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100",
                currentTeam?.id === team.id && "bg-gray-100"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  team.sport === 'SOCCER' && "bg-green-500",
                  team.sport === 'BASKETBALL' && "bg-orange-500"
                )} />
                <span className="font-medium">{team.name}</span>
              </div>
              {team.role === 'assistant' && (
                <Badge variant="outline" className="text-xs">Vice</Badge>
              )}
            </button>
          ))}
          
          {userTeams.length < 2 && (
            <button
              onClick={() => router.push('/teams/new')}
              className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 text-gray-600"
            >
              <Plus className="w-4 h-4" />
              <span>Crea nuova squadra</span>
            </button>
          )}
        </div>
        
        {userTeams.length >= 2 && (
          <p className="text-xs text-gray-500 mt-2 px-2">
            Hai raggiunto il limite di 2 squadre
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
```

### 5.2 Invite Assistant Flow
```typescript
// components/features/InviteAssistant.tsx
export function InviteAssistantModal({ teamId, isOpen, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  
  const canInvite = useMemo(() => {
    const limits = {
      FREE: 1,
      LEVEL1: 2,
      PREMIUM: 999
    }
    const currentAssistants = team?.assistants?.length || 0
    return currentAssistants < limits[user?.tier || 'FREE']
  }, [team, user])
  
  const handleInvite = async () => {
    if (!canInvite) {
      toast.error('Hai raggiunto il limite di vice allenatori per il tuo piano')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/assistants/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (!response.ok) throw new Error()
      
      toast.success('Invito inviato con successo!')
      onClose()
    } catch (error) {
      toast.error('Errore nell\'invio dell\'invito')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invita Vice Allenatore</DialogTitle>
          <DialogDescription>
            Invita un collaboratore ad aiutarti nella gestione della squadra
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email del vice allenatore</Label>
            <Input
              id="email"
              type="email"
              placeholder="vice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {!canInvite && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Hai raggiunto il limite di vice allenatori per il tuo piano.
                <Link href="/pricing" className="underline ml-1">
                  Aggiorna il piano
                </Link>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <h4 className="font-medium mb-2">Il vice allenatore potrà:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>✓ Gestire giocatori e presenze</li>
              <li>✓ Creare e modificare allenamenti</li>
              <li>✓ Accedere alle statistiche</li>
              <li>✓ Utilizzare l'AI Coach</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button 
            onClick={handleInvite} 
            loading={loading}
            disabled={!email || !canInvite}
          >
            Invia Invito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 5.3 Team Management Page
```typescript
// app/dashboard/teams/[teamId]/settings/page.tsx
export default function TeamSettingsPage({ params }: { params: { teamId: string } }) {
  const { team, role } = useTeam(params.teamId)
  const [assistants, setAssistants] = useState<TeamAssistant[]>([])
  
  // Only owner can manage assistants
  const canManageAssistants = role === 'owner'
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Impostazioni Squadra</h1>
        <p className="text-gray-600">Gestisci i dettagli e i collaboratori della squadra</p>
      </div>
      
      {/* Team Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dettagli Squadra</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Team edit form */}
        </CardContent>
      </Card>
      
      {/* Assistants Section - Only visible to owner */}
      {canManageAssistants && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Vice Allenatori</CardTitle>
                <CardDescription>
                  {assistants.length} di {getLimitForTier(user?.tier)} vice allenatori
                </CardDescription>
              </div>
              <Button 
                onClick={() => setInviteModalOpen(true)}
                disabled={assistants.length >= getLimitForTier(user?.tier)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invita Vice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assistants.map((assistant) => (
                <div key={assistant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {assistant.user.firstName[0]}{assistant.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {assistant.user.firstName} {assistant.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{assistant.user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAssistant(assistant.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {assistants.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nessun vice allenatore. Invitane uno per collaborare!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

---

## **6. MOBILE-FIRST RESPONSIVE DESIGN - UPDATED**

### 6.1 Responsive Team Card
```typescript
// components/TeamCard.tsx
export function TeamCard({ team, role }: { team: Team, role: 'owner' | 'assistant' }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 
                    hover:shadow-md transition-all cursor-pointer
                    // Mobile first approach
                    space-y-3">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            "bg-gradient-to-br",
            team.sport === 'SOCCER' && "from-green-500 to-green-600",
            team.sport === 'BASKETBALL' && "from-orange-500 to-orange-600"
          )}>
            <SportIcon sport={team.sport} className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-500">{team.category} • {team.season}</p>
          </div>
        </div>
        
        {role === 'assistant' && (
          <Badge variant="secondary" className="shrink-0">Vice</Badge>
        )}
      </div>
      
      {/* Stats - Grid on mobile, flex on tablet+ */}
      <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-6">
        <Stat 
          icon={<Users className="w-4 h-4" />}
          label="Giocatori" 
          value={team.playerCount} 
        />
        <Stat 
          icon={<Calendar className="w-4 h-4" />}
          label="Prossimo" 
          value="Oggi 18:30" 
        />
        <Stat 
          icon={<TrendingUp className="w-4 h-4" />}
          label="Presenze" 
          value="85%" 
          className="col-span-2 sm:col-span-1"
        />
      </div>
      
      {/* Assistant info - Only on larger screens */}
      {team.assistants?.length > 0 && (
        <div className="hidden sm:flex items-center gap-2 pt-2 border-t">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {team.assistants.length} vice allenator{team.assistants.length > 1 ? 'i' : 'e'}
          </span>
        </div>
      )}
    </div>
  );
}
```

---

## **7. SECURITY & PERMISSIONS**

### 7.1 Row Level Security (RLS) Policies
```sql
-- Supabase RLS Policies

-- Teams: Users can only see teams they own or are assistants of
CREATE POLICY "Users can view their teams" ON teams
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_assistants 
      WHERE team_assistants.team_id = teams.id 
      AND team_assistants.user_id = auth.uid()
    )
  );

-- Teams: Only owners can update their teams
CREATE POLICY "Owners can update their teams" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

-- Teams: Users can create teams (with limit check in function)
CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (
    owner_id = auth.uid() AND
    (SELECT COUNT(*) FROM teams WHERE owner_id = auth.uid()) < 2
  );

-- Team Assistants: Only team owners can manage assistants
CREATE POLICY "Owners can manage assistants" ON team_assistants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_assistants.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

-- Players: Owners and assistants can manage players
CREATE POLICY "Team members can manage players" ON players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = players.team_id 
      AND (
        teams.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_assistants 
          WHERE team_assistants.team_id = teams.id 
          AND team_assistants.user_id = auth.uid()
        )
      )
    )
  );
```

### 7.2 Permission Helpers
```typescript
// lib/permissions.ts
export const teamPermissions = {
  canEditTeam: (role: 'owner' | 'assistant') => role === 'owner',
  canInviteAssistants: (role: 'owner' | 'assistant') => role === 'owner',
  canRemoveAssistants: (role: 'owner' | 'assistant') => role === 'owner',
  canDeleteTeam: (role: 'owner' | 'assistant') => role === 'owner',
  canManagePlayers: (role: 'owner' | 'assistant') => true,
  canManageTrainings: (role: 'owner' | 'assistant') => true,
  canMarkAttendance: (role: 'owner' | 'assistant') => true,
  canViewStats: (role: 'owner' | 'assistant') => true,
  canExportData: (role: 'owner' | 'assistant') => role === 'owner',
}

// Hook for permissions
export function useTeamPermissions(teamId: string) {
  const { role } = useTeamRole(teamId)
  
  return useMemo(() => {
    if (!role) return null
    
    return Object.entries(teamPermissions).reduce((acc, [key, fn]) => {
      acc[key] = fn(role)
      return acc
    }, {} as Record<string, boolean>)
  }, [role])
}
```

---

## **8. API ENDPOINTS SUMMARY**

### 8.1 Team Management
```typescript
// Team CRUD
GET    /api/teams                    // List user's teams (owned + assistant)
POST   /api/teams                    // Create new team (max 2)
GET    /api/teams/:id               // Get team details
PUT    /api/teams/:id               // Update team (owner only)
DELETE /api/teams/:id               // Delete team (owner only)

// Assistant Management
GET    /api/teams/:id/assistants    // List team assistants
POST   /api/teams/:id/assistants/invite  // Invite assistant (owner only)
DELETE /api/teams/:id/assistants/:assistantId  // Remove assistant (owner only)

// Invites
GET    /api/user/invites            // List pending invites for user
POST   /api/invites/:token/accept   // Accept invite
POST   /api/invites/:token/decline  // Decline invite
DELETE /api/invites/:id            // Cancel invite (inviter only)
```

### 8.2 Rate Limiting by Tier
```typescript
// middleware/rateLimits.ts
export const tierLimits = {
  teams: {
    FREE: { owned: 1, assistant: 1 },
    LEVEL1: { owned: 2, assistant: Infinity },
    PREMIUM: { owned: 2, assistant: Infinity }
  },
  assistants: {
    FREE: 1,
    LEVEL1: 2,
    PREMIUM: Infinity
  },
  ai_requests: {
    FREE: { daily: 5 },
    LEVEL1: { daily: 20 },
    PREMIUM: { daily: 100 }
  }
}
```

---

## **CONCLUSION**

Questa architettura aggiornata include:

1. **Sistema completo di inviti** per Vice Allenatori
2. **Gestione permessi** granulare per owner/assistant
3. **Limiti per tier** di abbonamento
4. **Sicurezza** con RLS policies
5. **UI/UX ottimizzata** per la gestione multi-ruolo
6. **API robuste** per tutte le operazioni

Il sistema è progettato per essere scalabile e sicuro, con chiare separazioni di responsabilità tra proprietari e vice allenatori.