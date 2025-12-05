"use client";

/**
 * SessionSummary Component
 * 
 * Post-session summary with task completion and next session suggestion.
 */

import { CheckCircle, Clock, Target, Sparkles } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

interface SessionSummaryProps {
  session: {
    duration: number;
    course?: string;
    tasksCompleted?: string[];
    nextSuggestedTime?: Date;
  };
  onComplete?: () => void;
  onStartNext?: () => void;
}

export function SessionSummary({ session, onComplete, onStartNext }: SessionSummaryProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Session Complete! 🎉
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You studied for {session.duration} minutes
        </p>
      </div>

      {/* What You Did */}
      {session.tasksCompleted && session.tasksCompleted.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Tasks Completed
          </h3>
          <div className="space-y-2">
            {session.tasksCompleted.map((task, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Session Suggestion */}
      {session.nextSuggestedTime && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Suggested Next Session</h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {session.nextSuggestedTime.toLocaleDateString()} at{" "}
            {session.nextSuggestedTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {onStartNext && (
            <Button size="sm" variant="outline" onClick={onStartNext} className="w-full">
              Schedule Next Session
            </Button>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button className="flex-1" onClick={onComplete}>
          Done
        </Button>
        {onStartNext && (
          <Button variant="outline" onClick={onStartNext}>
            Start Another
          </Button>
        )}
      </div>
    </Card>
  );
}

