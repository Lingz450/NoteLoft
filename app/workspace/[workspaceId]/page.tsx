import { prisma } from "@/lib/db";
import { SemesterDashboard } from "@/components/dashboard/SemesterDashboard";

export default async function DashboardPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;

  // Demo workspace: render dashboard shell without requiring a DB record
  if (workspaceId === "demo") {
    return (
      <SemesterDashboard
        workspace={{ id: "demo", name: "Fall 2025 Semester" }}
        courses={[]}
        upcomingTasks={[]}
        upcomingExams={[]}
        focusSessions={[]}
      />
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });

  if (!workspace) {
    return <div className="p-6 text-sm text-red-600">Workspace not found.</div>;
  }

  const now = new Date();
  const weekAhead = new Date(now);
  weekAhead.setDate(now.getDate() + 7);

  const [courses, tasks, exams, sessions] = await Promise.all([
    prisma.course.findMany({
      where: { workspaceId },
      include: { assessmentItems: true },
      orderBy: { code: "asc" },
    }),
    prisma.task.findMany({
      where: {
        workspaceId,
        dueDate: { not: null, gte: now, lte: weekAhead },
      },
      include: {
        course: {
          select: { code: true, color: true },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
    prisma.exam.findMany({
      where: { workspaceId, date: { gte: now } },
      include: {
        course: {
          select: { code: true, name: true, color: true },
        },
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.studySession.findMany({
      where: { workspaceId },
      include: {
        course: { select: { code: true, color: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 20,
    }),
  ]);

  const upcomingTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    dueDate: task.dueDate,
    course: task.course
      ? { code: task.course.code, color: task.course.color ?? "#CBD5F5" }
      : null,
  }));

  const upcomingExams = exams.map((exam) => ({
    id: exam.id,
    title: exam.title,
    date: exam.date,
    course: {
      code: exam.course.code,
      name: exam.course.name,
      color: exam.course.color ?? "#6366f1",
    },
  }));

  const focusSessions = sessions.map((session) => ({
    id: session.id,
    courseCode: session.course?.code ?? "General",
    courseColor: session.course?.color ?? "#3B82F6",
    minutes: session.durationMinutes ?? session.plannedDurationMinutes ?? 0,
    date: session.startedAt,
  }));

  return (
    <SemesterDashboard
      workspace={workspace}
      courses={courses}
      upcomingTasks={upcomingTasks}
      upcomingExams={upcomingExams}
      focusSessions={focusSessions}
    />
  );
}
