/**
 * Strategy Context Aggregator
 * 
 * Gathers workspace data to provide context for AI study strategist.
 */

import { prisma } from "@/lib/db";

export type StrategyContext = {
  workspace: {
    id: string;
    name: string;
  };
  courses: Array<{
    id: string;
    code: string;
    name: string;
    upcomingExams: number;
    pendingTasks: number;
    recentStudyMinutes: number;
  }>;
  upcomingDeadlines: Array<{
    type: "task" | "exam";
    title: string;
    courseCode: string;
    dueDate: Date;
    daysUntil: number;
  }>;
  recentActivity: {
    totalMinutesThisWeek: number;
    sessionsThisWeek: number;
    currentStreak: number;
  };
  weakPoints: Array<{
    topicName?: string;
    courseCode: string;
    reason: string; // "Low completion rate", "High-priority tasks pending", etc
  }>;
};

/**
 * Aggregate all context for AI strategist
 */
export async function aggregateStrategyContext(
  workspaceId: string
): Promise<StrategyContext> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const weekAhead = new Date(now);
  weekAhead.setDate(now.getDate() + 7);

  // Get courses with related data
  const courses = await prisma.course.findMany({
    where: { workspaceId },
    include: {
      exams: {
        where: { date: { gte: now } },
      },
      tasks: {
        where: { status: { not: "DONE" } },
      },
      studySessions: {
        where: {
          startedAt: { gte: weekAgo },
          status: "COMPLETED",
        },
      },
    },
  });

  const coursesSummary = courses.map(course => ({
    id: course.id,
    code: course.code,
    name: course.name,
    upcomingExams: course.exams.length,
    pendingTasks: course.tasks.length,
    recentStudyMinutes: course.studySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
  }));

  // Get upcoming deadlines
  const tasks = await prisma.task.findMany({
    where: {
      workspaceId,
      dueDate: { gte: now, lte: weekAhead },
      status: { not: "DONE" },
    },
    include: { course: true },
  });

  const exams = await prisma.exam.findMany({
    where: {
      workspaceId,
      date: { gte: now, lte: weekAhead },
    },
    include: { course: true },
  });

  const upcomingDeadlines = [
    ...tasks.map(t => ({
      type: "task" as const,
      title: t.title,
      courseCode: t.course?.code || "General",
      dueDate: t.dueDate!,
      daysUntil: Math.ceil((t.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    })),
    ...exams.map(e => ({
      type: "exam" as const,
      title: e.title,
      courseCode: e.course.code,
      dueDate: e.date,
      daysUntil: Math.ceil((e.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    })),
  ].sort((a, b) => a.daysUntil - b.daysUntil);

  // Recent activity
  const recentSessions = await prisma.studySession.findMany({
    where: {
      workspaceId,
      startedAt: { gte: weekAgo },
      status: "COMPLETED",
    },
    orderBy: { startedAt: "desc" },
  });

  const totalMinutesThisWeek = recentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  // Calculate streak (placeholder - simple version)
  const currentStreak = 0; // TODO: Implement proper streak calculation

  // Identify weak points
  const weakPoints = coursesSummary
    .filter(c => c.pendingTasks > 5 && c.recentStudyMinutes < 60)
    .map(c => ({
      courseCode: c.code,
      reason: `${c.pendingTasks} pending tasks, only ${c.recentStudyMinutes} min studied this week`,
    }));

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
    },
    courses: coursesSummary,
    upcomingDeadlines,
    recentActivity: {
      totalMinutesThisWeek,
      sessionsThisWeek: recentSessions.length,
      currentStreak,
    },
    weakPoints,
  };
}

/**
 * Generate study strategy based on context
 * (Placeholder - in production, call actual AI API)
 */
export async function generateStudyStrategy(context: StrategyContext, availableMinutes: number): Promise<string> {
  // Stub for AI call
  // In production: const response = await openai.chat.completions.create({ ... })

  const urgentDeadlines = context.upcomingDeadlines.filter(d => d.daysUntil <= 2);
  const mostNeglected = context.courses.sort((a, b) => a.recentStudyMinutes - b.recentStudyMinutes)[0];

  let strategy = `Based on your ${availableMinutes} minutes available:\n\n`;

  if (urgentDeadlines.length > 0) {
    strategy += `🚨 URGENT: You have ${urgentDeadlines.length} deadline(s) within 2 days:\n`;
    urgentDeadlines.forEach(d => {
      strategy += `  - ${d.title} (${d.courseCode}) in ${d.daysUntil} day(s)\n`;
    });
    strategy += `\nPrioritize: Spend ${Math.round(availableMinutes * 0.7)} min on urgent items.\n\n`;
  }

  if (mostNeglected && mostNeglected.recentStudyMinutes < 60) {
    strategy += `⚠️ ${mostNeglected.code} needs attention - only ${mostNeglected.recentStudyMinutes} min this week.\n`;
    strategy += `Allocate ${Math.round(availableMinutes * 0.3)} min to catch up.\n\n`;
  }

  strategy += `✅ Suggested focus order:\n`;
  context.upcomingDeadlines.slice(0, 3).forEach((d, i) => {
    strategy += `  ${i + 1}. ${d.title} (${d.courseCode})\n`;
  });

  return strategy;
}

