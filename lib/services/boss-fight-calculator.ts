/**
 * Boss Fight Calculator Service
 * 
 * Calculates boss HP, damage, and healing for gamified exam prep.
 */

import { BossDifficulty } from "@/lib/constants/enums";

/**
 * Calculate max HP for a boss based on exam parameters
 */
export function calculateMaxHP(
  examWeight: number = 20, // Exam weight percentage
  difficulty: BossDifficulty,
  daysUntilExam: number
): number {
  const baseHP = examWeight * 10; // 20% exam = 200 HP

  const difficultyMultiplier = {
    EASY: 0.7,
    NORMAL: 1.0,
    HARD: 1.3,
    NIGHTMARE: 1.6,
  }[difficulty];

  const timeMultiplier = Math.max(0.5, Math.min(2.0, daysUntilExam / 14));

  return Math.round(baseHP * difficultyMultiplier * timeMultiplier);
}

/**
 * Calculate damage dealt by a study session
 */
export function calculateSessionDamage(
  sessionMinutes: number,
  difficulty: BossDifficulty,
  isConsistentStreak: boolean = false
): number {
  const baseEfficiency = 1.0; // 1 HP per minute as baseline
  
  const difficultyFactor = {
    EASY: 1.2,
    NORMAL: 1.0,
    HARD: 0.8,
    NIGHTMARE: 0.6,
  }[difficulty];

  let damage = sessionMinutes * baseEfficiency * difficultyFactor;

  // Bonus for consistency (studying 3+ days in a row)
  if (isConsistentStreak) {
    damage *= 1.2;
  }

  return Math.round(damage);
}

/**
 * Calculate healing (penalty) for missing a scheduled session
 */
export function calculateMissedSessionHealing(
  plannedMinutes: number,
  difficulty: BossDifficulty
): number {
  // Boss heals when you skip sessions
  const basePenalty = plannedMinutes * 0.5;
  
  const difficultyFactor = {
    EASY: 0.5,
    NORMAL: 1.0,
    HARD: 1.5,
    NIGHTMARE: 2.0,
  }[difficulty];

  return Math.round(basePenalty * difficultyFactor);
}

/**
 * Determine boss status based on HP and exam date
 */
export function determineBossStatus(
  currentHP: number,
  examDate: Date
): "ALIVE" | "DEFEATED" | "ESCAPED" {
  const now = new Date();
  
  if (currentHP <= 0) {
    return "DEFEATED";
  }
  
  if (now > examDate && currentHP > 0) {
    return "ESCAPED";
  }
  
  return "ALIVE";
}

/**
 * Get flavor text for boss status
 */
export function getBossFlavorText(status: string, currentHP: number, maxHP: number): string {
  if (status === "DEFEATED") {
    return "💪 Boss defeated! You're ready for this exam!";
  }
  if (status === "ESCAPED") {
    return "😰 Boss escaped... but you still got this!";
  }
  
  const hpPercent = (currentHP / maxHP) * 100;
  if (hpPercent > 75) {
    return "🔥 Boss is strong - time to power up your study game!";
  } else if (hpPercent > 40) {
    return "⚔️ Making good progress - keep the pressure on!";
  } else if (hpPercent > 15) {
    return "🎯 Almost there - finish strong!";
  }
  return "🏆 Final push - victory is within reach!";
}

