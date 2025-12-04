"use client";

import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Flame, Clock, BookOpen, Zap } from "lucide-react";

type FocusSession = {
  id: string;
  courseCode: string;
  courseColor: string;
  minutes: number;
  date: string | Date;
};

interface FocusCardsProps {
  workspaceId: string;
  sessions: FocusSession[];
}

export function FocusCards({ workspaceId, sessions }: FocusCardsProps) {
  const normalizedSessions = sessions.map((session) => ({
    ...session,
    date: session.date instanceof Date ? session.date : new Date(session.date),
  }));

  // Calculate stats
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekSessions = normalizedSessions.filter((s) => s.date >= startOfWeek);
  const totalMinutesThisWeek = thisWeekSessions.reduce((sum, s) => sum + s.minutes, 0);
  const sessionsThisWeek = thisWeekSessions.length;

  // Calculate streak (consecutive days with sessions)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let checkDate = new Date(today);

  while (true) {
    const hasSession = normalizedSessions.some((s) => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === checkDate.getTime();
    });

    if (!hasSession) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Time per course (last 7 days)
  const last7Days = new Date(now);
  last7Days.setDate(now.getDate() - 7);
  const recentSessions = normalizedSessions.filter((s) => s.date >= last7Days);

  const timePerCourse = recentSessions.reduce((acc, session) => {
    if (!acc[session.courseCode]) {
      acc[session.courseCode] = {
        code: session.courseCode,
        color: session.courseColor,
        minutes: 0,
      };
    }
    acc[session.courseCode].minutes += session.minutes;
    return acc;
  }, {} as Record<string, { code: string; color: string; minutes: number }>);

  const courseStats = Object.values(timePerCourse).sort((a, b) => b.minutes - a.minutes);

  // Get most studied course for suggestion
  const suggestedCourse = courseStats[0];

  return (
    <>
      {/* Focus Streak */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Focus Streak
            </h2>
          </div>
        </div>
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-orange-600 mb-2">{streak}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            day{streak !== 1 ? "s" : ""} in a row
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">This week</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {sessionsThisWeek} session{sessionsThisWeek !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-500">·</span>
              <span className="font-semibold text-blue-600">
                {Math.floor(totalMinutesThisWeek / 60)}h {totalMinutesThisWeek % 60}m
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Time per Course */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Time per Course
            </h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</span>
        </div>
        {courseStats.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No study sessions recorded yet
          </p>
        ) : (
          <div className="space-y-3">
            {courseStats.slice(0, 5).map((course) => {
              const hours = Math.floor(course.minutes / 60);
              const minutes = course.minutes % 60;
              const maxMinutes = courseStats[0].minutes;
              const percentage = (course.minutes / maxMinutes) * 100;

              return (
                <div key={course.code}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: course.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.code}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {hours > 0 && `${hours}h `}
                      {minutes}m
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: course.color,
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Today&apos;s Focus */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Today&apos;s Focus
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Keep your momentum going with a focused study session
        </p>
        {suggestedCourse ? (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Suggested session
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: suggestedCourse.color }}
              />
              <span className="font-semibold text-gray-900 dark:text-white">
                {suggestedCourse.code}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              25 minutes · Focus session
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start your first study session to track your progress
            </p>
          </div>
        )}
        <Button asChild className="w-full">
          <Link href={`/workspace/${workspaceId}/sessions`}>
            <Clock className="w-4 h-4 mr-2" />
            Start Study Session
          </Link>
        </Button>
      </Card>
    </>
  );
}

