"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  assessmentItems?: Array<{
    score: number | null;
    maxScore: number;
    weight: number;
  }>;
}

interface CoursesCardProps {
  courses: Course[];
  workspaceId: string;
}

export function CoursesCard({ courses, workspaceId }: CoursesCardProps) {
  const calculateCourseData = (course: Course) => {
    const items = course.assessmentItems || [];
    const completed = items.filter((item) => item.score !== null);
    const totalWeight = completed.reduce((sum, item) => sum + item.weight, 0);
    const weightedScore = completed.reduce(
      (sum, item) => sum + ((item.score || 0) / item.maxScore) * item.weight,
      0
    );
    const percentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    const progress = totalWeight; // Use total weight as progress indicator
    
    // Calculate letter grade
    let grade = "N/A";
    if (percentage >= 93) grade = "A";
    else if (percentage >= 90) grade = "A-";
    else if (percentage >= 87) grade = "B+";
    else if (percentage >= 83) grade = "B";
    else if (percentage >= 80) grade = "B-";
    else if (percentage >= 77) grade = "C+";
    else if (percentage >= 73) grade = "C";
    else if (percentage >= 70) grade = "C-";
    else if (percentage >= 60) grade = "D";
    else if (percentage > 0) grade = "F";

    return { progress, grade, percentage: percentage.toFixed(0) + "%" };
  };

  const getColorGradient = (color: string) => {
    // Map existing colors to gradient classes
    const colorMap: Record<string, string> = {
      "#3B82F6": "from-primary to-accent",
      "#10B981": "from-emerald-500 to-teal-500",
      "#F59E0B": "from-amber-500 to-orange-500",
      "#8B5CF6": "from-rose-500 to-pink-500",
      "#EC4899": "from-pink-500 to-rose-500",
    };
    return colorMap[color] || "from-primary to-accent";
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Courses</h2>
          <Link
            href={`/workspace/${workspaceId}/courses`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {courses.slice(0, 4).map((course) => {
          const { progress, grade, percentage } = calculateCourseData(course);
          const colorGradient = getColorGradient(course.color);

          return (
            <Link
              key={course.id}
              href={`/workspace/${workspaceId}/courses/${course.id}`}
              className="group rounded-xl border border-border bg-secondary/30 p-4 transition-all hover:border-primary/30 hover:bg-secondary/50"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{course.name}</p>
                  <p className="text-xs text-muted-foreground">{course.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{grade}</p>
                  <p className="text-xs text-muted-foreground">{percentage}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground tabular-nums">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all", colorGradient)}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

