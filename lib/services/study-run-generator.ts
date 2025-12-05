/**
 * Study Run Generator Service
 * 
 * Generates weekly study plans based on goal parameters.
 * Adapts plans when sessions are completed or missed.
 */

import { StudyRunGoalType, StudyRunWeekStatus } from "@/lib/constants/enums";

export type StudyRunParams = {
  courseId: string;
  goalType: StudyRunGoalType;
  targetGrade?: string;
  goalDescription?: string;
  startDate: Date;
  endDate: Date;
  preferredDaysPerWeek: number;
  minutesPerSession: number;
};

export type GeneratedWeek = {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  targetSessions: number;
  targetMinutes: number;
  suggestedTopics: string[];
};

/**
 * Generate weekly breakdown for a study run
 */
export function generateStudyRunWeeks(params: StudyRunParams): GeneratedWeek[] {
  const {
    startDate,
    endDate,
    preferredDaysPerWeek,
    minutesPerSession,
  } = params;

  const weeks: GeneratedWeek[] = [];
  let currentWeekStart = new Date(startDate);
  currentWeekStart.setHours(0, 0, 0, 0);
  
  let weekNumber = 1;

  while (currentWeekStart < endDate) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const finalWeekEnd = weekEnd > endDate ? endDate : weekEnd;

    weeks.push({
      weekNumber,
      startDate: new Date(currentWeekStart),
      endDate: finalWeekEnd,
      targetSessions: preferredDaysPerWeek,
      targetMinutes: preferredDaysPerWeek * minutesPerSession,
      suggestedTopics: generateTopicsForWeek(weekNumber, params.goalType),
    });

    // Move to next week
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }

  return weeks;
}

/**
 * Determine week status based on progress
 */
export function calculateWeekStatus(
  targetSessions: number,
  completedSessions: number,
  targetMinutes: number,
  completedMinutes: number,
  weekEndDate: Date
): StudyRunWeekStatus {
  const now = new Date();
  
  // If week hasn't started yet
  if (now < weekEndDate && completedSessions === 0) {
    return "PENDING";
  }

  // If week is complete (past end date)
  if (now > weekEndDate) {
    const sessionRatio = completedSessions / targetSessions;
    if (sessionRatio >= 0.9) return "COMPLETED";
    if (sessionRatio >= 0.7) return "ON_TRACK";
    return "BEHIND";
  }

  // Week is in progress
  const sessionRatio = completedSessions / targetSessions;
  const minuteRatio = completedMinutes / targetMinutes;
  const avgRatio = (sessionRatio + minuteRatio) / 2;

  if (avgRatio >= 1.2) return "AHEAD";
  if (avgRatio >= 0.8) return "ON_TRACK";
  return "BEHIND";
}

/**
 * Generate suggested topics for a given week
 * (Placeholder - in production, use AI or course syllabus)
 */
function generateTopicsForWeek(weekNumber: number, goalType: StudyRunGoalType): string[] {
  const baseTopics = [
    "Review fundamentals",
    "Practice problems",
    "Deep dive on concepts",
    "Review and consolidate",
  ];

  if (goalType === "A_GRADE") {
    return [`Week ${weekNumber}: Advanced concepts`, ...baseTopics];
  } else if (goalType === "CATCH_UP") {
    return [`Week ${weekNumber}: Catch up on missed material`, ...baseTopics];
  }

  return [`Week ${weekNumber}: Core material`, ...baseTopics];
}

/**
 * Recalculate remaining weeks when sessions change
 */
export function recalculateStudyRunProgress(
  weeks: Array<{
    weekNumber: number;
    targetSessions: number;
    completedSessions: number;
    targetMinutes: number;
    completedMinutes: number;
    endDate: Date;
  }>
): Array<{ weekNumber: number; status: StudyRunWeekStatus }> {
  return weeks.map((week) => ({
    weekNumber: week.weekNumber,
    status: calculateWeekStatus(
      week.targetSessions,
      week.completedSessions,
      week.targetMinutes,
      week.completedMinutes,
      week.endDate
    ),
  }));
}

