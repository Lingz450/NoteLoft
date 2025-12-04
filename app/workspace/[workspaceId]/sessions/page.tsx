import { prisma } from "@/lib/db";
import { Card } from "@/components/common/Card";
import { StudySessionsView } from "@/components/sessions/StudySessionsView";

export default async function SessionsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;

  if (workspaceId === "demo") {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Study sessions for the demo workspace will appear here once you start logging focus sessions.
        </Card>
      </div>
    );
  }

  const [workspace, courses, tasks, exams] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
    prisma.course.findMany({ where: { workspaceId } }),
    prisma.task.findMany({ where: { workspaceId } }),
    prisma.exam.findMany({ where: { workspaceId } }),
  ]);

  if (!workspace) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card className="p-6 text-center text-sm text-destructive">Workspace not found.</Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <StudySessionsView workspaceId={workspaceId} courses={courses} tasks={tasks} exams={exams} />
    </div>
  );
}
