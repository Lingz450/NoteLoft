// ============================================
// CORE ENUMS
// ============================================

export const PAGE_TYPE_VALUES = ["GENERIC", "SEMESTER_DASHBOARD", "COURSE_NOTES", "EXAM_REVISION", "STUDY_TASKS"] as const;

export const TASK_STATUS_VALUES = ["NOT_STARTED", "IN_PROGRESS", "DONE"] as const;
export const TASK_TYPE_VALUES = ["ASSIGNMENT", "REVISION", "READING", "OTHER"] as const;
export const TASK_PRIORITY_VALUES = ["LOW", "NORMAL", "HIGH"] as const;

export const TIMETABLE_SLOT_TYPE_VALUES = ["LECTURE", "LAB", "STUDY", "EXAM", "OTHER"] as const;

export const STUDY_SESSION_STATUS_VALUES = ["IN_PROGRESS", "COMPLETED", "CANCELLED", "INTERRUPTED"] as const;
export const STUDY_SESSION_MOOD_VALUES = ["VERY_BAD", "BAD", "OKAY", "GOOD", "GREAT"] as const;
export const STUDY_SESSION_EVENT_VALUES = [
  "STARTED",
  "PAUSED",
  "RESUMED",
  "ENDED",
  "TASK_MARKED_DONE",
  "NOTE_ADDED",
  "INTERRUPTED",
] as const;

// ============================================
// STUDY RUNS
// ============================================

export const STUDY_RUN_GOAL_TYPE_VALUES = ["A_GRADE", "PASS", "CATCH_UP", "CUSTOM"] as const;
export const STUDY_RUN_WEEK_STATUS_VALUES = ["PENDING", "ON_TRACK", "BEHIND", "AHEAD", "COMPLETED"] as const;

// ============================================
// BOSS FIGHT MODE
// ============================================

export const BOSS_DIFFICULTY_VALUES = ["EASY", "NORMAL", "HARD", "NIGHTMARE"] as const;
export const BOSS_STATUS_VALUES = ["ALIVE", "DEFEATED", "ESCAPED"] as const;

// ============================================
// FOCUS ROOMS
// ============================================

export const FOCUS_ROOM_STATUS_VALUES = ["ACTIVE", "PAUSED", "ENDED"] as const;

// ============================================
// KNOWLEDGE GRAPH
// ============================================

export const TOPIC_DIFFICULTY_VALUES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

// ============================================
// TEMPLATES
// ============================================

export const TEMPLATE_CATEGORY_VALUES = ["STUDY_PLAN", "PROJECT", "REVISION", "EXAM_PREP", "OTHER"] as const;
export const TEMPLATE_ITEM_TYPE_VALUES = ["TASK", "PAGE", "SESSION", "SCHEDULE_BLOCK"] as const;

// ============================================
// CALENDAR SYNC
// ============================================

export const CALENDAR_PROVIDER_VALUES = ["GOOGLE", "OUTLOOK", "ICAL", "OTHER"] as const;

// ============================================
// EXAM STORYBOARD
// ============================================

export const QUESTION_DIFFICULTY_VALUES = ["EASY", "MEDIUM", "HARD"] as const;

// ============================================
// NOTION-CLASS FEATURES
// ============================================

// Block Types for Rich Text Editor
export const BLOCK_TYPE_VALUES = [
  "PARAGRAPH",
  "HEADING_1",
  "HEADING_2",
  "HEADING_3",
  "BULLET_LIST",
  "NUMBERED_LIST",
  "TODO",
  "QUOTE",
  "CALLOUT",
  "CODE",
  "DIVIDER",
  "IMAGE",
] as const;

// Resource Types
export const RESOURCE_TYPE_VALUES = ["LINK", "PDF", "IMAGE", "FILE", "VIDEO"] as const;

// Activity Log Types
export const ACTIVITY_TYPE_VALUES = [
  "PAGE_CREATED",
  "PAGE_UPDATED",
  "PAGE_DELETED",
  "TASK_CREATED",
  "TASK_COMPLETED",
  "EXAM_CREATED",
  "SESSION_COMPLETED",
  "COMMENT_ADDED",
  "RESOURCE_ADDED",
] as const;

// Mention Target Types
export const MENTION_TARGET_TYPE_VALUES = ["USER", "GROUP", "PAGE", "TASK"] as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type PageTypeValue = (typeof PAGE_TYPE_VALUES)[number];
export type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];
export type TaskTypeValue = (typeof TASK_TYPE_VALUES)[number];
export type TaskPriorityValue = (typeof TASK_PRIORITY_VALUES)[number];
export type TimetableSlotTypeValue = (typeof TIMETABLE_SLOT_TYPE_VALUES)[number];
export type StudySessionStatusValue = (typeof STUDY_SESSION_STATUS_VALUES)[number];
export type StudySessionMoodValue = (typeof STUDY_SESSION_MOOD_VALUES)[number];

export type StudyRunGoalType = (typeof STUDY_RUN_GOAL_TYPE_VALUES)[number];
export type StudyRunWeekStatus = (typeof STUDY_RUN_WEEK_STATUS_VALUES)[number];
export type BossDifficulty = (typeof BOSS_DIFFICULTY_VALUES)[number];
export type BossStatus = (typeof BOSS_STATUS_VALUES)[number];
export type FocusRoomStatus = (typeof FOCUS_ROOM_STATUS_VALUES)[number];
export type TemplateCategoryValue = (typeof TEMPLATE_CATEGORY_VALUES)[number];
export type TemplateItemType = (typeof TEMPLATE_ITEM_TYPE_VALUES)[number];
export type CalendarProvider = (typeof CALENDAR_PROVIDER_VALUES)[number];
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTY_VALUES)[number];
export type BlockType = (typeof BLOCK_TYPE_VALUES)[number];
export type ResourceType = (typeof RESOURCE_TYPE_VALUES)[number];
export type ActivityType = (typeof ACTIVITY_TYPE_VALUES)[number];
export type MentionTargetType = (typeof MENTION_TARGET_TYPE_VALUES)[number];
