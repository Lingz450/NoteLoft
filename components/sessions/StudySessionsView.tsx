'use client';

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Course, Exam, Task, StudySession } from "@prisma/client";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Card } from "@/components/common/Card";
import { suggestStudySessionFocus, summariseStudySessionNotes } from "@/lib/ai";
import { useToast } from "@/components/common/ToastProvider";

type Props = {
  workspaceId: string;
  courses: Course[];
  tasks: Task[];
  exams: Exam[];
};

type SessionWithRelations = StudySession & {
  course: Course | null;
  task: Task | null;
  exam: Exam | null;
};

export function StudySessionsView({ workspaceId, courses, tasks, exams }: Props) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<string | "none">("none");
  const [selectedTaskId, setSelectedTaskId] = useState<string | "none">("none");
  const [selectedExamId, setSelectedExamId] = useState<string | "none">("none");
  const [plannedMinutes, setPlannedMinutes] = useState<number>(25);
  const [mood, setMood] = useState<"LOW" | "OKAY" | "HIGH" | "none">("OKAY");

  const [activeSession, setActiveSession] = useState<SessionWithRelations | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(plannedMinutes * 60);
  const [notes, setNotes] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSummarising, setIsSummarising] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ["study-sessions", workspaceId],
    queryFn: async (): Promise<SessionWithRelations[]> => {
      const res = await fetch(`/api/study-sessions?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load study sessions");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          courseId: selectedCourseId === "none" ? null : selectedCourseId,
          taskId: selectedTaskId === "none" ? null : selectedTaskId,
          examId: selectedExamId === "none" ? null : selectedExamId,
          plannedDurationMinutes: plannedMinutes,
          mood: mood === "none" ? null : mood,
        }),
      });
      if (!res.ok) throw new Error("Failed to create study session");
      return res.json();
    },
    onSuccess: (session: SessionWithRelations) => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions", workspaceId] });
      setActiveSession(session);
      setRemainingSeconds((session.plannedDurationMinutes ?? plannedMinutes) * 60);
      setNotes("");
      setIsPaused(false);
      toast.push({ title: "Focus session started", variant: "success" });
    },
    onError: () => {
      toast.push({ title: "Failed to start session", variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; status: string; notes?: string }) => {
      const res = await fetch("/api/study-sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload.id,
          workspaceId,
          status: payload.status,
          endedAt: new Date().toISOString(),
          notes: payload.notes ?? null,
        }),
      });
      if (!res.ok) throw new Error("Failed to update study session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-sessions", workspaceId] });
      setActiveSession(null);
      toast.push({ title: "Session updated", variant: "success" });
    },
    onError: () => toast.push({ title: "Failed to update session", variant: "error" }),
  });

  const taskDoneMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, workspaceId, status: "DONE" }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      toast.push({ title: "Task marked done", variant: "success" });
    },
    onError: () => toast.push({ title: "Failed to update task", variant: "error" }),
  });

  useEffect(() => {
    if (!activeSession || isPaused) return;
    if (remainingSeconds <= 0) {
      updateMutation.mutate({ id: activeSession.id, status: "COMPLETED", notes });
      return;
    }
    const id = setInterval(() => setRemainingSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [activeSession, remainingSeconds, isPaused, notes, updateMutation]);

  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (!taskId) return;
    setSelectedTaskId(taskId);
    setSelectedExamId("none");
    const task = tasks.find((t) => t.id === taskId);
    if (task?.courseId) {
      setSelectedCourseId(task.courseId);
    }
  }, [searchParams, tasks]);

  const hoursByCourse = useMemo(() => {
    const map = new Map<string, number>();
    sessions
      .filter((s) => s.status === "COMPLETED" && s.endedAt)
      .forEach((s) => {
        const minutes = s.durationMinutes ?? s.plannedDurationMinutes ?? 0;
        const key = s.courseId ?? "UNASSIGNED";
        map.set(key, (map.get(key) ?? 0) + minutes);
      });
    return map;
  }, [sessions]);

  const totalMinutesThisWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return sessions
      .filter((s) => new Date(s.startedAt) >= startOfWeek)
      .reduce((sum, s) => sum + (s.durationMinutes ?? s.plannedDurationMinutes ?? 0), 0);
  }, [sessions]);

  const totalSessionsThisWeek = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return sessions.filter((s) => new Date(s.startedAt) >= startOfWeek).length;
  }, [sessions]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Study sessions</p>
        <h1 className="text-3xl font-semibold text-foreground">Focus mode</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pick a course and a task or exam, choose a focus length, and NOTELOFT will guide you through a distraction-free focus block.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">Start a session</h2>
              <p className="text-sm text-muted-foreground">Log what you are about to study.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSuggesting}
              onClick={async () => {
                setIsSuggesting(true);
                try {
                  const idea = await suggestStudySessionFocus({ courses, tasks, exams });
                  if (!idea) {
                    setSuggestion("No obvious next step found. Pick any course and get started.");
                  } else {
                    setSuggestion(idea.reason);
                    if (idea.courseId) setSelectedCourseId(idea.courseId);
                    if (idea.taskId) {
                      setSelectedTaskId(idea.taskId);
                      setSelectedExamId("none");
                    }
                    if (idea.examId) {
                      setSelectedExamId(idea.examId);
                      setSelectedTaskId("none");
                    }
                    setPlannedMinutes(idea.plannedDurationMinutes);
                    setRemainingSeconds(idea.plannedDurationMinutes * 60);
                  }
                } finally {
                  setIsSuggesting(false);
                }
              }}
            >
              {isSuggesting ? "Thinking..." : "What should I work on?"}
            </Button>
          </div>

          <div className="space-y-3">
            <Select
              label="Course"
              value={selectedCourseId}
              onChange={(val) => setSelectedCourseId(val as any)}
              options={[
                { label: "No specific course", value: "none" },
                ...courses.map((c) => ({ label: `${c.code} - ${c.name}`, value: c.id })),
              ]}
            />
            <Select
              label="Task"
              value={selectedTaskId}
              onChange={(val) => {
                setSelectedTaskId(val as any);
                if (val !== "none") setSelectedExamId("none");
              }}
              options={[
                { label: "None", value: "none" },
                ...tasks.map((t) => ({ label: t.title, value: t.id })),
              ]}
            />
            <Select
              label="Exam"
              value={selectedExamId}
              onChange={(val) => {
                setSelectedExamId(val as any);
                if (val !== "none") setSelectedTaskId("none");
              }}
              options={[
                { label: "None", value: "none" },
                ...exams.map((e) => ({ label: e.title, value: e.id })),
              ]}
            />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Focus length</p>
              <div className="flex gap-2">
                {[25, 50, 90].map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant={plannedMinutes === m ? "solid" : "outline"}
                    onClick={() => {
                      setPlannedMinutes(m);
                      setRemainingSeconds(m * 60);
                    }}
                  >
                    {m} min
                  </Button>
                ))}
              </div>
            </div>
            <Select
              label="Mood / energy"
              value={mood}
              onChange={(val) => setMood(val as any)}
              options={[
                { label: "Feeling low", value: "LOW" },
                { label: "Okay", value: "OKAY" },
                { label: "High energy", value: "HIGH" },
              ]}
            />
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_15px_30px_-18px_rgba(79,70,229,0.8)]"
              disabled={!!activeSession || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Starting..." : activeSession ? "Session in progress" : "Start focus session"}
            </Button>
          </div>
        </Card>

        <Card className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Focus mode</h2>
              <p className="text-sm text-muted-foreground">Timer, notes, and quick actions.</p>
            </div>
            {activeSession && <span className="text-xs font-semibold uppercase text-muted-foreground">Active</span>}
          </div>
          {activeSession ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Time remaining</p>
                <p className="text-4xl font-mono tracking-tight text-foreground">{formatTime(remainingSeconds)}</p>
              </div>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Session notes, questions, or anything you covered."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {activeSession.taskId && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    onClick={() => activeSession.taskId && taskDoneMutation.mutate(activeSession.taskId)}
                  >
                    Mark task done
                  </Button>
                )}
                <Button type="button" size="sm" variant="outline" onClick={() => setIsPaused((p) => !p)}>
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateMutation.mutate({
                      id: activeSession.id,
                      status: "INTERRUPTED",
                      notes,
                    })
                  }
                >
                  I&apos;m stuck
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateMutation.mutate({
                      id: activeSession.id,
                      status: "CANCELLED",
                      notes,
                    })
                  }
                >
                  End session
                </Button>
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSummarising}
                  onClick={async () => {
                    setIsSummarising(true);
                    try {
                      if (!activeSession) return;
                      const text = await summariseStudySessionNotes({ session: activeSession, notes });
                      setSummary(text);
                    } finally {
                      setIsSummarising(false);
                    }
                  }}
                >
                  {isSummarising ? "Summarising..." : "Summarise this session"}
                </Button>
                {summary && (
                  <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    {summary}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active session. Start one on the left by choosing a course and focus length.
            </p>
          )}
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">This week</p>
          <p className="text-2xl font-semibold text-foreground">
            {(totalMinutesThisWeek / 60).toFixed(1)} hours studied
          </p>
          <p className="text-sm text-muted-foreground">{totalSessionsThisWeek} sessions</p>
        </Card>
        <Card className="space-y-3 p-5 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hours by course</p>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses yet.</p>
          ) : (
            <div className="space-y-2 text-sm text-foreground">
              {courses.map((c) => {
                const minutes = hoursByCourse.get(c.id) ?? 0;
                if (!minutes) return null;
                return (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                    <span className="font-medium">
                      {c.code} - {c.name}
                    </span>
                    <span className="text-muted-foreground">{(minutes / 60).toFixed(1)} h</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      {suggestion && (
        <Card className="space-y-2 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested focus</p>
          <p className="text-sm text-muted-foreground">{suggestion}</p>
        </Card>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recent sessions</h2>
            <p className="text-sm text-muted-foreground">Time-boxes you have logged inside this workspace.</p>
          </div>
        </div>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-5 gap-3 border-b border-border px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
            <span>When</span>
            <span>Course</span>
            <span>Target</span>
            <span>Status</span>
            <span>Planned</span>
          </div>
          <div className="divide-y divide-border text-sm">
            {sessions.length === 0 && (
              <div className="px-4 py-3 text-muted-foreground">No sessions logged yet.</div>
            )}
            {sessions.map((s) => {
              const course = courses.find((c) => c.id === s.courseId);
              const target =
                (s.taskId && tasks.find((t) => t.id === s.taskId)?.title) ||
                (s.examId && exams.find((e) => e.id === s.examId)?.title) ||
                "General study";
              return (
                <div key={s.id} className="grid grid-cols-5 gap-3 px-4 py-2 text-foreground">
                  <span className="text-sm text-muted-foreground">
                    {new Date(s.startedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {" at "}
                    {new Date(s.startedAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="truncate text-muted-foreground">{course ? course.code : "-"}</span>
                  <span className="truncate text-muted-foreground">{target}</span>
                  <span className="text-xs uppercase text-muted-foreground">{s.status.toLowerCase()}</span>
                  <span className="text-xs text-muted-foreground">{s.plannedDurationMinutes ?? 0} min</span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
