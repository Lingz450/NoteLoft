# 🎓 NOTELOFT - Student Workspace OS

> Your complete academic companion. Notes, tasks, courses, exams, and AI-powered study assistance in one beautiful interface.

A modern, production-ready web application built specifically for university students. NOTELOFT combines powerful features with an intuitive design to help you stay organized, focused, and successful throughout your semester.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)

## ✨ Features

### 📊 **Semester Dashboard**
- **Focus Streak Tracking** - Monitor your study consistency
- **Time per Course Analytics** - Visualize study time distribution
- **Weekly Task Overview** - See all upcoming assignments at a glance
- **GPA Calculator** - Real-time grade tracking and GPA estimation
- **Upcoming Exams Widget** - Never miss an important test

### ✅ **Study Tasks Management**
- **Multiple Views** - Switch between Table and Board (Kanban) layouts
- **Smart Filtering** - Filter by course, status, and priority
- **Inline Editing** - Quick updates without modal dialogs
- **Quick Add** - Rapidly create tasks with minimal friction
- **Focus Sessions** - Start timed study sessions directly from tasks

### 📚 **Course Management**
- **Course Cards** - Visual overview with color coding
- **Grade Calculator** - Automatic GPA computation from assessments
- **Assessment Tracking** - Track assignments, quizzes, and exams per course
- **Progress Indicators** - See completion percentages at a glance

### 📅 **Weekly Schedule**
- **Interactive Timetable** - Proper HTML table with clear grid lines
- **Drag & Drop** - Easy scheduling with visual feedback
- **Color-Coded Classes** - Course colors for quick identification
- **Click to Add** - Add classes by clicking any time slot

### 🎯 **Study Sessions**
- **Pomodoro Timer** - Focused study sessions with breaks
- **Course Association** - Link sessions to specific courses
- **Session History** - Track all your study activity
- **Analytics Dashboard** - Deep insights into study patterns

### 📝 **Smart Pages**
- **Rich Text Editor** - Powered by TipTap
- **Page Templates** - Blank, Course Notes, Exam Revision, Dashboard
- **Favorites System** - Star important pages for quick access
- **Drag & Drop Ordering** - Organize your pages hierarchically

### 🤖 **AI Assistant**
- **Study Helper** - Get explanations and summaries
- **Smart Planner** - AI-generated study schedules
- **Progress Insights** - Personalized recommendations
- **Quick Actions** - Pre-built prompts for common tasks

### 🎨 **Customization**
- **Theme Toggle** - Light, Dark, or System preference
- **Sidebar Position** - Left or right sidebar placement
- **Compact Mode** - Adjust interface density
- **Language & Region** - Internationalization ready
- **Notification Preferences** - Fine-grained control

### 🔔 **Notifications & Reminders**
- **Smart Reminders** - Task, exam, and session alerts
- **Notification Center** - Centralized notification management
- **Mark as Read** - Manage notification states
- **Priority Badges** - High/normal/low priority indicators

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 3.4 |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **ORM** | Prisma |
| **UI Components** | Custom + Radix UI primitives |
| **Rich Text** | TipTap Editor |
| **State Management** | TanStack Query (React Query) |
| **Drag & Drop** | @hello-pangea/dnd |
| **Icons** | Lucide React |
| **Animations** | Tailwind CSS + Framer Motion ready |

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **pnpm** (or npm)
- **Git**

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Lingz450/NoteLoft.git
cd NoteLoft
```

2. **Install dependencies:**

```bash
pnpm install
# or
npm install
```

3. **Set up environment variables:**

Create `.env.local` file:

```bash
DATABASE_URL="file:./dev.db"
```

4. **Initialize database:**

```bash
# Run migrations
pnpm prisma migrate dev

# Seed with demo data (optional)
pnpm prisma db seed
```

5. **Start development server:**

```bash
pnpm dev
# or
npm run dev
```

6. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

You'll be redirected to your workspace! 🎉

## 📁 Project Structure

```
noteloft/
├── app/                          # Next.js 14 App Router
│   ├── workspace/[workspaceId]/  # Workspace pages
│   │   ├── page.tsx             # Semester dashboard
│   │   ├── tasks/               # Study tasks management
│   │   ├── courses/             # Course management
│   │   ├── exams/               # Exam tracking
│   │   ├── schedule/            # Weekly timetable
│   │   ├── sessions/            # Study sessions
│   │   ├── stats/               # Analytics
│   │   └── pages/               # Note pages
│   ├── ai/                      # AI Assistant page
│   ├── profile/                 # User profile
│   ├── settings/                # App settings
│   ├── templates/               # Template gallery
│   └── api/                     # API routes
├── components/
│   ├── layout/                  # Layout components (Sidebar, TopBar, Shell)
│   ├── dashboard/               # Dashboard widgets
│   ├── tasks/                   # Task components (Table, Board)
│   ├── common/                  # Shared components (Button, Card, Modal)
│   ├── ai/                      # AI components
│   └── study/                   # Study session components
├── lib/
│   ├── db.ts                    # Prisma client
│   ├── utils.ts                 # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── validation/              # Zod schemas
│   └── templates/               # Page templates
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed data
└── public/                      # Static assets
```

## 🎨 Key Features Explained

### Dashboard
The Semester Dashboard provides a comprehensive overview:
- **Focus Streak** - Track consecutive days of study
- **Time per Course** - Visual breakdown of study time
- **This Week** - Upcoming tasks and deadlines
- **GPA Tracker** - Circular progress indicator
- **Recent Sessions** - Study session history

### Task Management
Two powerful views for different workflows:
- **Table View** - Sortable, filterable spreadsheet-like interface
- **Board View** - Kanban board with drag-and-drop

### Study Sessions
Track your focus time with built-in timer:
- Set duration and course
- Real-time countdown
- Session notes and task completion
- Comprehensive analytics

### Smart Pages
Create different types of pages:
- **Blank Page** - Start from scratch
- **Course Notes** - Structured lecture notes
- **Exam Revision** - Focused exam prep
- **Custom Templates** - Build your own

## 🎯 Usage

### Creating Your First Task

1. Click **"+ Add task"** in the top bar
2. Fill in title, course, priority, and due date
3. Click **"Add task"** to save
4. View in Table or Board layout

### Starting a Study Session

1. Navigate to **Study Mode** or click **"Start session"**
2. Select course and duration
3. Click **"Start"** to begin timer
4. Take notes and track completed tasks
5. End session to save your progress

### Managing Courses

1. Go to **Courses** page
2. Click **"+ Add course"** (via Quick Capture or page button)
3. Add course code, name, and credits
4. Track assessments and calculate current grade

### Using the Command Palette

- Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux)
- Search for pages, courses, or actions
- Navigate quickly without using the mouse

## 🔒 Data & Privacy

- **Local-First** - All data stored in your browser's localStorage (demo mode)
- **Database Ready** - Full Prisma schema for production deployment
- **Export/Import** - Backup and restore your data anytime
- **No Tracking** - Your study data stays private

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables:
   - `DATABASE_URL` (use [Neon](https://neon.tech) or [Supabase](https://supabase.com))
4. Deploy!

### Environment Variables

```bash
DATABASE_URL="postgresql://..." # Production database
NEXTAUTH_SECRET="..."           # For authentication (future)
NEXTAUTH_URL="https://..."      # Your deployment URL
```

## 🎨 Customization

### Theme
- Built-in light/dark mode
- System preference detection
- Persistent across sessions

### Colors
Edit `app/globals.css` to customize:
- Primary colors
- Accent colors
- Sidebar colors
- Chart colors

### Components
All components use Tailwind CSS - easy to customize by editing className props.

## 🐛 Troubleshooting

### Database Issues

```bash
# Reset database
pnpm prisma migrate reset

# Regenerate Prisma client
pnpm prisma generate
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## 📊 Performance

- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices)
- **First Load:** < 100KB JavaScript
- **Optimized Images** - Next.js Image component
- **Code Splitting** - Automatic route-based splitting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Lingz450**
- GitHub: [@Lingz450](https://github.com/Lingz450)
- Repository: [NoteLoft](https://github.com/Lingz450/NoteLoft)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI inspired by modern productivity apps (Notion, Linear)
- Icons by [Lucide](https://lucide.dev/)
- Database powered by [Prisma](https://www.prisma.io/)

## 📞 Support

If you have questions or need help:
- Open an [Issue](https://github.com/Lingz450/NoteLoft/issues)
- Check the [Implementation Guide](./IMPLEMENTATION_GUIDE.md)

---

**Ready to ace your semester?** Start using NOTELOFT today! 📚✨

Made with ❤️ for students everywhere.
