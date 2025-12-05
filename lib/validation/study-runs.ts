import { z } from "zod";
import { STUDY_RUN_GOAL_TYPE_VALUES, STUDY_RUN_WEEK_STATUS_VALUES } from "@/lib/constants/enums";

export const studyRunGoalTypeSchema = z.enum(STUDY_RUN_GOAL_TYPE_VALUES);
export const studyRunWeekStatusSchema = z.enum(STUDY_RUN_WEEK_STATUS_VALUES);

export const createStudyRunSchema = z.object({
  workspaceId: z.string().cuid(),
  courseId: z.string().cuid(),
  goalType: studyRunGoalTypeSchema,
  targetGrade: z.string().optional(),
  goalDescription: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  preferredDaysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(15).max(180),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: "End date must be after start date" }
);

export const updateWeekProgressSchema = z.object({
  runId: z.string().cuid(),
  sessionDuration: z.number().int().min(1),
  sessionDate: z.coerce.date(),
});

export type CreateStudyRunInput = z.infer<typeof createStudyRunSchema>;
export type UpdateWeekProgressInput = z.infer<typeof updateWeekProgressSchema>;

