/**
 * Rollups Service
 * 
 * Compute aggregated values across relations (Notion-style rollups).
 */

import { prisma } from "@/lib/db";

/**
 * Course Rollups
 */
export async function getCourseRollups(courseId: string) {
  // Count tasks
  const tasksCount = await prisma.task.count({
    where: { courseId },
  });

  const completedTasks = await prisma.task.count({
    where: { courseId, status: "DONE" },
  });

  // Total study minutes
  const sessions = await prisma.studySession.findMany({
    where: { courseId },
    select: { durationMinutes: true },
  });

  const totalStudyMinutes = sessions.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0
  );

  // Upcoming exams
  const upcomingExams = await prisma.exam.count({
    where: {
      courseId,
      date: {
        gte: new Date(),
      },
    },
  });

  return {
    tasksCount,
    completedTasks,
    taskCompletionRate: tasksCount > 0 ? (completedTasks / tasksCount) * 100 : 0,
    totalStudyMinutes,
    totalStudyHours: Math.floor(totalStudyMinutes / 60),
    upcomingExams,
  };
}

/**
 * Exam Rollups
 */
export async function getExamRollups(examId: string) {
  // Total study time for this exam
  const sessions = await prisma.studySession.findMany({
    where: { examId },
    select: { durationMinutes: true },
  });

  const totalStudyMinutes = sessions.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0
  );

  // Days until exam
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { date: true },
  });

  const daysUntil = exam
    ? Math.ceil((exam.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    totalStudyMinutes,
    totalStudyHours: Math.floor(totalStudyMinutes / 60),
    daysUntil,
    isPast: daysUntil < 0,
  };
}

/**
 * Task Relations
 */
export async function getTaskRelations(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          name: true,
          color: true,
        },
      },
      linkedPage: {
        select: {
          id: true,
          title: true,
          icon: true,
        },
      },
    },
  });

  return task;
}

/**
 * Workspace-wide Stats (for dashboard)
 */
export async function getWorkspaceRollups(workspaceId: string) {
  const [
    totalTasks,
    completedTasks,
    totalCourses,
    totalStudyMinutes,
    upcomingExams,
  ] = await Promise.all([
    prisma.task.count({ where: { workspaceId } }),
    prisma.task.count({ where: { workspaceId, status: "DONE" } }),
    prisma.course.count({ where: { workspaceId } }),
    prisma.studySession
      .aggregate({
        where: { workspaceId },
        _sum: { durationMinutes: true },
      })
      .then(result => result._sum.durationMinutes || 0),
    prisma.exam.count({
      where: {
        workspaceId,
        date: { gte: new Date() },
      },
    }),
  ]);

  return {
    totalTasks,
    completedTasks,
    taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    totalCourses,
    totalStudyMinutes,
    totalStudyHours: Math.floor(totalStudyMinutes / 60),
    upcomingExams,
  };
}

