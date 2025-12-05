"use client";

/**
 * AIStudyAgent Component
 * 
 * Comprehensive AI study planning and suggestions.
 */

import { useState, useEffect } from "react";
import { Sparkles, Target, Clock, Lightbulb, TrendingUp } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { getAIStudyPlan } from "@/lib/services/ai-service";

interface AIStudyAgentProps {
  workspaceId: string;
}

export function AIStudyAgent({ workspaceId }: AIStudyAgentProps) {
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        const data = await getAIStudyPlan(workspaceId);
        setPlan(data);
      } catch (error) {
        console.error("Error loading AI study plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">AI is analyzing your workspace...</span>
        </div>
      </Card>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Today's Focus */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Today's Focus</h2>
        </div>
        <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {plan.today.focus}
        </p>

        {/* Study Sessions */}
        <div className="space-y-3 mb-4">
          {plan.today.sessions.map((session: any, i: number) => (
            <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900 dark:text-white">{session.course}</span>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {session.duration} min
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {session.topics.map((topic: string, j: number) => (
                  <span key={j} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Items */}
        <div>
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Action Items:</h3>
          <ul className="space-y-1">
            {plan.today.tasks.map((task: string, i: number) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                {task}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* This Week */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">This Week</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Goals:</h3>
            <ul className="space-y-1">
              {plan.thisWeek.goals.map((goal: string, i: number) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Priorities:</h3>
            <div className="space-y-2">
              {plan.thisWeek.priorities.map((priority: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">AI Insights</h2>
        </div>
        <ul className="space-y-2">
          {plan.insights.map((insight: string, i: number) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">💡</span>
              {insight}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

