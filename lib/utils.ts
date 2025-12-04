import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDistanceToNow(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return "Overdue";
  } else if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Tomorrow";
  } else if (diffInDays < 7) {
    return `in ${diffInDays} days`;
  } else {
    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

export function calculateGrade(
  assessments: Array<{
    score: number | null;
    maxScore: number;
    weight: number;
  }>
): { current: number | null; possible: number } {
  const completed = assessments.filter((a) => a.score !== null);
  if (completed.length === 0) {
    return { current: null, possible: 100 };
  }

  const totalWeight = completed.reduce((sum, a) => sum + a.weight, 0);
  const weightedScore = completed.reduce(
    (sum, a) => sum + ((a.score || 0) / a.maxScore) * a.weight,
    0
  );

  return {
    current: (weightedScore / totalWeight) * 100,
    possible: assessments.reduce((sum, a) => sum + a.weight, 0),
  };
}

