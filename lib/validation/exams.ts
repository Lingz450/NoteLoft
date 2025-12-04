import { z } from "zod";

export const examUpsertSchema = z.object({
  id: z.string().optional(),
  workspaceId: z.string(),
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().nullable().optional(),
  weight: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type ExamUpsertInput = z.infer<typeof examUpsertSchema>;
