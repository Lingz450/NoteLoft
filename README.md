# NOTELOFT - Student Workspace OS

> Your semester, organized. Notes, tasks, courses, and exams in one place.

A modern web application for university students that combines note-taking, task management, course tracking, and study planning into a single, focused workspace.

## 🎯 Features

- **📝 Smart Notes** - Rich text editor with templates for course notes, exam revision, and more
- **✅ Study Tasks** - Kanban board and table views for assignments and revision
- **📚 Course Management** - Track courses, grades, and GPA in real-time
- **📅 Weekly Schedule** - Visual timetable for lectures, labs, and study blocks
- **📊 Grade Tracking** - Calculate current grades and estimate final scores
- **🎓 Exam Planning** - Never miss an exam with smart reminders
- **🤖 AI Helpers** (Coming Soon) - Summarize notes, generate revision questions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (or use a free cloud database from [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com))

### Installation

1. **Clone and install dependencies:**

```bash
npm install
npm install -D tsx
```

2. **Set up environment variables:**

Create `.env` file:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/noteloft"
```

3. **Initialize database:**

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed with demo data
npx prisma db seed
```

4. **Start development server:**

```bash
npm run dev
```

5. **Open your browser:**

Visit [http://localhost:3000](http://localhost:3000)

You'll be automatically redirected to your demo workspace! 🎉

## 📚 Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Styling:** Tailwind CSS
- **Rich Text:** TipTap Editor
- **State Management:** TanStack Query (React Query)
- **Drag & Drop:** @hello-pangea/dnd

## 🏗️ Project Structure

```
noteloft/
├── app/                    # Next.js App Router pages
│   ├── workspace/          # Workspace routes
│   │   └── [workspaceId]/  # Dynamic workspace pages
│   │       ├── page.tsx    # Dashboard
│   │       ├── tasks/      # Task management
│   │       ├── courses/    # Course management
│   │       ├── schedule/   # Weekly timetable
│   │       ├── exams/      # Exam tracking
│   │       └── pages/      # Notes pages
│   └── api/                # API routes
├── components/             # React components
│   ├── layout/             # Layout components
│   ├── dashboard/          # Dashboard components
│   ├── tasks/              # Task components
│   ├── courses/            # Course components
│   └── common/             # Shared components
├── lib/                    # Utilities
│   ├── db.ts               # Prisma client
│   ├── utils.ts            # Helper functions
│   └── ai.ts               # AI placeholders
└── prisma/                 # Database
    ├── schema.prisma       # Database schema
    └── seed.ts             # Seed data
```

## 📖 Documentation

- **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Complete guide to finish building all features
- **[Prisma Schema](./prisma/schema.prisma)** - Database structure and relationships
- **[API Documentation](./IMPLEMENTATION_GUIDE.md#priority-2-api-routes)** - API endpoints and usage

## 🎯 Current Status

**✅ Completed (60%)**
- Database schema and migrations
- Seed script with demo data
- Workspace layout and navigation
- Semester dashboard
- Grade calculation
- Foundation components

**🚧 In Progress (See Implementation Guide)**
- Tasks management (table + kanban board)
- Courses detailed view
- Weekly schedule grid
- Exams list
- Page editor with TipTap
- Full API routes
- AI integration hooks

## 🔮 Roadmap

### V1 (Demo Mode) - Current
- [x] Single workspace (demo mode)
- [x] Core data models
- [x] Dashboard with overview
- [ ] Complete task management
- [ ] Full CRUD for all entities
- [ ] Rich text page editor

### V2 (Multi-User)
- [ ] User authentication
- [ ] Multiple workspaces per user
- [ ] Workspace sharing
- [ ] User preferences

### V3 (AI Features)
- [ ] AI-powered summarization
- [ ] Auto-extract tasks from notes
- [ ] Generate revision questions
- [ ] Smart study recommendations

### V4 (Advanced)
- [ ] Mobile app
- [ ] Offline support
- [ ] Real-time collaboration
- [ ] Calendar integrations

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

## 📝 License

MIT

## 🙏 Acknowledgments

Built with modern web technologies for students, by understanding the student workflow.

---

**Ready to get started?** Follow the [Implementation Guide](./IMPLEMENTATION_GUIDE.md) to complete the remaining features!


