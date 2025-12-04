import { prisma } from "@/lib/db";
import { StudyStatsView } from "@/components/sessions/StudyStatsView";
import { Card } from "@/components/common/Card";

export default async function StatsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;

  if (workspaceId === "demo") {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Insights</p>
          <h1 className="text-3xl font-semibold text-foreground">Study analytics</h1>
          <p className="text-sm text-muted-foreground">
            Stats will populate as you start logging study sessions in this demo workspace.
          </p>
        </div>
        <Card className="p-6 text-sm text-muted-foreground">
          No data yet for the demo workspace. Start a focus session to see streaks and time-by-course charts here.
        </Card>
      </div>
    );
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });

  if (!workspace) {
    return (
      <div className="p-6">
        <Card className="text-sm text-destructive">Workspace not found.</Card>
      </div>
    );
  }

  const [courses, tasks, sessions] = await Promise.all([
    prisma.course.findMany({ where: { workspaceId } }),
    prisma.task.findMany({ where: { workspaceId } }),
    prisma.studySession.findMany({
      where: { workspaceId },
      orderBy: { startedAt: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Insights</p>
        <h1 className="text-3xl font-semibold text-foreground">Study analytics</h1>
        <p className="text-sm text-muted-foreground">
          Time spent, productivity streaks, and the courses that need the most attention.
        </p>
      </div>

      <StudyStatsView workspaceId={workspaceId} courses={courses} tasks={tasks} sessions={sessions} />
    </div>
  );
}
