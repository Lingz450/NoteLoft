/**
 * Stats Aggregator Service
 * 
 * Aggregates study data for heatmaps and analytics.
 */

import { prisma } from "@/lib/db";

export type CourseTimeData = {
  courseId: string;
  courseCode: string;
  courseName: string;
  courseColor: string;
  totalMinutes: number;
  sessionCount: number;
  avgSessionLength: number;
};

export type DailyHeatmapData = {
  date: string; // YYYY-MM-DD
  courseId: string;
  courseCode: string;
  minutes: number;
};

export type CourseDifficultyData = {
  courseId: string;
  courseCode: string;
  totalTasks: number;
  hardTasks: number;
  completedTasks: number;
  avgTimePerTask: number;
};

/**
 * Get time spent per course over a date range
 */
export async function getCourseTimeBreakdown(
  workspaceId: string,
  startDate: Date,
  endDate: Date
): Promise<CourseTimeData[]> {
  const sessions = await prisma.studySession.findMany({
    where: {
      workspaceId,
      startedAt: { gte: startDate, lte: endDate },
      status: "COMPLETED",
    },
    include: {
      course: true,
    },
  });

  const courseMap = new Map<string, CourseTimeData>();

  sessions.forEach((session) => {
    if (!session.course) return;

    const existing = courseMap.get(session.courseId!) || {
      courseId: session.courseId!,
      courseCode: session.course.code,
      courseName: session.course.name,
      courseColor: session.course.color,
      totalMinutes: 0,
      sessionCount: 0,
      avgSessionLength: 0,
    };

    existing.totalMinutes += session.durationMinutes || 0;
    existing.sessionCount += 1;
    existing.avgSessionLength = existing.totalMinutes / existing.sessionCount;

    courseMap.set(session.courseId!, existing);
  });

  return Array.from(courseMap.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
}

/**
 * Generate heatmap data (day x course matrix)
 */
export async function generateHeatmapData(
  workspaceId: string,
  startDate: Date,
  endDate: Date
): Promise<DailyHeatmapData[]> {
  const sessions = await prisma.studySession.findMany({
    where: {
      workspaceId,
      startedAt: { gte: startDate, lte: endDate },
      status: "COMPLETED",
      courseId: { not: null },
    },
    include: {
      course: true,
    },
  });

  const heatmapMap = new Map<string, DailyHeatmapData>();

  sessions.forEach((session) => {
    if (!session.course) return;

    const date = session.startedAt.toISOString().split("T")[0];
    const key = `${date}-${session.courseId}`;

    const existing = heatmapMap.get(key) || {
      date,
      courseId: session.courseId!,
      courseCode: session.course.code,
      minutes: 0,
    };

    existing.minutes += session.durationMinutes || 0;
    heatmapMap.set(key, existing);
  });

  return Array.from(heatmapMap.values());
}

/**
 * Get course difficulty analysis
 */
export async function getCourseDifficultyAnalysis(
  workspaceId: string
): Promise<CourseDifficultyData[]> {
  const courses = await prisma.course.findMany({
    where: { workspaceId },
    include: {
      tasks: true,
      studySessions: {
        where: { status: "COMPLETED" },
      },
    },
  });

  return courses.map((course) => {
    const tasks = course.tasks;
    const sessions = course.studySessions;

    const hardTasks = tasks.filter(t => t.priority === "HIGH").length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const avgTimePerTask = completedTasks > 0 ? totalMinutes / completedTasks : 0;

    return {
      courseId: course.id,
      courseCode: course.code,
      totalTasks: tasks.length,
      hardTasks,
      completedTasks,
      avgTimePerTask,
    };
  });
}

/**
 * Identify most neglected course (least study time relative to tasks)
 */
export function findMostNeglectedCourse(data: CourseTimeData[], difficultyData: CourseDifficultyData[]) {
  const scored = data.map((course) => {
    const difficulty = difficultyData.find(d => d.courseId === course.courseId);
    const taskCount = difficulty?.totalTasks || 1;
    const minutesPerTask = course.totalMinutes / taskCount;
    
    return {
      ...course,
      neglectScore: 1 / Math.max(minutesPerTask, 1), // Higher score = more neglected
    };
  });

  return scored.sort((a, b) => b.neglectScore - a.neglectScore)[0];
}

