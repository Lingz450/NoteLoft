"use client";

/**
 * ProgressCard Component
 * 
 * Weekly progress bar and motivation loops.
 */

import { useState, useEffect } from "react";
import { TrendingUp, Target, Flame } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";

interface ProgressCardProps {
  workspaceId: string;
}

export function ProgressCard({ workspaceId }: ProgressCardProps) {
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`/api/dashboard/progress?workspaceId=${workspaceId}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setProgress(data);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [workspaceId]);

  if (isLoading || !progress) {
    return (
      <Card className="p-5">
        <div className="text-center py-4 text-gray-500">Loading...</div>
      </Card>
    );
  }

  const progressPercentage = progress.plannedMinutes > 0
    ? (progress.actualMinutes / progress.plannedMinutes) * 100
    : 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 dark:text-white">This Week</h3>
        </div>
        {progress.streak > 0 && (
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {progress.streak} day streak
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Study Time
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {Math.floor(progress.actualMinutes / 60)}h {progress.actualMinutes % 60}m /{" "}
            {Math.floor(progress.plannedMinutes / 60)}h {progress.plannedMinutes % 60}m
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              progressPercentage >= 100
                ? "bg-green-500"
                : progressPercentage >= 70
                ? "bg-blue-500"
                : progressPercentage >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {progressPercentage.toFixed(0)}% of weekly goal
        </div>
      </div>

      {/* Motivation Message */}
      {progress.streak > 0 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
            🔥 You've studied {progress.streak} days in a row! Keep it up!
          </p>
        </div>
      )}

      {progress.streak === 0 && progress.lastStudied && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ready to start a new streak? You've got this! 💪
          </p>
        </div>
      )}
    </Card>
  );
}

