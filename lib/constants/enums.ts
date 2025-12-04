export const PAGE_TYPE_VALUES = ["GENERIC", "SEMESTER_DASHBOARD", "COURSE_NOTES", "EXAM_REVISION", "STUDY_TASKS"] as const;

export const TASK_STATUS_VALUES = ["NOT_STARTED", "IN_PROGRESS", "DONE"] as const;
export const TASK_TYPE_VALUES = ["ASSIGNMENT", "REVISION", "READING", "OTHER"] as const;
export const TASK_PRIORITY_VALUES = ["LOW", "NORMAL", "HIGH"] as const;

export const TIMETABLE_SLOT_TYPE_VALUES = ["LECTURE", "LAB", "STUDY", "EXAM", "OTHER"] as const;

export const STUDY_SESSION_STATUS_VALUES = ["IN_PROGRESS", "COMPLETED", "CANCELLED", "INTERRUPTED"] as const;
export const STUDY_SESSION_MOOD_VALUES = ["LOW", "OKAY", "HIGH"] as const;
export const STUDY_SESSION_EVENT_VALUES = [
  "STARTED",
  "PAUSED",
  "RESUMED",
  "ENDED",
  "TASK_MARKED_DONE",
  "NOTE_ADDED",
  "INTERRUPTED",
] as const;

export type PageTypeValue = (typeof PAGE_TYPE_VALUES)[number];
export type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];
export type TaskTypeValue = (typeof TASK_TYPE_VALUES)[number];
export type TaskPriorityValue = (typeof TASK_PRIORITY_VALUES)[number];
export type TimetableSlotTypeValue = (typeof TIMETABLE_SLOT_TYPE_VALUES)[number];
export type StudySessionStatusValue = (typeof STUDY_SESSION_STATUS_VALUES)[number];
export type StudySessionMoodValue = (typeof STUDY_SESSION_MOOD_VALUES)[number];
