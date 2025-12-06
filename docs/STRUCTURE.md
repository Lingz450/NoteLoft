# NOTELOFT Project Structure

## Feature Organization

This document outlines how the new advanced features are organized in the codebase.

```
noteloft/
├── app/
│   ├── workspace/[workspaceId]/
│   │   ├── study-runs/          # Study Runs management
│   │   │   ├── page.tsx         # List all study runs
│   │   │   ├── [runId]/
│   │   │   │   └── page.tsx     # Study run detail & progress
│   │   │   └── new/
│   │   │       └── page.tsx     # Create new study run
│   │   ├── boss-fights/         # Boss Fight Mode
│   │   │   ├── page.tsx         # All boss fights overview
│   │   │   └── [bossId]/
│   │   │       └── page.tsx     # Individual boss fight arena
│   │   ├── focus-rooms/         # Focus Rooms
│   │   │   ├── page.tsx         # Room browser
│   │   │   └── [roomId]/
│   │   │       └── page.tsx     # Active focus room
│   │   ├── topics/              # Knowledge Graph
│   │   │   ├── page.tsx         # Topic overview
│   │   │   └── [topicId]/
│   │   │       └── page.tsx     # Topic detail
│   │   ├── study-debts/         # Study Debts Tracker
│   │   │   └── page.tsx         # Debt management
│   │   └── exams/[examId]/
│   │       └── storyboard/
│   │           └── page.tsx     # Exam Storyboard
│   ├── api/
│   │   ├── study-runs/          # Study Runs API
│   │   │   ├── route.ts
│   │   │   └── [runId]/
│   │   │       └── route.ts
│   │   ├── boss-fights/         # Boss Fight API
│   │   │   ├── route.ts
│   │   │   └── [bossId]/
│   │   │       ├── route.ts
│   │   │       └── hit/
│   │   │           └── route.ts
│   │   ├── focus-rooms/         # Focus Rooms API
│   │   │   ├── route.ts
│   │   │   └── [roomId]/
│   │   │       ├── route.ts
│   │   │       └── participants/
│   │   │           └── route.ts
│   │   ├── topics/              # Topics API
│   │   │   ├── route.ts
│   │   │   └── [topicId]/
│   │   │       └── route.ts
│   │   ├── templates/           # Templates API
│   │   │   ├── route.ts
│   │   │   └── apply/
│   │   │       └── route.ts
│   │   ├── ai/
│   │   │   └── strategist/
│   │   │       └── route.ts     # AI Study Strategist
│   │   ├── calendar/
│   │   │   ├── sync/
│   │   │   │   └── route.ts
│   │   │   └── suggest-blocks/
│   │   │       └── route.ts
│   │   └── study-debts/
│   │       ├── route.ts
│   │       └── [debtId]/
│   │           └── repay/
│   │               └── route.ts
│
├── lib/
│   ├── actions/                 # Server Actions (grouped by feature)
│   │   ├── study-runs.ts        # Study Run server actions
│   │   ├── boss-fights.ts       # Boss Fight server actions
│   │   ├── focus-rooms.ts       # Focus Room server actions
│   │   ├── topics.ts            # Topic/Knowledge Graph actions
│   │   ├── templates.ts         # Template application actions
│   │   ├── ai-strategist.ts     # AI strategy actions
│   │   ├── calendar-sync.ts     # Calendar sync actions
│   │   └── study-debts.ts       # Study debt actions
│   ├── services/                # Business Logic Layer
│   │   ├── study-run-generator.ts    # Generate weekly plans
│   │   ├── boss-fight-calculator.ts  # HP calculations
│   │   ├── focus-room-manager.ts     # Room state management
│   │   ├── topic-extractor.ts        # AI topic extraction (stub)
│   │   ├── template-applier.ts       # Apply templates to workspace
│   │   ├── stats-aggregator.ts       # Stats calculations
│   │   ├── debt-calculator.ts        # Calculate study debts
│   │   └── strategy-context.ts       # Aggregate context for AI
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useStudyRun.ts       # Study run CRUD & progress
│   │   ├── useBossFight.ts      # Boss fight state & actions
│   │   ├── useFocusRoom.ts      # Focus room join/leave/sync
│   │   ├── useTopics.ts         # Topic management
│   │   ├── useTemplates.ts      # Template browsing & application
│   │   ├── useStudyDebts.ts     # Debt tracking
│   │   ├── useCalendarSync.ts   # Calendar connection
│   │   └── useStudyStrategy.ts  # AI strategist integration
│   ├── validation/              # Zod Schemas
│   │   ├── study-runs.ts
│   │   ├── boss-fights.ts
│   │   ├── focus-rooms.ts
│   │   ├── topics.ts
│   │   ├── templates.ts
│   │   ├── study-debts.ts
│   │   └── calendar.ts
│   └── constants/
│       └── enums.ts             # All enum values (updated)
│
├── components/
│   ├── study-runs/              # Study Runs Components
│   │   ├── StudyRunCard.tsx     # Dashboard widget
│   │   ├── StudyRunList.tsx     # List view
│   │   ├── StudyRunWeekView.tsx # Weekly breakdown
│   │   ├── CreateStudyRunModal.tsx
│   │   └── WeekProgressBar.tsx
│   ├── boss-fights/             # Boss Fight Components
│   │   ├── BossCard.tsx         # Boss status widget
│   │   ├── BossArena.tsx        # Full boss fight view
│   │   ├── BossHealthBar.tsx    # HP indicator
│   │   └── BossHitLog.tsx       # Recent hits/heals
│   ├── focus-rooms/             # Focus Room Components
│   │   ├── FocusRoomBrowser.tsx # Available rooms
│   │   ├── FocusRoomActive.tsx  # In-room view
│   │   ├── ParticipantBubbles.tsx
│   │   └── ReactionPicker.tsx
│   ├── topics/                  # Knowledge Graph Components
│   │   ├── TopicsList.tsx       # Topic list view
│   │   ├── TopicCard.tsx        # Individual topic card
│   │   ├── TopicGraph.tsx       # Network visualization
│   │   └── TopicProgressRing.tsx
│   ├── templates/               # Template Components
│   │   ├── TemplateGallery.tsx  # Browse templates
│   │   ├── TemplateCard.tsx     # Template preview card
│   │   ├── ApplyTemplateModal.tsx
│   │   └── TemplatePreview.tsx
│   ├── ai/                      # AI Components
│   │   ├── StrategyCard.tsx     # "Today's strategy" widget
│   │   └── StrategyPanel.tsx    # Full AI strategist panel
│   ├── study-debts/             # Study Debt Components
│   │   ├── DebtCard.tsx         # Dashboard debt summary
│   │   ├── DebtList.tsx         # All debts view
│   │   └── RepayDebtModal.tsx
│   ├── exam-storyboard/         # Exam Storyboard Components
│   │   ├── StoryboardView.tsx   # Main storyboard layout
│   │   ├── SyllabusChecklist.tsx
│   │   ├── PastQuestionsList.tsx
│   │   └── CheatSheetEditor.tsx
│   └── crisis-mode/             # Crisis Mode Components
│       ├── CrisisBanner.tsx     # Top banner when active
│       └── CrisisToggle.tsx     # Settings toggle
│
└── prisma/
    └── schema.prisma            # Updated with all new models
```

## Data Flow Architecture

### Layer Separation

```
┌─────────────────────────────────────────┐
│         UI Components (React)           │
│  study-runs/, boss-fights/, topics/...  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Custom Hooks (Client Logic)       │
│  useStudyRun, useBossFight, useTopics   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      API Routes / Server Actions        │
│    /api/study-runs, /api/boss-fights    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Business Logic (Services)          │
│  study-run-generator, boss-calculator   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Database (Prisma + SQLite)         │
│  StudyRun, BossFight, Topic models...   │
└─────────────────────────────────────────┘
```

## Feature Dependencies

- **Study Runs** → Uses Course, StudySession
- **Boss Fight** → Uses Exam, StudySession
- **Focus Rooms** → Standalone, can integrate with StudySession
- **Knowledge Graph** → Links to Task, Exam, StudySession, Course
- **Templates** → Creates Task, Page, TimetableSlot instances
- **AI Strategist** → Reads from all models, provides suggestions
- **Calendar Sync** → Creates/updates TimetableSlot
- **Micro Journals** → Extends StudySession
- **Crisis Mode** → Filters Task, Exam by date
- **Study Debts** → Tracks missed StudyRun sessions
- **Exam Storyboard** → Aggregates Exam, Topic, Question data

## Module Naming Conventions

- **Models**: PascalCase singular (e.g., `StudyRun`, `BossFight`)
- **Server Actions**: kebab-case filename, camelCase functions
- **Services**: kebab-case filename, descriptive class or function names
- **Hooks**: camelCase starting with "use"
- **Components**: PascalCase
- **API Routes**: kebab-case folders

