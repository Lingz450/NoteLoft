import { z } from "zod";
import { BOSS_DIFFICULTY_VALUES, BOSS_STATUS_VALUES } from "@/lib/constants/enums";

export const bossDifficultySchema = z.enum(BOSS_DIFFICULTY_VALUES);
export const bossStatusSchema = z.enum(BOSS_STATUS_VALUES);

export const createBossFightSchema = z.object({
  examId: z.string().cuid(),
  difficulty: bossDifficultySchema,
});

export const applyDamageSchema = z.object({
  bossFightId: z.string().cuid(),
  sessionId: z.string().cuid(),
  sessionMinutes: z.number().int().min(1).max(300),
  isConsistentStreak: z.boolean().optional(),
});

export const applyHealingSchema = z.object({
  bossFightId: z.string().cuid(),
  missedMinutes: z.number().int().min(1),
});

export type CreateBossFightInput = z.infer<typeof createBossFightSchema>;
export type ApplyDamageInput = z.infer<typeof applyDamageSchema>;

