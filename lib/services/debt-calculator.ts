/**
 * Debt Calculator Service
 * 
 * Tracks and calculates study debts from missed planned sessions.
 */

import { prisma } from "@/lib/db";

export type StudyDebtSummary = {
  totalDebtMinutes: number;
  debtCount: number;
  oldestDebtDays: number;
  byCourse: Array<{
    courseId: string;
    courseCode: string;
    debtMinutes: number;
  }>;
};

/**
 * Create a study debt for a missed planned session
 */
export async function createStudyDebt(
  workspaceId: string,
  courseId: string | undefined,
  durationMinutes: number,
  dueDate: Date,
  plannedSessionId?: string
) {
  return await prisma.studyDebt.create({
    data: {
      workspaceId,
      courseId,
      plannedSessionId,
      durationMinutes,
      dueDate,
    },
  });
}

/**
 * Repay a debt (full or partial)
 */
export async function repayStudyDebt(
  studyDebtId: string,
  sessionId: string,
  minutesRepaid: number
) {
  const debt = await prisma.studyDebt.findUnique({
    where: { id: studyDebtId },
  });

  if (!debt) throw new Error("Debt not found");

  const newPaidMinutes = debt.paidMinutes + minutesRepaid;
  const isPaid = newPaidMinutes >= debt.durationMinutes;

  const updated = await prisma.studyDebt.update({
    where: { id: studyDebtId },
    data: {
      paidMinutes: newPaidMinutes,
      isPaid,
      repayments: {
        create: {
          sessionId,
          minutesRepaid,
        },
      },
    },
  });

  return updated;
}

/**
 * Get study debt summary for a workspace
 */
export async function getStudyDebtSummary(workspaceId: string): Promise<StudyDebtSummary> {
  const debts = await prisma.studyDebt.findMany({
    where: {
      workspaceId,
      isPaid: false,
    },
  });

  const totalDebtMinutes = debts.reduce((sum, d) => sum + (d.durationMinutes - d.paidMinutes), 0);
  const debtCount = debts.length;

  const now = new Date();
  const oldestDebt = debts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  const oldestDebtDays = oldestDebt
    ? Math.ceil((now.getTime() - oldestDebt.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Group by course
  const byCourseMap = new Map<string, { courseId: string; debtMinutes: number }>();
  
  for (const debt of debts) {
    if (!debt.courseId) continue;
    const existing = byCourseMap.get(debt.courseId) || { courseId: debt.courseId, debtMinutes: 0 };
    existing.debtMinutes += debt.durationMinutes - debt.paidMinutes;
    byCourseMap.set(debt.courseId, existing);
  }

  // Fetch course codes
  const courseIds = Array.from(byCourseMap.keys());
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, code: true },
  });

  const byCourse = Array.from(byCourseMap.values()).map(item => {
    const course = courses.find(c => c.id === item.courseId);
    return {
      courseId: item.courseId,
      courseCode: course?.code || "Unknown",
      debtMinutes: item.debtMinutes,
    };
  });

  return {
    totalDebtMinutes,
    debtCount,
    oldestDebtDays,
    byCourse,
  };
}

