"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Pause, Play, Square, CheckCircle, AlertCircle } from "lucide-react";

interface FocusViewProps {
  course: {
    code: string;
    name: string;
    color: string;
  };
  tasks: Array<{
    id: string;
    title: string;
  }>;
  examTitle?: string;
  durationMinutes: number;
  onEndSession: (summary: {
    actualMinutes: number;
    tasksCompleted: string[];
    notes: string;
    wasStuck: boolean;
  }) => void;
}

export function FocusView({
  course,
  tasks,
  examTitle,
  durationMinutes,
  onEndSession,
}: FocusViewProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((durationMinutes * 60 - timeLeft) / (durationMinutes * 60)) * 100;

  const toggleTaskComplete = (taskId: string) => {
    setCompletedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  };

  const handleEnd = () => {
    const actualMinutes = Math.round((durationMinutes * 60 - timeLeft) / 60);
    onEndSession({
      actualMinutes,
      tasksCompleted: completedTasks,
      notes,
      wasStuck: isStuck,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="text-center space-y-6">
        <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="font-mono text-6xl md:text-7xl font-semibold text-foreground">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-foreground">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: course.color }} />
            <span className="text-lg font-semibold">{course.code}</span>
            <span className="text-sm text-muted-foreground">{course.name}</span>
          </div>
          {examTitle && <p className="text-sm text-muted-foreground">Preparing for: {examTitle}</p>}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => setIsPaused(!isPaused)} variant="outline" size="lg">
            {isPaused ? (
              <>
                <Play className="mr-2 h-5 w-5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </>
            )}
          </Button>
          <Button onClick={handleEnd} variant="outline" size="lg">
            <Square className="mr-2 h-5 w-5" />
            End session
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {tasks.length > 0 && (
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Session tasks</h3>
            <div className="space-y-2">
              {tasks.map((task) => {
                const isComplete = completedTasks.includes(task.id);
                return (
                  <button
                    key={task.id}
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition-all ${
                      isComplete
                        ? "border-transparent bg-emerald-500/15 text-foreground"
                        : "border-border bg-muted/30 hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                          isComplete ? "text-emerald-500 fill-emerald-500" : "text-muted-foreground"
                        }`}
                      />
                      <span className={isComplete ? "line-through text-muted-foreground" : ""}>{task.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Session notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Capture insights, questions, or follow-ups..."
            className="mb-4 h-32 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          />

          <button
            onClick={() => setIsStuck(!isStuck)}
            className={`w-full rounded-2xl border-2 px-4 py-3 text-sm font-medium transition-all ${
              isStuck
                ? "border-orange-500 bg-orange-500/15 text-orange-600"
                : "border-border text-muted-foreground hover:border-orange-400 hover:text-foreground"
            }`}
          >
            <AlertCircle className="mr-2 inline h-5 w-5" />
            {isStuck ? "Marked: need help" : "I'm stuck on something"}
          </button>
          {isStuck && (
            <p className="mt-2 text-xs text-muted-foreground">
              We'll suggest resources and help after the session.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
