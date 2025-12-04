import { z } from "zod";

export const pageUpsertSchema = z.object({
  id: z.string().optional(),
  workspaceId: z.string(),
  parentId: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.any().optional(),
  isFavorite: z.boolean().optional(),
  position: z.number().int().optional(),
});

export type PageUpsertInput = z.infer<typeof pageUpsertSchema>;
