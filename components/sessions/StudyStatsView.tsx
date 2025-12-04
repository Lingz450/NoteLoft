"use client";

import { useMemo, useState } from "react";
import { AssessmentItem, Course, StudySession, Task } from "@prisma/client";
import { Card } from "@/components/common/Card";
import { TASK_TYPE_VALUES } from "@/lib/constants/enums";

type Props = {
  workspaceId: string;
  courses: Course[];
  tasks: Task[];
  sessions: StudySession[];
  assessments?: AssessmentItem[];
};

type Range = "week" | "month";

function minutesForSession(session: StudySession) {
  return session.durationMinutes ?? session.plannedDurationMinutes ?? 0;
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function getRangeStart(range: Range) {
  const now = new Date();
  if (range === "week") {
    const start = new Date(now);
    const day = start.getDay();
    const diff = (day + 6) % 7;
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - diff);
    return start;
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function computeStreak(sessions: StudySession[]) {
  const days = new Set<string>();
  sessions.forEach((session) => {
    const date = toDate(session.startedAt).toISOString().split("T")[0];
    days.add(date);
  });
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (!days.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeTimeBuckets(sessions: StudySession[]) {
  const buckets = [
    { label: "Morning", start: 5, end: 11, minutes: 0, sessions: 0 },
    { label: "Afternoon", start: 11, end: 17, minutes: 0, sessions: 0 },
    { label: "Evening", start: 17, end: 22, minutes: 0, sessions: 0 },
    { label: "Late night", start: 22, end: 24, minutes: 0, sessions: 0 },
  ];
  sessions.forEach((session) => {
    const hour = toDate(session.startedAt).getHours();
    const bucket = buckets.find((b) => hour >= b.start && hour < b.end) ?? buckets[0];
    bucket.sessions += 1;
    bucket.minutes += minutesForSession(session);
  });
  return buckets;
}

export function StudyStatsView({ courses, tasks, sessions }: Props) {
  const [range, setRange] = useState<Range>("week");
  const rangeStart = useMemo(() => getRangeStart(range), [range]);

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");
  const rangeSessions = useMemo(
    () => completedSessions.filter((session) => toDate(session.startedAt) >= rangeStart),
    [completedSessions, rangeStart],
  );
  const minutesInSelectedRange = rangeSessions.reduce((sum, session) => sum + minutesForSession(session), 0);
  const minutesThisMonth = completedSessions
    .filter((session) => toDate(session.startedAt).getMonth() === new Date().getMonth())
    .reduce((sum, session) => sum + minutesForSession(session), 0);

  const sessionsThisWeek = sessions.filter((session) => toDate(session.startedAt) >= getRangeStart("week"));
  const plannedThisWeek = sessionsThisWeek.filter((session) => session.plannedDurationMinutes && session.plannedDurationMinutes > 0);
  const completedPlanned = plannedThisWeek.filter((session) => session.status === "COMPLETED");
  const completionRate = plannedThisWeek.length > 0 ? (completedPlanned.length / plannedThisWeek.length) * 100 : null;

  const daysData = useMemo(() => {
    const now = new Date();
    const output: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const label = day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);
      const count = sessions.filter((session) => {
        const started = toDate(session.startedAt);
        return started >= day && started < next;
      }).length;
      output.push({ label, count });
    }
    return output;
  }, [sessions]);

  const topCourses = useMemo(() => {
    const totals = new Map<string, number>();
    completedSessions.forEach((session) => {
      const minutes = minutesForSession(session);
      const key = session.courseId ?? "general";
      totals.set(key, (totals.get(key) ?? 0) + minutes);
    });

    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([courseId, minutes]) => {
        const course = courses.find((course) => course.id === courseId);
        return {
          id: courseId,
          label: course ? `${course.code} - ${course.name}` : "General study",
          hours: minutes / 60,
        };
      });
  }, [completedSessions, courses]);

  const minutesByTaskType = useMemo(() => {
    const map: Record<string, number> = {};
    TASK_TYPE_VALUES.forEach((type) => (map[type] = 0));
    completedSessions.forEach((session) => {
      if (!session.taskId) return;
      const task = tasks.find((task) => task.id === session.taskId);
      if (!task) return;
      map[task.type] += minutesForSession(session);
    });
    return map;
  }, [completedSessions, tasks]);

  const timeBuckets = useMemo(() => computeTimeBuckets(completedSessions), [completedSessions]);
  const streak = useMemo(() => computeStreak(completedSessions), [completedSessions]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Stats</p>
            <h2 className="text-2xl font-semibold text-foreground">Study analytics</h2>
          </div>
          <div className="flex rounded-full border border-border bg-card/70 text-xs text-muted-foreground">
            {(["week", "month"] as Range[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                className={`px-3 py-1 font-medium transition first:rounded-l-full last:rounded-r-full ${
                  range === value ? "bg-primary text-primary-foreground" : "hover:text-foreground"
                }`}
              >
                {value === "week" ? "This week" : "This month"}
              </button>
            ))}
          </div>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Track time spent, progress per course, focus windows, and streaks. Use these insights to plan smarter revision blocks.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="space-y-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {range === "week" ? "This week" : "This month"}
          </p>
          <p className="text-2xl font-semibold text-foreground">{(minutesInSelectedRange / 60).toFixed(1)} hours studied</p>
          <p className="text-sm text-muted-foreground">{rangeSessions.length} sessions completed</p>
        </Card>
        <Card className="space-y-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Month total</p>
          <p className="text-2xl font-semibold text-foreground">{(minutesThisMonth / 60).toFixed(1)} hours</p>
          <p className="text-sm text-muted-foreground">{sessions.length} sessions logged</p>
        </Card>
        <Card className="space-y-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Completion rate</p>
          {completionRate === null ? (
            <p className="text-sm text-muted-foreground">No planned sessions yet.</p>
          ) : (
            <p className="text-2xl font-semibold text-foreground">
              {completedPlanned.length} / {plannedThisWeek.length}
              <span className="ml-1 text-base text-muted-foreground">({completionRate.toFixed(0)}%)</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">Based on planned focus blocks</p>
        </Card>
        <Card className="space-y-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current streak</p>
          <p className="text-2xl font-semibold text-foreground">{streak} days</p>
          <p className="text-sm text-muted-foreground">Consecutive days with focus logged</p>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-4 p-5 md:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sessions per day</p>
            <span className="text-xs text-muted-foreground">Past 7 days</span>
          </div>
          <div className="flex h-32 items-end gap-2">
            {daysData.map((day) => {
              const max = Math.max(1, ...daysData.map((d) => d.count));
              return (
                <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-6 rounded-md bg-gradient-to-b from-primary to-accent"
                    style={{ height: `${(day.count / max) * 100 || 4}%` }}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">{day.label}</span>
                  <span className="text-[10px] text-muted-foreground">{day.count}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="space-y-3 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top courses</p>
          {topCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {topCourses.map((course) => (
                <li key={course.id} className="flex items-center justify-between">
                  <span className="truncate font-medium text-foreground">{course.label}</span>
                  <span className="text-muted-foreground">{course.hours.toFixed(1)} h</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time by task type</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {TASK_TYPE_VALUES.map((type) => (
              <div key={type} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-1.5">
                <span className="font-medium text-foreground">{type.toLowerCase()}</span>
                <span>{(minutesByTaskType[type] / 60).toFixed(1)} h</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Focus windows</p>
          <p className="text-sm text-muted-foreground">Hours with the highest completion count.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {timeBuckets.map((bucket) => (
              <div key={bucket.label} className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
                <p className="font-semibold text-foreground">{bucket.label}</p>
                <p className="text-xs text-muted-foreground">
                  {bucket.sessions} sessions - {(bucket.minutes / 60).toFixed(1)} h
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
