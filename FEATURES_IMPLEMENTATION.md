# NOTELOFT Advanced Features - Implementation Guide

This document describes all 12 advanced features added to NOTELOFT, their implementation, and how to use them.

## 📋 Table of Contents

1. [Study Runs (Semester Study Plans)](#1-study-runs)
2. [Boss Fight Mode (Gamified Exam Prep)](#2-boss-fight-mode)
3. [Focus Rooms (Shared Focus Sessions)](#3-focus-rooms)
4. [Knowledge Graph (Topics)](#4-knowledge-graph)
5. [Smart Templates Store](#5-smart-templates-store)
6. [AI Study Strategist](#6-ai-study-strategist)
7. [Calendar Sync Helper](#7-calendar-sync-helper)
8. [Micro Journals (Session Reflections)](#8-micro-journals)
9. [Crisis Mode (Burner Mode)](#9-crisis-mode)
10. [Cross-Course Difficulty Heatmap](#10-difficulty-heatmap)
11. [Study Debts Tracker](#11-study-debts-tracker)
12. [Exam Storyboard (War Room)](#12-exam-storyboard)

---

## 1. Study Runs

### Concept
A **Study Run** is a structured multi-week study plan for a course with automatic progress tracking and adaptive targets.

### Database Models

```prisma
model StudyRun {
  id                  String
  workspaceId         String
  courseId            String
  goalType            String  // A_GRADE | PASS | CATCH_UP | CUSTOM
  targetGrade         String?
  goalDescription     String?
  startDate           DateTime
  endDate             DateTime
  preferredDaysPerWeek Int
  minutesPerSession   Int
  isActive            Boolean
  weeks               StudyRunWeek[]
}

model StudyRunWeek {
  id                String
  studyRunId        String
  weekNumber        Int
  startDate         DateTime
  endDate           DateTime
  targetSessions    Int
  targetMinutes     Int
  completedSessions Int
  completedMinutes  Int
  status            String  // PENDING | ON_TRACK | BEHIND | AHEAD | COMPLETED
  suggestedTopics   String? // JSON array
}
```

### Key Files

- **Service**: `lib/services/study-run-generator.ts`
  - `generateStudyRunWeeks()` - Generate weekly breakdown
  - `calculateWeekStatus()` - Determine if week is on track
  - `recalculateStudyRunProgress()` - Update all weeks when sessions change

- **Actions**: `lib/actions/study-runs.ts`
  - `createStudyRun()` - Create run with weeks
  - `updateStudyRunProgress()` - Update when session logged
  - `listStudyRuns()` - Get all runs for workspace
  - `deactivateStudyRun()` - End a study run

- **Hook**: `lib/hooks/useStudyRun.ts`
  - `useStudyRuns(workspaceId, courseId?)` - CRUD operations
  - `useStudyRun(runId)` - Get single run with progress
  - `calculateOverallProgress()` - Compute completion percentage

- **API**: `app/api/study-runs/route.ts`
  - `GET /api/study-runs?workspaceId=X&courseId=Y`
  - `POST /api/study-runs`

- **Components**: `components/study-runs/`
  - `StudyRunCard.tsx` - Dashboard widget showing progress
  - `StudyRunWeekView.tsx` - Week-by-week breakdown
  - `CreateStudyRunModal.tsx` - Form to create new run

### Usage Example

```tsx
// On course page or dashboard
import { useStudyRuns } from "@/lib/hooks/useStudyRun";
import { StudyRunCard } from "@/components/study-runs/StudyRunCard";

function CoursePage({ courseId }) {
  const { list } = useStudyRuns(workspaceId, courseId);
  const activeRun = list.data?.find(r => r.isActive);

  if (activeRun) {
    return (
      <StudyRunCard
        studyRun={activeRun}
        courseName="Linear Algebra"
        courseColor="#3B82F6"
        workspaceId={workspaceId}
      />
    );
  }

  return <button onClick={openCreateModal}>Create Study Run</button>;
}
```

### How It Adapts

1. User creates a study run with goal and preferences
2. System generates weekly targets (sessions, minutes, topics)
3. Each week, user logs study sessions
4. Hook `updateStudyRunProgress()` updates that week's progress
5. Service recalculates all week statuses (BEHIND, ON_TRACK, AHEAD)
6. UI shows visual progress and warnings

---

## 2. Boss Fight Mode

### Concept
Each exam becomes a **Boss** with HP. Study sessions deal damage. Skipping sessions heals the boss. Defeat it before exam date!

### Database Models

```prisma
model BossFight {
  id         String
  examId     String @unique
  name       String
  difficulty String  // EASY | NORMAL | HARD | NIGHTMARE
  maxHP      Int
  currentHP  Int
  status     String  // ALIVE | DEFEATED | ESCAPED
  hits       BossFightHit[]
}

model BossFightHit {
  id          String
  bossFightId String
  sessionId   String?
  damage      Int    // Positive = damage, negative = healing
  description String
}
```

### Key Files

- **Service**: `lib/services/boss-fight-calculator.ts`
  - `calculateMaxHP()` - Boss HP based on exam weight, difficulty, time
  - `calculateSessionDamage()` - Damage from study session
  - `calculateMissedSessionHealing()` - Penalty for skipped sessions
  - `determineBossStatus()` - ALIVE, DEFEATED, or ESCAPED
  - `getBossFlavorText()` - Fun motivational text

- **Actions**: `lib/actions/boss-fights.ts`
  - `createBossFight()` - Initialize boss for an exam
  - `applyBossDamage()` - Log session damage
  - `applyBossHealing()` - Apply penalty for missed session
  - `getBossFight()` - Get boss with hit history

- **Hook**: `lib/hooks/useBossFight.ts`
  - `useBossFights(workspaceId)` - All boss fights
  - `useBossFight(bossFightId)` - Single boss with hits

- **Component**: `components/boss-fights/BossHealthBar.tsx`
  - Visual HP bar with gradient colors
  - Status icons (Shield, Trophy, Skull)
  - Flavor text for motivation

### Usage Example

```tsx
import { useBossFights } from "@/lib/hooks/useBossFight";
import { BossHealthBar } from "@/components/boss-fights/BossHealthBar";

function ExamCard({ exam }) {
  const { list } = useBossFights(workspaceId);
  const boss = list.data?.find(b => b.examId === exam.id);

  if (!boss) {
    return <button onClick={() => createBoss(exam.id, "NORMAL")}>Start Boss Fight</button>;
  }

  return (
    <BossHealthBar
      name={boss.name}
      currentHP={boss.currentHP}
      maxHP={boss.maxHP}
      status={boss.status}
      difficulty={boss.difficulty}
    />
  );
}
```

### Mechanics

- **Damage Calculation**: 1 HP per minute × difficulty factor × consistency bonus
- **Healing**: Missed session heals boss (50% of planned time × difficulty)
- **Victory**: HP reaches 0 before exam date → DEFEATED ✅
- **Defeat**: Exam date passes with HP > 0 → ESCAPED ⚠️

---

## 3. Focus Rooms

### Concept
Shared study rooms where multiple users study together with a synchronized timer, presence bubbles, and reactions.

### Database Models

```prisma
model FocusRoom {
  id             String
  name           String
  status         String  // ACTIVE | PAUSED | ENDED
  timerDuration  Int
  timerStartedAt DateTime?
  participants   FocusRoomParticipant[]
}

model FocusRoomParticipant {
  id              String
  focusRoomId     String
  userId          String?
  displayName     String
  avatarColor     String
  joinedAt        DateTime
  lastSeenAt      DateTime
  currentReaction String?  // "✅", "☕", "😴"
  leftAt          DateTime?
}
```

### Key Files

- **Hook**: `lib/hooks/useFocusRoom.ts`
  - `useFocusRooms()` - List/create rooms
  - `useFocusRoom(roomId, displayName)` - Join room, sync state, send reactions
  - Automatic heartbeat every 10 seconds
  - Real-time polling (2-second interval)

- **Components**: `components/focus-rooms/`
  - `FocusRoomBrowser.tsx` - Browse available rooms
  - `FocusRoomActive.tsx` - In-room view with timer
  - `ParticipantBubbles.tsx` - Show avatars with reactions
  - `ReactionPicker.tsx` - Quick emoji reactions

### Usage Example

```tsx
import { useFocusRoom } from "@/lib/hooks/useFocusRoom";

function FocusRoomView({ roomId }) {
  const { room, join, leave, sendReaction, participantId } = useFocusRoom(roomId, "Student");

  useEffect(() => {
    join.mutate();
    return () => leave.mutate();
  }, []);

  return (
    <div>
      <SharedTimer duration={room.data?.timerDuration} />
      <ParticipantBubbles participants={room.data?.participants || []} />
      <ReactionPicker onReact={(emoji) => sendReaction.mutate(emoji)} />
    </div>
  );
}
```

### Real-Time Strategy

Uses **polling** for simplicity (2-second intervals). Easy to upgrade to WebSockets or Server-Sent Events later:

```tsx
// Current: Polling
refetchInterval: 2000

// Future: Replace with WebSocket
const ws = new WebSocket('ws://...');
ws.onmessage = (event) => updateRoomState(event.data);
```

---

## 4. Knowledge Graph

### Concept
Build a graph of topics linked to tasks, exams, and sessions. Track progress per topic and visualize connections.

### Database Models

```prisma
model Topic {
  id            String
  workspaceId   String
  courseId      String?
  name          String
  description   String?
  parentTopicId String?
  color         String
  childTopics     Topic[]
  taskTopics      TaskTopic[]
  examTopics      ExamTopic[]
  sessionTopics   SessionTopic[]
}

// Join tables
model TaskTopic { taskId, topicId }
model ExamTopic { examId, topicId }
model SessionTopic { sessionId, topicId }
```

### Key Files

- **Hook**: `lib/hooks/useTopics.ts`
  - `list` - Get all topics for workspace/course
  - `create` - Create new topic
  - `update` - Update topic
  - `linkToTask` - Link topic to a task

- **Service**: `lib/services/topic-extractor.ts` (stub for AI)
  - `extractTopicsFromText()` - Future AI integration

- **Components**: `components/topics/`
  - `TopicsList.tsx` - List view with progress
  - `TopicCard.tsx` - Individual topic with completion ring
  - `TopicGraph.tsx` - Network visualization (use react-force-graph or similar)

### Usage Example

```tsx
import { useTopics } from "@/lib/hooks/useTopics";

function CourseTopics({ courseId }) {
  const { list, linkToTask } = useTopics(workspaceId, courseId);

  return (
    <div className="grid grid-cols-3 gap-4">
      {list.data?.map(topic => (
        <TopicCard
          key={topic.id}
          topic={topic}
          progress={calculateTopicProgress(topic)}
        />
      ))}
    </div>
  );
}
```

---

## 5. Smart Templates Store

### Concept
Pre-built "playbooks" that create multiple tasks, pages, and schedule blocks in one click.

### Database Models

```prisma
model Template {
  id          String
  name        String
  category    String  // STUDY_PLAN | PROJECT | REVISION | EXAM_PREP
  description String
  icon        String
  items       TemplateItem[]
}

model TemplateItem {
  id          String
  templateId  String
  itemType    String  // TASK | PAGE | SESSION | SCHEDULE_BLOCK
  title       String
  description String?
  config      String  // JSON
  dayOffset   Int     // Days from application date
}
```

### Key Files

- **Service**: `lib/services/template-applier.ts`
  - `applyTemplate()` - Create all items from template
  - `getTemplates()` - List available templates
  - `seedDefaultTemplates()` - Create default playbooks

- **Components**: `components/templates/`
  - `TemplateGallery.tsx` - Browse templates
  - `ApplyTemplateModal.tsx` - Configuration before applying

### Pre-Built Templates

1. **One Week Catch Up Plan**
   - Creates: 1 page, 3 tasks
   - For: Catching up on missed material

2. **Finals Week Plan**
   - Creates: 1 page, 2 tasks, 1 study block
   - For: Comprehensive finals prep

3. **Group Project Tracker** (can be added)
4. **Crash Revision Weekend** (can be added)

### Usage Example

```tsx
import { applyTemplate } from "@/lib/services/template-applier";

async function handleApplyTemplate(templateId: string) {
  const result = await applyTemplate({
    templateId,
    workspaceId: "demo",
    courseId: "course-123",
    startDate: new Date(),
  });

  console.log(`Created: ${result.tasksCreated} tasks, ${result.pagesCreated} pages`);
}
```

---

## 6. AI Study Strategist

### Concept
AI assistant that understands your full semester context and suggests optimal study focus.

### Key Files

- **Service**: `lib/services/strategy-context.ts`
  - `aggregateStrategyContext()` - Gather workspace data
  - `generateStudyStrategy()` - Generate AI recommendation (stubbed)

- **Hook**: `lib/hooks/useStudyStrategy.ts` (create if needed)

- **Component**: `components/ai/StrategyCard.tsx`
  - Dashboard widget showing "Today's Strategy"

### Context Data Structure

```typescript
type StrategyContext = {
  workspace: { id, name };
  courses: Array<{
    code, name,
    upcomingExams, pendingTasks, recentStudyMinutes
  }>;
  upcomingDeadlines: Array<{
    type: "task" | "exam",
    title, courseCode, dueDate, daysUntil
  }>;
  recentActivity: {
    totalMinutesThisWeek,
    sessionsThisWeek,
    currentStreak
  };
  weakPoints: Array<{
    courseCode, reason
  }>;
}
```

### Usage Example

```tsx
import { aggregateStrategyContext, generateStudyStrategy } from "@/lib/services/strategy-context";

async function getStrategy(workspaceId: string, availableMinutes: number) {
  const context = await aggregateStrategyContext(workspaceId);
  const strategy = await generateStudyStrategy(context, availableMinutes);
  return strategy; // Returns formatted text advice
}
```

### AI Integration

**Current**: Stub function with rule-based logic

**Future**: Replace with OpenAI/Anthropic call:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a study strategist..." },
    { role: "user", content: JSON.stringify(context) },
  ],
});
```

---

## 7. Calendar Sync Helper

### Concept
Sync with Google Calendar to auto-populate class schedule and suggest study blocks.

### Database Models

```prisma
model CalendarSource {
  id           String
  workspaceId  String
  provider     String  // GOOGLE | OUTLOOK | ICAL
  accountEmail String
  isActive     Boolean
  events       CalendarEvent[]
}

model CalendarEvent {
  id               String
  calendarSourceId String
  externalId       String
  title            String
  startTime        DateTime
  endTime          DateTime
  isSynced         Boolean
}
```

### Implementation Strategy

**Phase 1 (Current)**: Stub/Mock

- UI shows "Connect Calendar" button
- Creates placeholder CalendarSource
- Displays mock events

**Phase 2**: Real Google Calendar OAuth

```typescript
// Add to .env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

// OAuth flow
import { google } from 'googleapis';
const oauth2Client = new google.auth.OAuth2(...);
```

**Phase 3**: Sync Logic

```typescript
async function syncCalendarEvents(sourceId: string) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const events = await calendar.events.list({ calendarId: 'primary' });
  
  // Upsert to CalendarEvent model
}
```

---

## 8. Micro Journals

### Concept
Every study session includes a tiny reflection: planned intent and actual outcome.

### Database Extension

```prisma
model StudySession {
  // ... existing fields
  plannedIntent  String?  // What I plan to work on
  actualOutcome  String?  // What I actually did
  mood           String?  // VERY_BAD | BAD | OKAY | GOOD | GREAT
}
```

### UI Flow

1. **Starting Session**:
   ```tsx
   <Input
     label="What do you plan to work on?"
     value={intent}
     onChange={setIntent}
     placeholder="Review chapters 3-4, solve practice problems"
   />
   ```

2. **Ending Session**:
   ```tsx
   <Modal title="How did it go?">
     <Textarea
       label="What did you actually accomplish?"
       value={outcome}
     />
     <MoodSelector
       options={["😔", "😕", "😐", "🙂", "😄"]}
       selected={mood}
       onSelect={setMood}
     />
   </Modal>
   ```

3. **Timeline View**:
   ```tsx
   function SessionTimeline({ courseId }) {
     return sessions.map(s => (
       <div>
         <p>Intent: {s.plannedIntent}</p>
         <p>Outcome: {s.actualOutcome}</p>
         <Badge>{s.mood}</Badge>
       </div>
     ));
   }
   ```

---

## 9. Crisis Mode

### Concept
Simplified, focused UI for overloaded weeks. Shows only urgent items.

### Database Model

```prisma
model WorkspacePreferences {
  workspaceId          String @unique
  crisisModeEnabled    Boolean
  crisisModeStartDate  DateTime?
  crisisModeDays       Int  // Auto-disable after N days
  crisisDaysThreshold  Int  // Show items due within X days
}
```

### Implementation

**Toggle in Settings**:

```tsx
<ToggleSwitch
  checked={preferences.crisisModeEnabled}
  onChange={(val) => updatePreference('crisisModeEnabled', val)}
  label="Crisis Mode"
/>
<p>Simplifies UI and shows only items due within {threshold} days</p>
```

**Effect on Dashboard**:

```tsx
const crisisModeActive = preferences.crisisModeEnabled;
const threshold = preferences.crisisDaysThreshold;

const filteredTasks = crisisModeActive
  ? tasks.filter(t => daysUntil(t.dueDate) <= threshold)
  : tasks;
```

**Banner**:

```tsx
import { CrisisBanner } from "@/components/crisis-mode/CrisisBanner";

{crisisModeActive && (
  <CrisisBanner
    daysRemaining={daysRemaining}
    onDeactivate={handleDeactivate}
  />
)}
```

---

## 10. Difficulty Heatmap

### Concept
Visualize study time per course per day in a heatmap grid.

### Key Files

- **Service**: `lib/services/stats-aggregator.ts`
  - `generateHeatmapData()` - Day × Course matrix
  - `getCourseTimeBreakdown()` - Time per course
  - `getCourseDifficultyAnalysis()` - Hard task analysis
  - `findMostNeglectedCourse()` - Course needing attention

### Stats Page Enhancement

```tsx
import { generateHeatmapData } from "@/lib/services/stats-aggregator";

async function StatsPage({ workspaceId }) {
  const heatmapData = await generateHeatmapData(workspaceId, last30Days, today);

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <h2>Study Time Heatmap</h2>
        <HeatmapGrid data={heatmapData} />
      </Card>

      <Card className="p-6">
        <h3>Most Neglected Course</h3>
        <p>{mostNeglected.courseCode}</p>
        <p>Only {mostNeglected.recentStudyMinutes} min this week</p>
      </Card>
    </div>
  );
}
```

---

## 11. Study Debts Tracker

### Concept
Track missed planned sessions as "debts" that must be repaid.

### Database Models

```prisma
model StudyDebt {
  id               String
  workspaceId      String
  courseId         String?
  durationMinutes  Int
  dueDate          DateTime
  isPaid           Boolean
  paidMinutes      Int
  repayments       DebtRepayment[]
}

model DebtRepayment {
  studyDebtId   String
  sessionId     String
  minutesRepaid Int
}
```

### Key Files

- **Service**: `lib/services/debt-calculator.ts`
  - `createStudyDebt()` - Create debt for missed session
  - `repayStudyDebt()` - Repay full or partial
  - `getStudyDebtSummary()` - Aggregate debts by course

- **Hook**: `lib/hooks/useStudyDebts.ts`
  - `summary` - Total debt summary
  - `list` - All unpaid debts
  - `repay` - Repay debt from session

- **Component**: `components/study-debts/DebtCard.tsx`
  - Dashboard widget showing total debt
  - Orange/red gradient for visual urgency

### Usage Flow

1. **Debt Creation** (automated):
   ```typescript
   // When a planned session is missed
   if (sessionNotCompleted && dateHasPassed) {
     createStudyDebt(workspaceId, courseId, plannedMinutes, dueDate);
   }
   ```

2. **Repayment**:
   ```typescript
   // When user completes a session, optionally apply to debt
   repayStudyDebt(debtId, sessionId, sessionMinutes);
   ```

3. **Dashboard Display**:
   ```tsx
   <DebtCard
     totalDebtMinutes={240}  // 4 hours owed
     debtCount={3}           // 3 missed sessions
     oldestDebtDays={5}      // Oldest debt is 5 days old
   />
   ```

---

## 12. Exam Storyboard

### Concept
Unified "war room" view for each exam with syllabus checklist, past questions, and cheat sheet.

### Database Models

```prisma
model SyllabusItem {
  examId      String
  title       String
  isCompleted Boolean
  position    Int
}

model PastQuestion {
  examId      String
  question    String
  difficulty  String  // EASY | MEDIUM | HARD
  isAttempted Boolean
  isCorrect   Boolean?
  notes       String?
}

model CheatSheetSection {
  examId   String
  title    String
  content  String
  position Int
}
```

### Component Structure

```tsx
// app/workspace/[workspaceId]/exams/[examId]/storyboard/page.tsx

import { StoryboardView } from "@/components/exam-storyboard/StoryboardView";

export default async function ExamStoryboard({ params }) {
  const { examId } = params;

  const [syllabusItems, pastQuestions, cheatSheet] = await Promise.all([
    prisma.syllabusItem.findMany({ where: { examId } }),
    prisma.pastQuestion.findMany({ where: { examId } }),
    prisma.cheatSheetSection.findMany({ where: { examId } }),
  ]);

  return (
    <StoryboardView
      syllabusItems={syllabusItems}
      pastQuestions={pastQuestions}
      cheatSheetSections={cheatSheet}
    />
  );
}
```

### Storyboard Layout

```tsx
export function StoryboardView({ syllabusItems, pastQuestions, cheatSheetSections }) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Column 1: Syllabus */}
      <Card className="p-6">
        <h3>Syllabus Checklist</h3>
        {syllabusItems.map(item => (
          <ChecklistItem
            key={item.id}
            title={item.title}
            isCompleted={item.isCompleted}
            onToggle={() => toggleSyllabusItem(item.id)}
          />
        ))}
      </Card>

      {/* Column 2: Past Questions */}
      <Card className="p-6">
        <h3>Past Questions</h3>
        {pastQuestions.map(q => (
          <QuestionItem
            question={q}
            onAttempt={() => markAttempted(q.id)}
          />
        ))}
      </Card>

      {/* Column 3: Cheat Sheet */}
      <Card className="p-6">
        <h3>Cheat Sheet</h3>
        {cheatSheetSections.map(section => (
          <CheatSheetEditor
            section={section}
            onUpdate={(content) => updateCheatSheet(section.id, content)}
          />
        ))}
      </Card>
    </div>
  );
}
```

---

## 🚀 Next Steps

### 1. Run Database Migration

```bash
pnpm prisma migrate dev --name add_advanced_features
pnpm prisma generate
```

### 2. Add Feature Routes

Create these page files:

- `app/workspace/[workspaceId]/study-runs/page.tsx`
- `app/workspace/[workspaceId]/boss-fights/page.tsx`
- `app/workspace/[workspaceId]/focus-rooms/page.tsx`
- `app/workspace/[workspaceId]/topics/page.tsx`
- `app/workspace/[workspaceId]/study-debts/page.tsx`
- `app/workspace/[workspaceId]/exams/[examId]/storyboard/page.tsx`

### 3. Update Sidebar Navigation

Add links to new features:

```tsx
const newNavItems = [
  { label: "Study Runs", href: `/workspace/${workspaceId}/study-runs`, icon: Target },
  { label: "Boss Fights", href: `/workspace/${workspaceId}/boss-fights`, icon: Swords },
  { label: "Focus Rooms", href: `/workspace/${workspaceId}/focus-rooms`, icon: Users },
  { label: "Topics", href: `/workspace/${workspaceId}/topics`, icon: Network },
];
```

### 4. Integrate Components

Add to dashboard:

```tsx
// In app/workspace/[workspaceId]/page.tsx
import { StudyRunCard } from "@/components/study-runs/StudyRunCard";
import { DebtCard } from "@/components/study-debts/DebtCard";

{activeStudyRun && <StudyRunCard studyRun={activeStudyRun} />}
{debtSummary.debtCount > 0 && <DebtCard {...debtSummary} />}
```

---

## 📝 Code Examples

### Complete Study Run Flow

```typescript
// 1. User creates study run
const { create } = useStudyRuns(workspaceId, courseId);

await create.mutateAsync({
  workspaceId,
  courseId,
  goalType: "A_GRADE",
  targetGrade: "A",
  startDate: new Date(),
  endDate: examDate,
  preferredDaysPerWeek: 4,
  minutesPerSession: 50,
});

// 2. System generates 8 weeks with targets
// 3. User logs a session
await logStudySession({ courseId, duration: 60 });

// 4. System updates week progress
await updateStudyRunProgress(runId, 60, sessionDate);

// 5. UI shows updated status
const run = useStudyRun(runId);
const { percent, status } = calculateOverallProgress(run.data.weeks);
// status = "on_track" | "behind" | "ahead" | "completed"
```

### Complete Boss Fight Flow

```typescript
// 1. Create boss for exam
const { create } = useBossFights(workspaceId);
await create.mutateAsync({ examId, difficulty: "HARD" });

// 2. Study session damages boss
await applyBossDamage(bossFightId, sessionId, 60, isStreak);

// 3. Boss HP decreases
// currentHP = 500 → 450 (60 min × 1.0 efficiency × 0.8 hard difficulty = 48 damage)

// 4. Miss a session
await applyBossHealing(bossFightId, 50);

// 5. Boss heals
// currentHP = 450 → 488 (50 min × 0.5 penalty × 1.5 hard difficulty = 38 healing)

// 6. Check status
const boss = useBossFight(bossFightId);
// boss.status = "ALIVE" | "DEFEATED" | "ESCAPED"
```

---

## 🎨 UI Integration Patterns

### Dashboard Widgets

All features provide dashboard cards that follow the same pattern:

```tsx
<Card className="p-5">
  <div className="flex items-center gap-3 mb-4">
    <FeatureIcon className="w-5 h-5 text-primary" />
    <h3 className="font-bold">Feature Name</h3>
  </div>
  {/* Feature-specific content */}
  <Link href="/details">View more →</Link>
</Card>
```

### Consistency Checklist

- ✅ Uses `Card` component with `p-5` or `p-6` padding
- ✅ Headings are `font-bold`
- ✅ Descriptions are `font-medium`
- ✅ Icons are 20px (`w-5 h-5`)
- ✅ Colors follow theme variables
- ✅ Dark mode support on all elements

---

## 🔌 Extension Points

### Adding Real-Time to Focus Rooms

Replace polling with WebSocket:

```typescript
// lib/realtime/focus-room-socket.ts
export function useFocusRoomSocket(roomId: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3001/focus-room/${roomId}`);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateRoomState(data);
    };
    setWs(socket);
    return () => socket.close();
  }, [roomId]);

  return { ws };
}
```

### Adding Real AI

Replace stubs in strategy-context.ts:

```typescript
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateStudyStrategy(context: StrategyContext, minutes: number) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert study strategist for university students...",
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(context)}\nAvailable: ${minutes} minutes\nWhat should I focus on?`,
      },
    ],
  });

  return response.choices[0].message.content;
}
```

---

## 📦 Installation & Setup

### 1. Migrate Database

```bash
pnpm prisma migrate dev --name add_advanced_features
pnpm prisma generate
```

### 2. Seed Templates

```typescript
import { seedDefaultTemplates } from "@/lib/services/template-applier";
await seedDefaultTemplates();
```

### 3. Test Features

```bash
pnpm dev
# Visit http://localhost:3000/workspace/demo
```

---

## ✅ Implementation Checklist

### Core Infrastructure
- [x] Prisma models for all 12 features
- [x] Enums and types
- [x] Service layer architecture
- [x] Server actions pattern
- [x] React hooks pattern
- [x] Component structure

### Per Feature
- [x] Study Runs: Service + Actions + Hook + Component
- [x] Boss Fight: Service + Actions + Hook + Component
- [x] Focus Rooms: Hook + Component scaffold
- [x] Knowledge Graph: Hook + Service
- [x] Templates: Service + Application logic
- [x] AI Strategist: Service + Context aggregation
- [x] Calendar Sync: Models + Integration points
- [x] Micro Journals: Schema extension
- [x] Crisis Mode: Component + Logic
- [x] Stats Aggregator: Service with heatmap
- [x] Study Debts: Service + Hook + Component
- [x] Exam Storyboard: Models defined

### Remaining Work (Easy to Complete)
- [ ] Create remaining page files
- [ ] Wire up API routes
- [ ] Add navigation links
- [ ] Create full-page UIs
- [ ] Add form validation schemas
- [ ] Write tests

---

## 🎯 Priority Implementation Order

If implementing incrementally, follow this order:

1. **Study Runs** - Core feature, high value
2. **Study Debts** - Natural complement to Study Runs
3. **Boss Fight** - Fun, engaging, unique
4. **Crisis Mode** - Simple, high impact
5. **Micro Journals** - Enhances existing sessions
6. **Topics/Knowledge Graph** - Foundational for other features
7. **AI Strategist** - Ties everything together
8. **Templates** - Quality of life improvement
9. **Stats Heatmap** - Polish & insights
10. **Focus Rooms** - Social feature (requires real-time)
11. **Calendar Sync** - External integration complexity
12. **Exam Storyboard** - Comprehensive but can build over time

---

**All features designed, architected, and ready for full implementation!** 🚀

