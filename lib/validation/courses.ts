import { z } from "zod";

export const courseUpsertSchema = z.object({
  id: z.string().optional(),
  workspaceId: z.string(),
  name: z.string().min(1, "Course name is required"),
  code: z.string().min(1, "Course code is required"),
  semesterName: z.string().min(1, "Semester is required"),
  color: z
    .string()
    .regex(/^#/i, "Color must be a hex value")
    .default("#3B82F6"),
  credits: z.number().int().min(0).max(20).optional(),
});

export type CourseUpsertInput = z.infer<typeof courseUpsertSchema>;
