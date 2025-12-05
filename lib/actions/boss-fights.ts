"use server";

/**
 * Boss Fight Server Actions
 * 
 * Gamified exam preparation system.
 */

import { prisma } from "@/lib/db";
import { 
  calculateMaxHP, 
  calculateSessionDamage, 
  determineBossStatus,
  calculateMissedSessionHealing
} from "@/lib/services/boss-fight-calculator";
import { BossDifficulty } from "@/lib/constants/enums";
import { revalidatePath } from "next/cache";

/**
 * Create a boss fight for an exam
 */
export async function createBossFight(examId: string, difficulty: BossDifficulty) {
  // Get exam details
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam) throw new Error("Exam not found");

  const now = new Date();
  const daysUntilExam = Math.max(0, Math.ceil((exam.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  const maxHP = calculateMaxHP(exam.weight || 20, difficulty, daysUntilExam);

  const bossFight = await prisma.bossFight.create({
    data: {
      examId,
      name: exam.title,
      difficulty,
      maxHP,
      currentHP: maxHP,
      status: "ALIVE",
    },
  });

  revalidatePath(`/workspace/*/exams`);
  return bossFight;
}

/**
 * Apply damage when a study session is logged
 */
export async function applyBossDamage(
  bossFightId: string,
  sessionId: string,
  sessionMinutes: number,
  isConsistentStreak: boolean = false
) {
  const boss = await prisma.bossFight.findUnique({
    where: { id: bossFightId },
  });

  if (!boss) throw new Error("Boss fight not found");

  const damage = calculateSessionDamage(
    sessionMinutes,
    boss.difficulty as BossDifficulty,
    isConsistentStreak
  );

  const newHP = Math.max(0, boss.currentHP - damage);

  // Get exam to check status
  const exam = await prisma.exam.findUnique({
    where: { id: boss.examId },
  });

  if (!exam) throw new Error("Exam not found");

  const newStatus = determineBossStatus(newHP, exam.date);

  const updated = await prisma.bossFight.update({
    where: { id: bossFightId },
    data: {
      currentHP: newHP,
      status: newStatus,
      hits: {
        create: {
          sessionId,
          damage,
          description: `${sessionMinutes}-min study session dealt ${damage} damage`,
        },
      },
    },
    include: {
      hits: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  revalidatePath(`/workspace/*/boss-fights/${bossFightId}`);
  return updated;
}

/**
 * Apply healing when a session is skipped
 */
export async function applyBossHealing(
  bossFightId: string,
  missedMinutes: number
) {
  const boss = await prisma.bossFight.findUnique({
    where: { id: bossFightId },
  });

  if (!boss) throw new Error("Boss fight not found");

  const healing = calculateMissedSessionHealing(
    missedMinutes,
    boss.difficulty as BossDifficulty
  );

  const newHP = Math.min(boss.maxHP, boss.currentHP + healing);

  const updated = await prisma.bossFight.update({
    where: { id: bossFightId },
    data: {
      currentHP: newHP,
      hits: {
        create: {
          damage: -healing, // Negative damage = healing
          description: `Skipped session - boss healed ${healing} HP`,
        },
      },
    },
  });

  revalidatePath(`/workspace/*/boss-fights/${bossFightId}`);
  return updated;
}

/**
 * Get boss fight with recent hits
 */
export async function getBossFight(bossFightId: string) {
  return await prisma.bossFight.findUnique({
    where: { id: bossFightId },
    include: {
      hits: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

/**
 * List all boss fights for a workspace
 */
export async function listBossFights(workspaceId: string) {
  const exams = await prisma.exam.findMany({
    where: { workspaceId },
    include: {
      course: true,
    },
  });

  const examIds = exams.map(e => e.id);

  const bossFights = await prisma.bossFight.findMany({
    where: {
      examId: { in: examIds },
    },
    include: {
      hits: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  // Merge exam data with boss fight data
  return bossFights.map(boss => {
    const exam = exams.find(e => e.id === boss.examId);
    return {
      ...boss,
      exam,
    };
  });
}

