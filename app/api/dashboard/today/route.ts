import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/dashboard/today
 * Get today's tasks, exams, and suggestions
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        workspaceId,
        dueDate: { lt: today },
        status: { not: "DONE" },
      },
      include: {
        course: {
          select: { code: true },
        },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
    });

    // Today's tasks
    const todayTasks = await prisma.task.findMany({
      where: {
        workspaceId,
        dueDate: { gte: today, lt: tomorrow },
        status: { not: "DONE" },
      },
      include: {
        course: {
          select: { code: true },
        },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
    });

    // Next exam
    const nextExam = await prisma.exam.findFirst({
      where: {
        workspaceId,
        date: { gte: today },
      },
      include: {
        course: {
          select: { code: true },
        },
      },
      orderBy: { date: "asc" },
    });

    // Suggested session (based on urgency)
    let suggestedSession = null;
    if (overdueTasks.length > 0) {
      const urgentTask = overdueTasks[0];
      suggestedSession = {
        courseId: urgentTask.courseId,
        courseName: urgentTask.course?.code || "Course",
        duration: 50,
        reason: "Overdue task",
      };
    } else if (todayTasks.length > 0) {
      const todayTask = todayTasks[0];
      suggestedSession = {
        courseId: todayTask.courseId,
        courseName: todayTask.course?.code || "Course",
        duration: 25,
        reason: "Due today",
      };
    } else if (nextExam) {
      const daysUntil = Math.ceil(
        (nextExam.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil <= 7) {
        suggestedSession = {
          courseId: nextExam.courseId,
          courseName: nextExam.course?.code || "Course",
          duration: 50,
          reason: `Exam in ${daysUntil} days`,
        };
      }
    }

    return NextResponse.json({
      overdueTasks: overdueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        courseCode: t.course?.code,
        status: t.status,
      })),
      todayTasks: todayTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        courseCode: t.course?.code,
        status: t.status,
      })),
      nextExam: nextExam
        ? {
            id: nextExam.id,
            title: nextExam.title,
            date: nextExam.date,
            courseCode: nextExam.course?.code,
            daysUntil: Math.ceil(
              (nextExam.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            ),
          }
        : null,
      suggestedSession,
    });
  } catch (error) {
    console.error("Error fetching today data:", error);
    return NextResponse.json({ error: "Failed to fetch today data" }, { status: 500 });
  }
}

