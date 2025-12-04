"use client";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { CheckCircle, Clock, BookOpen, Sparkles } from "lucide-react";

interface SessionSummaryProps {
  course: {
    code: string;
    name: string;
    color: string;
  };
  actualMinutes: number;
  tasksCompleted: Array<{
    id: string;
    title: string;
  }>;
  notes: string;
  wasStuck: boolean;
  onStartNew: () => void;
  onBackToDashboard: () => void;
}

export function SessionSummary({
  course,
  actualMinutes,
  tasksCompleted,
  notes,
  wasStuck,
  onStartNew,
  onBackToDashboard,
}: SessionSummaryProps) {
  return (
    <Card className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-semibold text-foreground">Great session!</h2>
          <p className="text-sm text-muted-foreground">
            You focused for {actualMinutes} minute{actualMinutes !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Time focused
            </div>
            <div className="text-2xl font-semibold text-primary">{actualMinutes} min</div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-2 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Tasks done
            </div>
            <div className="text-2xl font-semibold text-emerald-500">{tasksCompleted.length}</div>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-foreground">Course</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/20 p-3 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: course.color }} />
            <span className="font-medium text-foreground">{course.code}</span>
            <span className="text-muted-foreground">{course.name}</span>
          </div>
        </div>

        {tasksCompleted.length > 0 && (
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-foreground">Completed tasks</span>
            </div>
            <div className="space-y-2">
              {tasksCompleted.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-border bg-muted/20 p-3 text-sm text-foreground"
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {notes && (
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Session notes</span>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-3 text-left text-sm text-foreground whitespace-pre-wrap">
              {notes}
            </div>
          </div>
        )}

        {wasStuck && (
          <div className="rounded-2xl border border-orange-400 bg-orange-500/15 p-4 text-left text-sm text-orange-900">
            <h4 className="mb-1 font-semibold">Need help?</h4>
            <p>
              You marked that you were stuck. Reach out to classmates, tutors, or plan a follow-up session to review the
              tricky parts.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button onClick={onStartNew} className="flex-1" size="lg">
            Start another session
          </Button>
          <Button onClick={onBackToDashboard} variant="outline" className="flex-1" size="lg">
            Back to dashboard
          </Button>
        </div>
      </div>
    </Card>
  );
}
