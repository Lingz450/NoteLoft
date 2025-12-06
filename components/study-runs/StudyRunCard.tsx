"use client";

/**
 * StudyRunCard Component
 * 
 * Dashboard widget showing active study run progress.
 */

import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Target, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { calculateOverallProgress } from "@/lib/hooks/useStudyRun";

type Week = {
  id: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  targetSessions: number;
  targetMinutes: number;
  completedSessions: number;
  completedMinutes: number;
  status: string;
  suggestedTopics?: string | null;
};

type StudyRun = {
  id: string;
  courseId: string;
  goalType: string;
  targetGrade?: string | null;
  goalDescription?: string | null;
  startDate: Date;
  endDate: Date;
  weeks: Week[];
};

interface StudyRunCardProps {
  studyRun: StudyRun;
  courseName: string;
  courseColor?: string;
  workspaceId: string;
}

export function StudyRunCard({ studyRun, courseName, courseColor = "#3B82F6", workspaceId }: StudyRunCardProps) {
  const { percent, status } = calculateOverallProgress(studyRun.weeks);
  
  const currentWeek = studyRun.weeks.find(w => {
    const now = new Date();
    return now >= w.startDate && now <= w.endDate;
  });

  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    pending: { icon: Minus, color: "text-gray-600", bg: "bg-gray-100", label: "Pending" },
    on_track: { icon: Minus, color: "text-blue-600", bg: "bg-blue-100", label: "On track" },
    ahead: { icon: TrendingUp, color: "text-green-600", bg: "bg-green-100", label: "Ahead" },
    behind: { icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-100", label: "Behind" },
    completed: { icon: Target, color: "text-emerald-600", bg: "bg-emerald-100", label: "Completed" },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <Link href={`/workspace/${workspaceId}/study-runs/${studyRun.id}`}>
      <Card className="p-5 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: courseColor }}
                />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {courseName}
                </h3>
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {studyRun.goalType === "A_GRADE" && `Target: ${studyRun.targetGrade || "A"}`}
                {studyRun.goalType === "PASS" && "Goal: Pass course"}
                {studyRun.goalType === "CATCH_UP" && "Goal: Catch up"}
                {studyRun.goalType === "CUSTOM" && studyRun.goalDescription}
              </p>
            </div>
            <Badge className={`${config.bg} ${config.color} font-semibold`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="font-bold text-gray-900 dark:text-white">{Math.round(percent)}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all bg-gradient-to-r from-primary to-accent"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Current Week Info */}
          {currentWeek && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Week {currentWeek.weekNumber}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {currentWeek.completedSessions}/{currentWeek.targetSessions} sessions · {currentWeek.completedMinutes}/{currentWeek.targetMinutes}min
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

