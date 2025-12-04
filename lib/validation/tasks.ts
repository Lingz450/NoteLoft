import { z } from "zod";
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } from "@/lib/constants/enums";

export const taskUpsertSchema = z.object({
  id: z.string().optional(),
  workspaceId: z.string(),
  title: z.string().min(1, "Title is required"),
  courseId: z.string().nullable().optional(),
  courseLabel: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(TASK_STATUS_VALUES).default("NOT_STARTED").optional(),
  priority: z.enum(TASK_PRIORITY_VALUES).default("NORMAL").optional(),
  dueDate: z.string().nullable().optional(),
  relatedPageId: z.string().nullable().optional(),
});

export type TaskUpsertInput = z.infer<typeof taskUpsertSchema>;
