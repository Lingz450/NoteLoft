import { z } from "zod";

export const assessmentUpsertSchema = z.object({
  id: z.string().optional(),
  workspaceId: z.string(),
  courseId: z.string(),
  title: z.string().min(1, "Title is required"),
  score: z.number().nullable().optional(),
  maxScore: z.number().positive("Max score must be positive"),
  weight: z.number().positive("Weight must be positive"),
});

export type AssessmentUpsertInput = z.infer<typeof assessmentUpsertSchema>;
