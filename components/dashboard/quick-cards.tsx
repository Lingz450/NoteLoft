"use client";

import { Flame, Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCardsProps {
  onStartSession: () => void;
  focusSessions?: Array<{
    id: string;
    courseCode: string;
    courseColor: string;
    minutes: number;
    date: Date;
  }>;
}

export function QuickCards({ onStartSession, focusSessions = [] }: QuickCardsProps) {
  // Calculate focus streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let checkDate = new Date(today);

  while (true) {
    const hasSession = focusSessions.some((s) => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === checkDate.getTime();
    });
    if (!hasSession) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate weekly study time
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const thisWeekSessions = focusSessions.filter((s) => s.date >= startOfWeek);
  const totalMinutesThisWeek = thisWeekSessions.reduce((sum, s) => sum + s.minutes, 0);
  const weeklyHours = Math.floor(totalMinutesThisWeek / 60);
  const weeklyMinutes = totalMinutesThisWeek % 60;

  // Calculate time per course (last 7 days)
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  const recentSessions = focusSessions.filter((s) => s.date >= last7Days);

  const timePerCourse = recentSessions.reduce((acc, session) => {
    if (!acc[session.courseCode]) {
      acc[session.courseCode] = 0;
    }
    acc[session.courseCode] += session.minutes;
    return acc;
  }, {} as Record<string, number>);

  const topCourses = Object.entries(timePerCourse)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code, minutes]) => ({
      name: code,
      hours: +(minutes / 60).toFixed(1),
      max: 6,
      color: "bg-primary",
    }));

  // Get most studied course for suggestion
  const suggestedCourse = topCourses[0]?.name || "Math 201";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Focus Streak Card */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 ring-1 ring-orange-500/20">
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Focus streak</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {streak > 0 ? `${streak}-day streak` : "Start today"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {weeklyHours}h {weeklyMinutes}m studied this week
          </p>
        </div>
      </div>

      {/* Time Per Course Card */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Time per course</p>
          <div className="mt-3 space-y-2.5">
            {topCourses.length > 0 ? (
              topCourses.map((course, index) => (
                <div key={course.name} className="flex items-center gap-2">
                  <span className="w-20 truncate text-xs text-muted-foreground">{course.name}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-emerald-500"
                      )}
                      style={{ width: `${(course.hours / course.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">{course.hours}h</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No study sessions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Today&apos;s Focus Card */}
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative">
          <p className="text-sm font-medium text-muted-foreground">Today&apos;s focus</p>
          <p className="mt-1.5 text-sm text-foreground leading-relaxed">
            Keep your momentum going with a focused study session.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
              {suggestedCourse}
            </span>
            <span className="text-xs text-muted-foreground">Ch. 4 Problems</span>
          </div>
          <button
            onClick={onStartSession}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] shadow-md shadow-primary/20"
          >
            <Play className="h-4 w-4" />
            Start session
          </button>
        </div>
      </div>
    </div>
  );
}

