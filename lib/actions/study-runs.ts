"use server";

/**
 * Study Runs Server Actions
 * 
 * Handle CRUD and business logic for study runs (semester study plans).
 */

import { prisma } from "@/lib/db";
import { generateStudyRunWeeks, recalculateStudyRunProgress } from "@/lib/services/study-run-generator";
import { StudyRunGoalType } from "@/lib/constants/enums";
import { revalidatePath } from "next/cache";

export type CreateStudyRunInput = {
  workspaceId: string;
  courseId: string;
  goalType: StudyRunGoalType;
  targetGrade?: string;
  goalDescription?: string;
  startDate: Date | string;
  endDate: Date | string;
  preferredDaysPerWeek: number;
  minutesPerSession: number;
};

/**
 * Create a new study run and generate weekly plan
 */
export async function createStudyRun(input: CreateStudyRunInput) {
  const startDate = typeof input.startDate === "string" ? new Date(input.startDate) : input.startDate;
  const endDate = typeof input.endDate === "string" ? new Date(input.endDate) : input.endDate;

  // Generate weekly breakdown
  const generatedWeeks = generateStudyRunWeeks({
    ...input,
    startDate,
    endDate,
  });

  // Create study run with weeks in a transaction
  const studyRun = await prisma.studyRun.create({
    data: {
      workspaceId: input.workspaceId,
      courseId: input.courseId,
      goalType: input.goalType,
      targetGrade: input.targetGrade,
      goalDescription: input.goalDescription,
      startDate,
      endDate,
      preferredDaysPerWeek: input.preferredDaysPerWeek,
      minutesPerSession: input.minutesPerSession,
      weeks: {
        create: generatedWeeks.map((week) => ({
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          endDate: week.endDate,
          targetSessions: week.targetSessions,
          targetMinutes: week.targetMinutes,
          suggestedTopics: JSON.stringify(week.suggestedTopics),
        })),
      },
    },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
      },
    },
  });

  revalidatePath(`/workspace/${input.workspaceId}`);
  return studyRun;
}

/**
 * Get study run with current progress
 */
export async function getStudyRun(runId: string) {
  return await prisma.studyRun.findUnique({
    where: { id: runId },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
      },
    },
  });
}

/**
 * List all study runs for a workspace
 */
export async function listStudyRuns(workspaceId: string, courseId?: string) {
  return await prisma.studyRun.findMany({
    where: {
      workspaceId,
      ...(courseId && { courseId }),
    },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Update week progress when a session is logged
 */
export async function updateStudyRunProgress(
  runId: string,
  sessionDuration: number,
  sessionDate: Date
) {
  const studyRun = await prisma.studyRun.findUnique({
    where: { id: runId },
    include: { weeks: true },
  });

  if (!studyRun) return null;

  // Find which week this session belongs to
  const week = studyRun.weeks.find((w) => {
    const sd = new Date(sessionDate);
    return sd >= new Date(w.startDate) && sd <= new Date(w.endDate);
  });

  if (!week) return null;

  // Update week progress
  const updated = await prisma.studyRunWeek.update({
    where: { id: week.id },
    data: {
      completedSessions: { increment: 1 },
      completedMinutes: { increment: sessionDuration },
    },
  });

  // Recalculate all week statuses
  const allWeeks = await prisma.studyRunWeek.findMany({
    where: { studyRunId: runId },
    orderBy: { weekNumber: "asc" },
  });

  const updatedStatuses = recalculateStudyRunProgress(
    allWeeks.map((w) => ({
      weekNumber: w.weekNumber,
      targetSessions: w.targetSessions,
      completedSessions: w.completedSessions,
      targetMinutes: w.targetMinutes,
      completedMinutes: w.completedMinutes,
      endDate: new Date(w.endDate),
    }))
  );

  // Update statuses
  await Promise.all(
    updatedStatuses.map((s) => {
      const weekToUpdate = allWeeks.find((w) => w.weekNumber === s.weekNumber);
      if (!weekToUpdate) return null;
      return prisma.studyRunWeek.update({
        where: { id: weekToUpdate.id },
        data: { status: s.status },
      });
    })
  );

  revalidatePath(`/workspace/${studyRun.workspaceId}/study-runs/${runId}`);
  return updated;
}

/**
 * Deactivate a study run
 */
export async function deactivateStudyRun(runId: string) {
  const studyRun = await prisma.studyRun.update({
    where: { id: runId },
    data: { isActive: false },
  });

  revalidatePath(`/workspace/${studyRun.workspaceId}`);
  return studyRun;
}

