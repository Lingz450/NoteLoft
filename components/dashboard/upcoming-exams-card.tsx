"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";

interface Exam {
  id: string;
  title: string;
  date: Date | string;
  weight?: number;
  course: {
    code: string;
  };
}

interface UpcomingExamsCardProps {
  exams: Exam[];
  workspaceId: string;
}

export function UpcomingExamsCard({ exams, workspaceId }: UpcomingExamsCardProps) {
  const formatExamDate = (date: Date | string) => {
    const examDate = typeof date === "string" ? new Date(date) : date;
    return examDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const upcomingExams = exams.slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Upcoming exams</h2>
          <Link
            href={`/workspace/${workspaceId}/exams`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>
      <div className="divide-y divide-border">
        {upcomingExams.length > 0 ? (
          upcomingExams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/30"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{exam.title}</p>
                <p className="text-xs text-muted-foreground">{exam.course.code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground tabular-nums">
                  {formatExamDate(exam.date)}
                </p>
                {exam.weight && (
                  <p className="text-xs text-muted-foreground">{exam.weight}%</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No upcoming exams
          </div>
        )}
      </div>
    </div>
  );
}

