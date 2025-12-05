"use client";

/**
 * TodayPanel Component
 * 
 * "What should I do now?" - Smart suggestions and quick actions.
 */

import { useState, useEffect } from "react";
import { Clock, AlertCircle, Target, Play, CheckCircle } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { useRouter } from "next/navigation";

interface TodayPanelProps {
  workspaceId: string;
}

export function TodayPanel({ workspaceId }: TodayPanelProps) {
  const router = useRouter();
  const [todayData, setTodayData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTodayData = async () => {
      try {
        const res = await fetch(`/api/dashboard/today?workspaceId=${workspaceId}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setTodayData(data);
      } catch (error) {
        console.error("Error loading today data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayData();
  }, [workspaceId]);

  const handleStartSession = () => {
    if (todayData?.suggestedSession) {
      router.push(
        `/workspace/${workspaceId}/sessions?action=start&courseId=${todayData.suggestedSession.courseId}&duration=${todayData.suggestedSession.duration}`
      );
    } else {
      router.push(`/workspace/${workspaceId}/sessions?action=start`);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4 text-gray-500">Loading...</div>
      </Card>
    );
  }

  const hasUrgentItems =
    (todayData?.overdueTasks?.length || 0) > 0 ||
    (todayData?.todayTasks?.length || 0) > 0 ||
    todayData?.nextExam;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today</h2>
      </div>

      {/* Overdue Tasks */}
      {todayData?.overdueTasks && todayData.overdueTasks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-700 dark:text-red-400">
              Overdue ({todayData.overdueTasks.length})
            </h3>
          </div>
          <div className="space-y-2">
            {todayData.overdueTasks.slice(0, 3).map((task: any) => (
              <div
                key={task.id}
                className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {task.courseCode} • Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {todayData?.todayTasks && todayData.todayTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">
            Due Today ({todayData.todayTasks.length})
          </h3>
          <div className="space-y-2">
            {todayData.todayTasks.slice(0, 3).map((task: any) => (
              <div
                key={task.id}
                className="p-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={task.status === "DONE"}
                  />
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {task.courseCode}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Start
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Exam */}
      {todayData?.nextExam && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Next Exam</h3>
          </div>
          <div className="font-semibold text-gray-900 dark:text-white mb-1">
            {todayData.nextExam.title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {todayData.nextExam.courseCode} • {todayData.nextExam.daysUntil} days away
          </div>
          <Button size="sm" variant="outline" className="w-full">
            View Exam Prep
          </Button>
        </div>
      )}

      {/* Suggested Session */}
      {todayData?.suggestedSession && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Suggested Focus Block</h3>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {todayData.suggestedSession.courseName} • {todayData.suggestedSession.duration} min
          </div>
          <Button size="sm" variant="outline" className="w-full">
            Start {todayData.suggestedSession.duration}-min Session
          </Button>
        </div>
      )}

      {/* Big Action Button */}
      <Button
        onClick={handleStartSession}
        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        size="lg"
      >
        <Play className="w-5 h-5 mr-2" />
        Start My Next Session
      </Button>

      {!hasUrgentItems && !todayData?.suggestedSession && (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">You're all caught up! Great work! 🎉</p>
        </div>
      )}
    </Card>
  );
}

