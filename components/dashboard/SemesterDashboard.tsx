'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Plus, CheckSquare, GraduationCap, ClipboardList } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { FocusCards } from "@/components/dashboard/FocusCards";

type WorkspaceSummary = {
  id: string;
  name: string;
};

type Assessment = {
  score: number | null;
  maxScore: number;
  weight: number;
};

type DashboardCourse = {
  id: string;
  code: string;
  name: string;
  color?: string | null;
  assessmentItems: Assessment[];
};

type DashboardTask = {
  id: string;
  title: string;
  priority: string;
  dueDate: Date | string | null;
  course?: { code: string; color?: string | null } | null;
};

type DashboardExam = {
  id: string;
  title: string;
  date: Date | string;
  course: { code: string; name?: string; color?: string | null };
};

type FocusSessionOverview = {
  id: string;
  courseCode: string;
  courseColor: string;
  minutes: number;
  date: string | Date;
};

interface DashboardProps {
  workspace: WorkspaceSummary;
  courses: DashboardCourse[];
  upcomingTasks: DashboardTask[];
  upcomingExams: DashboardExam[];
  focusSessions?: FocusSessionOverview[];
}

export function SemesterDashboard({
  workspace,
  courses,
  upcomingTasks,
  upcomingExams,
  focusSessions = [],
}: DashboardProps) {
  const initialFocusSessions = useMemo(
    () =>
      focusSessions.map((session) => ({
        ...session,
        date: session.date instanceof Date ? session.date : new Date(session.date),
      })),
    [focusSessions],
  );

  const [liveFocusSessions, setLiveFocusSessions] = useState(initialFocusSessions);

  // Fetch real study sessions (if API + DB are available)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/study-sessions?workspaceId=${workspace.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const mapped = data.map((s: any) => ({
          id: s.id as string,
          courseCode: s.course?.code ?? "General",
          courseColor: s.course?.color ?? "#3B82F6",
          minutes: (s.durationMinutes ?? s.plannedDurationMinutes ?? 0) as number,
          date: new Date(s.startedAt),
        }));
        setLiveFocusSessions(mapped);
      } catch {
        // ignore failures; fall back to mock focusSessions
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [workspace.id]);

  // Calculate overall GPA estimate
  const gpaData = courses.map((course) => {
    const items = course.assessmentItems;
    const completed = items.filter((item: any) => item.score !== null);
    const totalWeight = completed.reduce((sum: number, item: any) => sum + item.weight, 0);
    const weightedScore = completed.reduce(
      (sum: number, item: any) => sum + (item.score / item.maxScore) * item.weight,
      0
    );
    const currentGrade = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : null;

    return {
      course,
      currentGrade,
      completedWeight: totalWeight,
    };
  });

  const avgGrade =
    gpaData.reduce((sum, data) => sum + (data.currentGrade || 0), 0) /
    gpaData.filter((data) => data.currentGrade !== null).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Semester Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Overview of your courses, tasks, and upcoming exams
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        <Button asChild size="sm">
          <Link href={`/workspace/${workspace.id}/tasks?action=new`}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/workspace/${workspace.id}/exams?action=new`}>
            <Plus className="w-4 h-4 mr-2" />
            Add Exam
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/workspace/${workspace.id}/pages/new`}>
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Focus Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FocusCards workspaceId={workspace.id} sessions={liveFocusSessions} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* This week's tasks */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  This Week
                </h2>
              </div>
              <Link
                href={`/workspace/${workspace.id}/tasks`}
                className="text-sm text-blue-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No tasks due this week. You&apos;re all caught up! 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/workspace/${workspace.id}/tasks?id=${task.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600"
                      >
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {task.course && (
                          <Badge
                            variant="outline"
                            style={{ borderColor: task.course.color ?? "#cbd5f5" }}
                          >
                            {task.course.code}
                          </Badge>
                        )}
                        <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {task.dueDate && formatDistanceToNow(task.dueDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Courses */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Courses
                </h2>
              </div>
              <Link
                href={`/workspace/${workspace.id}/courses`}
                className="text-sm text-blue-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => {
                const courseData = gpaData.find((d) => d.course.id === course.id);
                const grade = courseData?.currentGrade;

                return (
                  <Link
                    key={course.id}
                    href={`/workspace/${workspace.id}/courses/${course.id}`}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div
                      className="w-full h-1 rounded-full mb-3"
                      style={{ backgroundColor: course.color ?? "#e0e7ff" }}
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {course.code}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {course.name}
                    </p>
                    {typeof grade === "number" && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Current grade</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {grade.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* GPA Card */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Overall Progress
            </h2>
            {!isNaN(avgGrade) ? (
              <div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {avgGrade.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Current Average
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Based on completed assessments across {courses.length} courses
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No grades recorded yet
              </p>
            )}
          </Card>

          {/* Upcoming Exams */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upcoming Exams
                </h2>
              </div>
              <Link
                href={`/workspace/${workspace.id}/exams`}
                className="text-sm text-blue-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            {upcomingExams.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming exams
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {exam.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {exam.course.code}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(exam.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent study sessions */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent sessions
              </h2>
              <Link
                href={`/workspace/${workspace.id}/stats`}
                className="text-sm text-blue-600 hover:underline"
              >
                View stats
              </Link>
            </div>
            {liveFocusSessions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No study sessions recorded yet.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {liveFocusSessions.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.courseColor }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {s.courseCode}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.floor(s.minutes / 60) > 0 && `${Math.floor(s.minutes / 60)}h `}
                      {s.minutes % 60}m ·{" "}
                      {s.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

