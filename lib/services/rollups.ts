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

/**
 * Formula Support
 * 
 * Simple formula evaluation for computed properties.
 */

export type FormulaType = 
  | "SUM"
  | "AVERAGE"
  | "COUNT"
  | "MIN"
  | "MAX"
  | "DAYS_UNTIL"
  | "IS_OVERDUE"
  | "PERCENTAGE";

export interface Formula {
  type: FormulaType;
  field?: string; // Field to operate on
  field2?: string; // Second field for operations like percentage
}

/**
 * Evaluate a formula
 */
export function evaluateFormula(
  formula: Formula,
  values: Record<string, any>
): number | boolean | string {
  switch (formula.type) {
    case "SUM":
      if (!formula.field) return 0;
      const sumValues = Array.isArray(values[formula.field])
        ? values[formula.field]
        : [values[formula.field]];
      return sumValues.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);

    case "AVERAGE":
      if (!formula.field) return 0;
      const avgValues = Array.isArray(values[formula.field])
        ? values[formula.field]
        : [values[formula.field]];
      const sum = avgValues.reduce((s: number, val: any) => s + (Number(val) || 0), 0);
      return avgValues.length > 0 ? sum / avgValues.length : 0;

    case "COUNT":
      if (!formula.field) return 0;
      const countValues = Array.isArray(values[formula.field])
        ? values[formula.field]
        : [values[formula.field]];
      return countValues.filter((v: any) => v != null && v !== "").length;

    case "MIN":
      if (!formula.field) return 0;
      const minValues = Array.isArray(values[formula.field])
        ? values[formula.field]
        : [values[formula.field]];
      return Math.min(...minValues.map((v: any) => Number(v) || 0));

    case "MAX":
      if (!formula.field) return 0;
      const maxValues = Array.isArray(values[formula.field])
        ? values[formula.field]
        : [values[formula.field]];
      return Math.max(...maxValues.map((v: any) => Number(v) || 0));

    case "DAYS_UNTIL":
      if (!formula.field || !values[formula.field]) return 0;
      const date = new Date(values[formula.field]);
      const now = new Date();
      const diff = date.getTime() - now.getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));

    case "IS_OVERDUE":
      if (!formula.field || !values[formula.field]) return false;
      const dueDate = new Date(values[formula.field]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && values.status !== "DONE";

    case "PERCENTAGE":
      if (!formula.field || !formula.field2) return 0;
      const part = Number(values[formula.field]) || 0;
      const total = Number(values[formula.field2]) || 1;
      return total > 0 ? (part / total) * 100 : 0;

    default:
      return 0;
  }
}

/**
 * Format formula result for display
 */
export function formatFormulaResult(
  result: number | boolean | string,
  formula: Formula
): string {
  if (typeof result === "boolean") {
    return result ? "Yes" : "No";
  }

  if (typeof result === "number") {
    if (formula.type === "PERCENTAGE") {
      return `${result.toFixed(1)}%`;
    }
    if (formula.type === "DAYS_UNTIL") {
      if (result < 0) return `${Math.abs(result)} days overdue`;
      if (result === 0) return "Today";
      return `${result} days`;
    }
    if (Number.isInteger(result)) {
      return result.toString();
    }
    return result.toFixed(2);
  }

  return String(result);
}

