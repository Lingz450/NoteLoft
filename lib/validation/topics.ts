import { z } from "zod";

export const createTopicSchema = z.object({
  workspaceId: z.string().cuid(),
  courseId: z.string().cuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  parentTopicId: z.string().cuid().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default("#6366F1"),
});

export const updateTopicSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export const linkTopicToTaskSchema = z.object({
  topicId: z.string().cuid(),
  taskId: z.string().cuid(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;

