import { TIMETABLE_SLOT_TYPE_VALUES } from "@/lib/constants/enums";
import { z } from "zod";

export const timetableSlotSchema = z.object({
  id: z.string().optional(),
  workspaceId: z.string(),
  courseId: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid start time (HH:MM)"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid end time (HH:MM)"),
  type: z.enum(TIMETABLE_SLOT_TYPE_VALUES).default("LECTURE").optional(),
});

export type TimetableSlotInput = z.infer<typeof timetableSlotSchema>;
