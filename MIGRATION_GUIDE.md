# 🔄 Migration Guide - Upgrading to Notion-Class NOTELOFT

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL or SQLite database
- Git repository up to date

---

## 🚀 Step-by-Step Migration

### Step 1: Pull Latest Code

```bash
git pull origin main
```

### Step 2: Install Dependencies

```bash
# If new packages were added (they weren't, TipTap was already installed)
pnpm install
```

### Step 3: Database Migration

```bash
# Generate and apply migration
pnpm prisma migrate dev --name notion_class_features

# This will create:
# - Block table
# - Comment and Mention tables
# - Resource table
# - PageRevision table
# - ActivityLog table
# - Add new columns to Page table (icon, isPublic, publicSlug)
```

### Step 4: Generate Prisma Client

```bash
pnpm prisma generate
```

### Step 5: Start Development Server

```bash
pnpm dev
```

### Step 6: Test New Features

Visit: http://localhost:3000/workspace/demo

**Try these:**
1. Press `Cmd/Ctrl+K` → Search working!
2. Create new page with rich editor
3. Click Share button on a page
4. Test mobile view (resize browser)

---

## 🗃️ Database Schema Changes

### New Tables:

```sql
-- Block (for page content)
CREATE TABLE "Block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE
);

-- Comment (for collaboration)
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "pageId" TEXT,
    "taskId" TEXT,
    "examId" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'Student',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Mention (for @mentions)
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE
);

-- Resource (for web clipper)
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "courseId" TEXT,
    "pageId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "type" TEXT NOT NULL,
    "fileSize" INTEGER,
    "filePath" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- PageRevision (for version history)
CREATE TABLE "PageRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE
);

-- ActivityLog (for activity feed)
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetTitle" TEXT,
    "metadata" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Modified Tables:

```sql
-- Page (added columns)
ALTER TABLE "Page" ADD COLUMN "icon" TEXT;
ALTER TABLE "Page" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Page" ADD COLUMN "publicSlug" TEXT;

-- Add unique index for publicSlug
CREATE UNIQUE INDEX "Page_publicSlug_key" ON "Page"("publicSlug");
```

---

## 🔧 Configuration (Optional)

### Environment Variables

Add to `.env` (optional, for future AI integration):

```env
# OpenAI API (for AI features)
OPENAI_API_KEY=sk-...

# File Upload (for resources)
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Or use local storage
UPLOAD_DIR=./uploads
```

---

## 🧪 Testing Checklist

After migration, test these features:

### ✅ Block Editor
- [ ] Navigate to existing page → old content still shows
- [ ] Create new page → editor loads
- [ ] Type content → autosave indicator works
- [ ] Reload page → content persists

### ✅ Command Palette
- [ ] Press Cmd/Ctrl+K → modal opens
- [ ] Type search query → results appear
- [ ] Click result → navigates correctly

### ✅ Comments
- [ ] Open page/task → comments panel loads
- [ ] Add comment → appears in list
- [ ] Type @mention → suggestion shows

### ✅ Public Pages
- [ ] Toggle page to public → slug generates
- [ ] Copy link → open in incognito
- [ ] Public view renders correctly (no edit controls)

### ✅ Mobile
- [ ] Resize to mobile → hamburger appears
- [ ] Click hamburger → drawer opens
- [ ] Navigate works in drawer

---

## 🚨 Troubleshooting

### Issue: Migration Fails

**Error:** `Foreign key constraint fails`

**Solution:**
```bash
# Reset database (DEV ONLY!)
pnpm prisma migrate reset

# Then re-run
pnpm prisma migrate dev
```

### Issue: TypeScript Errors

**Error:** `Cannot find module '@/components/editor/BlockEditor'`

**Solution:**
```bash
# Restart TypeScript server
# In VS Code: Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Or rebuild
pnpm build
```

### Issue: TipTap Not Loading

**Error:** `Module not found: Can't resolve '@tiptap/react'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Issue: Search Returns Empty

**Check:**
1. Database has data: `SELECT COUNT(*) FROM "Page"`
2. Workspace ID is correct: `SELECT * FROM "Workspace" LIMIT 1`
3. API route working: `curl http://localhost:3000/api/search?q=test&workspaceId=demo`

---

## 📊 Data Migration (If Needed)

### Migrate Old Page Content to Blocks

If you have existing pages with content, you can optionally convert them to blocks:

```typescript
// scripts/migrate-pages-to-blocks.ts
import { prisma } from "@/lib/db";

async function migratePages() {
  const pages = await prisma.page.findMany({
    where: {
      content: { not: "{}" },
    },
  });

  for (const page of pages) {
    // Parse old content (assuming it was plain text or HTML)
    const content = page.content;

    // Create a single paragraph block with the content
    await prisma.block.create({
      data: {
        pageId: page.id,
        type: "PARAGRAPH",
        content: JSON.stringify({ text: content }),
        order: 0,
      },
    });

    console.log(`Migrated page: ${page.title}`);
  }

  console.log(`Migrated ${pages.length} pages to blocks`);
}

migratePages();
```

Run with:
```bash
npx tsx scripts/migrate-pages-to-blocks.ts
```

---

## 🎯 Post-Migration Tasks

### 1. Update Navigation

The Command Palette is global, but you may want to add it to the TopBar:

```typescript
// components/top-bar.tsx
import { CommandPalette } from "@/components/common/CommandPalette";

// Add to render:
<CommandPalette />
```

### 2. Enable AI Features

Once you add `OPENAI_API_KEY`, update `/lib/services/ai-service.ts` to use real API:

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizePage(pageId: string) {
  // Replace placeholder with real API call
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: `Summarize: ${page.content}` }],
  });
  return response.choices[0].message.content;
}
```

### 3. Add Comments to Existing Pages

Update your page layouts to include:

```typescript
import { CommentsPanel } from "@/components/comments/CommentsPanel";

// In page render:
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-2">
    {/* Main content */}
  </div>
  <div>
    <CommentsPanel
      targetType="page"
      targetId={pageId}
      workspaceId={workspaceId}
    />
  </div>
</div>
```

### 4. Display Rollups on Course Pages

```typescript
import { getCourseRollups } from "@/lib/services/rollups";

// In course page:
const rollups = await getCourseRollups(courseId);

// Display:
<div className="stats">
  <p>{rollups.tasksCount} tasks ({rollups.completedTasks} done)</p>
  <p>{rollups.totalStudyHours}h study time</p>
</div>
```

---

## 📈 Performance Optimization

### Add Database Indexes

These should be created by Prisma migration, but verify:

```sql
-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Should include:
-- Block_pageId_idx
-- Comment_workspaceId_idx
-- Comment_pageId_idx
-- ActivityLog_workspaceId_idx
-- ActivityLog_createdAt_idx
-- Page_publicSlug_key (unique)
```

### Enable Query Logging (Dev)

```typescript
// lib/db.ts
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## ✅ Migration Complete!

### Final Checklist:

- [ ] Database migrated successfully
- [ ] All tests pass
- [ ] Command Palette works (Cmd/Ctrl+K)
- [ ] Block editor loads and saves
- [ ] Mobile layout responsive
- [ ] No TypeScript errors
- [ ] Dark mode works everywhere
- [ ] Public pages viewable

### Next Steps:

1. **Read:** `NOTION_CLASS_IMPLEMENTATION.md` for feature details
2. **Explore:** Try all 11 new features
3. **Customize:** Integrate AI with OpenAI key
4. **Deploy:** Push to production (Vercel/Railway)

---

## 🎉 You're Ready!

Your NOTELOFT installation is now **Notion-class** with:
- ✅ Rich text editing
- ✅ Global search
- ✅ Comments & collaboration
- ✅ Public sharing
- ✅ AI capabilities (stubs)
- ✅ Version history
- ✅ Mobile support

**Happy building! 🚀**

