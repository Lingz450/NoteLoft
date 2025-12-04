# NOTELOFT - Student Workspace OS
## Complete Implementation Guide

This document provides all remaining files and setup instructions to complete your Student OS.

## 🎯 What's Already Built

✅ **Foundation**
- Complete Prisma schema with all entities
- Seed script with demo data
- Database utilities

✅ **Layout & Navigation**
- Root layout with Providers
- Workspace shell with sidebar
- Responsive navigation

✅ **Dashboard**
- Semester dashboard with cards
- Course overview with grades
- Upcoming tasks and exams

✅ **Utilities**
- Common utility functions
- Grade calculation
- Date formatting

✅ **Components**
- Card, Badge, Button (existing)
- Layout components

## 📋 Setup Instructions

### 1. Install Additional Dependencies

You already have most packages. Add `tsx` for running the seed script:

```bash
npm install -D tsx
```

### 2. Set Up Database

Create your `.env` file:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/noteloft"
# Or use a cloud database from Neon.tech or Supabase
```

Run migrations and seed:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the demo workspace dashboard!

## 🚀 Remaining Features to Implement

### Priority 1: Tasks Management (Most Important)

**File: `app/workspace/[workspaceId]/tasks/page.tsx`**

```typescript
import { prisma } from "@/lib/db";
import { TasksView } from "@/components/tasks/TasksView";

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: { workspaceId: string };
  searchParams: { view?: string; course?: string; status?: string };
}) {
  const { workspaceId } = params;
  const view = searchParams.view || "table";

  const [tasks, courses] = await Promise.all([
    prisma.task.findMany({
      where: {
        workspaceId,
        ...(searchParams.course && { courseId: searchParams.course }),
        ...(searchParams.status && { status: searchParams.status as any }),
      },
      include: {
        course: {
          select: { name: true, code: true, color: true },
        },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.course.findMany({
      where: { workspaceId },
      select: { id: true, name: true, code: true, color: true },
    }),
  ]);

  return (
    <TasksView
      workspaceId={workspaceId}
      tasks={tasks}
      courses={courses}
      initialView={view}
    />
  );
}
```

**File: `components/tasks/TasksView.tsx`**

Create a client component with:
- Header with "New Task" button
- View toggle (Table | Board)
- Filter dropdowns (Course, Status)
- TasksTable component when view="table"
- TasksBoard component when view="board"

**File: `components/tasks/TasksTable.tsx`**

Table with columns: Title, Course (badge), Status, Type, Priority, Due Date
Make rows clickable to open edit modal

**File: `components/tasks/TasksBoard.tsx`**

Use `@hello-pangea/dnd` for drag-and-drop kanban:
- Columns: NOT_STARTED, IN_PROGRESS, DONE
- Cards showing task title, course badge, due date
- Drag to update status

### Priority 2: API Routes

**File: `app/api/tasks/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const taskSchema = z.object({
  workspaceId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  courseId: z.string().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]).optional(),
  type: z.enum(["ASSIGNMENT", "REVISION", "READING", "OTHER"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
  dueDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const tasks = await prisma.task.findMany({
    where: { workspaceId },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  return NextResponse.json(task, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

Create similar API routes for:
- `app/api/courses/route.ts`
- `app/api/exams/route.ts`
- `app/api/schedule/route.ts`
- `app/api/assessments/route.ts`

### Priority 3: Courses Management

**File: `app/workspace/[workspaceId]/courses/page.tsx`**

Show list of courses with cards
Link to individual course details

**File: `app/workspace/[workspaceId]/courses/[courseId]/page.tsx`**

Show:
- Course header with code, name, credits
- Assessment items table
- Current grade calculation
- Link to related tasks
- Related pages

### Priority 4: Weekly Schedule

**File: `app/workspace/[workspaceId]/schedule/page.tsx`**

Create a weekly grid:
- Columns for Monday-Sunday
- Rows for time slots (8am-8pm)
- Render timetable slots as colored blocks
- Click to add/edit slots

### Priority 5: Exams List

**File: `app/workspace/[workspaceId]/exams/page.tsx`**

Simple table/list of exams:
- Title, Course, Date, Location, Weight
- Sort by date
- Highlight upcoming (within 7 days)

### Priority 6: Page Editor with TipTap

**File: `app/workspace/[workspaceId]/pages/[pageId]/page.tsx`**

**File: `components/pages/PageEditor.tsx`**

Use TipTap editor (already installed):

```typescript
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";

export function PageEditor({ initialContent, onSave }: any) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem,
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Debounced autosave
      const content = editor.getJSON();
      onSave(content);
    },
  });

  return (
    <div className="prose dark:prose-invert max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
}
```

### Priority 7: AI Placeholder Hooks

**File: `lib/ai.ts`**

```typescript
/**
 * AI Service - Placeholder functions for future AI integration
 * Replace with actual AI API calls when ready
 */

export async function summarizePage(pageContent: any): Promise<string> {
  // TODO: Implement with OpenAI API or similar
  console.log("AI: Summarizing page", pageContent);
  
  return "This is a placeholder summary. The page discusses key concepts from the lecture including vectors, matrices, and linear transformations. Main topics covered: vector spaces, basis vectors, and eigenvalues.";
}

export async function extractTasksFromPage(pageContent: any): Promise<any[]> {
  // TODO: Implement task extraction from page content
  console.log("AI: Extracting tasks from page", pageContent);
  
  return [
    {
      title: "Review chapter 4 problems",
      type: "REVISION",
      priority: "NORMAL",
    },
    {
      title: "Complete practice problems 1-10",
      type: "ASSIGNMENT",
      priority: "HIGH",
    },
  ];
}

export async function generateRevisionQuestions(
  pageContent: any
): Promise<string[]> {
  // TODO: Implement revision question generation
  console.log("AI: Generating revision questions", pageContent);
  
  return [
    "What is the definition of a vector space?",
    "Explain the difference between a basis and a spanning set.",
    "How do you compute eigenvalues of a 2x2 matrix?",
    "What is the geometric interpretation of eigenvectors?",
  ];
}
```

Add buttons in PageEditor that call these functions and display results.

## 📁 Complete Folder Structure

```
noteloft/
├── app/
│   ├── api/
│   │   ├── tasks/route.ts
│   │   ├── courses/route.ts
│   │   ├── exams/route.ts
│   │   ├── schedule/route.ts
│   │   ├── assessments/route.ts
│   │   └── pages/route.ts
│   ├── workspace/
│   │   └── [workspaceId]/
│   │       ├── layout.tsx ✅
│   │       ├── page.tsx ✅ (Dashboard)
│   │       ├── tasks/page.tsx
│   │       ├── courses/
│   │       │   ├── page.tsx
│   │       │   └── [courseId]/page.tsx
│   │       ├── exams/page.tsx
│   │       ├── schedule/page.tsx
│   │       └── pages/
│   │           ├── new/page.tsx
│   │           └── [pageId]/page.tsx
│   ├── layout.tsx ✅
│   ├── page.tsx ✅
│   └── globals.css
├── components/
│   ├── common/
│   │   ├── Providers.tsx ✅
│   │   ├── Card.tsx ✅
│   │   ├── Badge.tsx ✅
│   │   ├── Button.tsx (existing)
│   │   ├── Input.tsx (existing)
│   │   ├── Modal.tsx
│   │   └── Select.tsx
│   ├── layout/
│   │   ├── WorkspaceShell.tsx ✅
│   │   └── Sidebar.tsx ✅
│   ├── dashboard/
│   │   └── SemesterDashboard.tsx ✅
│   ├── tasks/
│   │   ├── TasksView.tsx
│   │   ├── TasksTable.tsx
│   │   ├── TasksBoard.tsx
│   │   └── TaskForm.tsx
│   ├── courses/
│   │   ├── CoursesList.tsx
│   │   ├── CourseCard.tsx
│   │   └── AssessmentTable.tsx
│   ├── schedule/
│   │   └── WeeklySchedule.tsx
│   ├── exams/
│   │   └── ExamsList.tsx
│   └── pages/
│       ├── PageEditor.tsx
│       └── TemplatePicker.tsx
├── lib/
│   ├── db.ts (existing)
│   ├── utils.ts ✅
│   └── ai.ts
├── prisma/
│   ├── schema.prisma ✅
│   └── seed.ts ✅
└── package.json

✅ = Already created
```

## 🎨 Styling Notes

Use Tailwind classes consistently:
- Dark mode: `dark:` variants
- Colors: blue (primary), gray (neutral), red (destructive), green (success)
- Spacing: consistent padding/margins (p-4, p-6, gap-4)
- Borders: `border-gray-200 dark:border-gray-800`
- Backgrounds: `bg-white dark:bg-gray-950`

## 🚀 Next Steps

1. **Run database setup** (migrations + seed)
2. **Implement Tasks page** (highest priority - table + board views)
3. **Create API routes** for CRUD operations
4. **Build Courses management**
5. **Add Schedule view**
6. **Implement Page Editor** with TipTap
7. **Add AI placeholder buttons**

## 💡 Tips

- Use React Query for client-side data fetching
- Keep components small and focused
- Use Zod for validation in API routes
- Leverage existing components (Button, Input, Modal)
- Test each feature incrementally

## 🎯 Success Criteria

You'll know it's working when you can:
- ✅ See the dashboard with courses and tasks
- ✅ Create/edit/delete tasks in table view
- ✅ Drag tasks between columns in board view
- ✅ Add courses and track grades
- ✅ View weekly schedule
- ✅ Edit notes pages with rich text
- ✅ See AI placeholder buttons (even if they return mock data)

---

**You're 60% done!** The foundation is solid. Focus on the tasks management next - it's the heart of the student workflow.


