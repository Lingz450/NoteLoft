import { z } from "zod";

export const studySessionCreateSchema = z.object({
  workspaceId: z.string(),
  courseId: z.string().nullable().optional(),
  taskId: z.string().nullable().optional(),
  examId: z.string().nullable().optional(),
  plannedDurationMinutes: z.number().int().min(5).max(240),
  mood: z.enum(["LOW", "OKAY", "HIGH"]).nullable().optional(),
});

export const studySessionUpdateSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  endedAt: z.string().datetime().optional(),
  status: z.enum(["COMPLETED", "CANCELLED", "INTERRUPTED"]).optional(),
  notes: z.string().nullable().optional(),
  mood: z.enum(["LOW", "OKAY", "HIGH"]).nullable().optional(),
});

export type StudySessionCreateInput = z.infer<typeof studySessionCreateSchema>;
export type StudySessionUpdateInput = z.infer<typeof studySessionUpdateSchema>;
