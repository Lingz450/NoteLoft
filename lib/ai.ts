/**
 * AI hooks for NOTELOFT.
 *
 * These are intentionally stubbed: the rest of the app calls these
 * functions so that wiring a real model later is just a matter of
 * replacing the internals here.
 */

import { Course, Exam, Task, StudySession } from "@prisma/client";

// ---------------------------------------------
// Study session planning
// ---------------------------------------------

export type SuggestedSession = {
  courseId: string | null;
  taskId: string | null;
  examId: string | null;
  plannedDurationMinutes: number;
  reason: string;
};

export async function suggestStudySessionFocus(args: {
  courses: Course[];
  tasks: Task[];
  exams: Exam[];
}): Promise<SuggestedSession | null> {
  const { tasks, courses, exams } = args;

  if (!tasks.length && !exams.length) return null;

  // Very naive heuristic for now:
  // 1. pick the highest priority task with the nearest due date
  // 2. fall back to the next upcoming exam

  const sortedTasks = [...tasks].sort((a, b) => {
    const aDue = a.dueDate ? a.dueDate.getTime() : Infinity;
    const bDue = b.dueDate ? b.dueDate.getTime() : Infinity;
    return aDue - bDue;
  });

  const chosenTask = sortedTasks[0] ?? null;

  if (chosenTask) {
    const course = chosenTask.courseId ? courses.find((c) => c.id === chosenTask.courseId) : null;
    return {
      courseId: chosenTask.courseId ?? null,
      taskId: chosenTask.id,
      examId: null,
      plannedDurationMinutes: 25,
      reason: course
        ? `Spend 25 minutes on "${chosenTask.title}" for ${course.code} – it's one of your nearest deadlines.`
        : `Spend 25 minutes on "${chosenTask.title}" – it's one of your nearest deadlines.`,
    };
  }

  const sortedExams = [...exams].sort((a, b) => a.date.getTime() - b.date.getTime());
  const chosenExam = sortedExams[0] ?? null;

  if (chosenExam) {
    const course = courses.find((c) => c.id === chosenExam.courseId);
    return {
      courseId: chosenExam.courseId,
      taskId: null,
      examId: chosenExam.id,
      plannedDurationMinutes: 25,
      reason: course
        ? `Do 25 minutes of revision for ${course.code} (${chosenExam.title}) – it's your next upcoming exam.`
        : `Do 25 minutes of revision for "${chosenExam.title}" – it's your next upcoming exam.`,
    };
  }

  return null;
}

// ---------------------------------------------
// In-session helpers
// ---------------------------------------------

export async function explainSelectionInNotes(selection: string): Promise<string> {
  if (!selection.trim()) {
    return "Select some text in your notes, then click this button to get a clearer explanation.";
  }
  // Placeholder – later, send selection to an LLM
  return `Here is a clearer explanation of what you highlighted:\n\n${selection}\n\n(Replace this with a real AI call.)`;
}

export async function generatePracticeQuestionsForExam(args: {
  exam: Exam | null;
  pageContent: any;
}): Promise<string[]> {
  const title = args.exam?.title ?? "this exam";
  return [
    `Explain one key concept that is likely to appear on ${title}.`,
    `Derive or prove a core result related to ${title}.`,
    `Give a real-world example that uses ideas from ${title}.`,
  ];
}

// ---------------------------------------------
// After-session helpers
// ---------------------------------------------

export async function summariseStudySessionNotes(args: {
  session: StudySession;
  notes: string;
}): Promise<string> {
  if (!args.notes.trim()) {
    return "You didn't write any notes in this session. Try jotting down a few bullet points next time, then use this button to get a compact summary.";
  }

  return `Summary of this session:\n\n- ${args.notes
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n- ")}\n\n(This is a placeholder summary; plug in an AI model here.)`;
}

export type FlashcardSuggestion = {
  front: string;
  back: string;
};

export async function suggestFlashcardsFromNotes(notes: string): Promise<FlashcardSuggestion[]> {
  if (!notes.trim()) return [];
  // Simple stub: treat each line as something we might flashcard later
  const lines = notes
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.slice(0, 5).map((line, idx) => ({
    front: `Idea ${idx + 1}`,
    back: line,
  }));
}
export type PageContent = {
  type?: string;
  [key: string]: any;
};

export type ExtractedTaskSuggestion = {
  title: string;
  courseHint?: string;
  priority?: "LOW" | "NORMAL" | "HIGH";
};

export async function summarisePageContent(args: {
  title: string;
  content: PageContent;
}): Promise<string> {
  return `Summary for "${args.title}": highlight the top bullet points, key takeaways, and unanswered questions.\n\n(This is placeholder text—wire to your AI provider when ready.)`;
}

export async function extractTasksFromPage(args: {
  content: PageContent;
}): Promise<ExtractedTaskSuggestion[]> {
  return [
    {
      title: "Review lecture notes and capture flashcards",
      courseHint: "Course",
      priority: "NORMAL",
    },
    {
      title: "Draft questions for tutorial",
      priority: "HIGH",
    },
  ];
}
