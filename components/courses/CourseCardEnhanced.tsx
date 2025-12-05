"use client";

/**
 * CourseCardEnhanced Component
 * 
 * Enhanced course card with grade estimate, hours studied, and quick actions.
 */

import { useState, useEffect } from "react";
import { GraduationCap, TrendingUp, Clock, Plus } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { ContextMenu } from "@/components/common/ContextMenu";
import Link from "next/link";

interface CourseCardEnhancedProps {
  course: {
    id: string;
    code: string;
    name: string;
    color: string;
  };
  workspaceId: string;
}

export function CourseCardEnhanced({ course, workspaceId }: CourseCardEnhancedProps) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`/api/courses/${course.id}/stats`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error loading course stats:", error);
      }
    };

    loadStats();
  }, [course.id]);

  const actions = [
    {
      label: "Add Exam",
      icon: <Plus className="w-4 h-4" />,
      onClick: () => {
        window.location.href = `/workspace/${workspaceId}/exams?action=new&courseId=${course.id}`;
      },
    },
    {
      label: "Add Assignment",
      icon: <Plus className="w-4 h-4" />,
      onClick: () => {
        window.location.href = `/workspace/${workspaceId}/tasks?action=new&courseId=${course.id}`;
      },
    },
    {
      label: "View Course",
      icon: <GraduationCap className="w-4 h-4" />,
      onClick: () => {
        window.location.href = `/workspace/${workspaceId}/courses/${course.id}`;
      },
    },
  ];

  return (
    <ContextMenu actions={actions} trigger="right-click">
      <Card className="p-5 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: course.color }}
            >
              {course.code.split(" ")[0]}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {course.code}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{course.name}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="space-y-3 mb-4">
            {/* Grade Estimate */}
            {stats.currentGrade !== null && (
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Current Grade
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats.currentGrade.toFixed(1)}%
                </span>
              </div>
            )}

            {/* Study Hours */}
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  This Week
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats.weeklyHours}h / {stats.weeklyGoal}h
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${Math.min((stats.weeklyHours / stats.weeklyGoal) * 100, 100)}%`,
                  backgroundColor: course.color,
                }}
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              window.location.href = `/workspace/${workspaceId}/exams?action=new&courseId=${course.id}`;
            }}
          >
            Add Exam
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              window.location.href = `/workspace/${workspaceId}/tasks?action=new&courseId=${course.id}`;
            }}
          >
            Add Task
          </Button>
        </div>
      </Card>
    </ContextMenu>
  );
}

