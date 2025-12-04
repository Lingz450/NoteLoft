"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  priority: string;
  dueDate: Date | string;
  status?: string;
  course?: {
    code: string;
  };
}

interface ThisWeekCardProps {
  tasks: Task[];
  workspaceId: string;
  onTaskToggle?: (taskId: string) => void;
}

const priorityColors = {
  HIGH: "bg-red-500/15 text-red-400 ring-red-500/20",
  NORMAL: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
  LOW: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  High: "bg-red-500/15 text-red-400 ring-red-500/20",
  Medium: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
  Low: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
};

export function ThisWeekCard({ tasks, workspaceId, onTaskToggle }: ThisWeekCardProps) {
  const getDueIn = (dueDate: Date | string) => {
    const now = new Date();
    const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  const displayTasks = tasks.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">This week</h2>
          <Link
            href={`/workspace/${workspaceId}/tasks`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>
      <div className="divide-y divide-border">
        {displayTasks.length > 0 ? (
          displayTasks.map((task) => {
            const isDone = task.status === "DONE" || task.status === "done";
            return (
              <div
                key={task.id}
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-secondary/30"
              >
                <button
                  onClick={() => onTaskToggle?.(task.id)}
                  className={cn(
                    "h-4 w-4 rounded border-2 transition-colors cursor-pointer flex items-center justify-center",
                    isDone
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40 hover:border-primary"
                  )}
                  aria-label="Toggle task completion"
                >
                  {isDone && (
                    <svg
                      className="h-3 w-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      isDone ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                </div>
                {task.course && (
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20">
                    {task.course.code}
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
                    priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.Medium
                  )}
                >
                  {task.priority}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                  {getDueIn(task.dueDate)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No tasks due this week
          </div>
        )}
      </div>
    </div>
  );
}

