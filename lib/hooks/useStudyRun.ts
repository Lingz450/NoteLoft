"use client";

/**
 * useStudyRun Hook
 * 
 * Client-side hook for managing study runs (semester study plans).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateStudyRunInput } from "@/lib/actions/study-runs";

type StudyRun = {
  id: string;
  courseId: string;
  goalType: string;
  targetGrade?: string | null;
  goalDescription?: string | null;
  startDate: Date;
  endDate: Date;
  preferredDaysPerWeek: number;
  minutesPerSession: number;
  isActive: boolean;
  weeks: Array<{
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
  }>;
};

/**
 * Hook for managing study runs in a workspace
 */
export function useStudyRuns(workspaceId: string, courseId?: string) {
  const queryClient = useQueryClient();

  // List study runs
  const list = useQuery({
    queryKey: ["study-runs", workspaceId, courseId],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId });
      if (courseId) params.append("courseId", courseId);
      
      const res = await fetch(`/api/study-runs?${params}`);
      if (!res.ok) throw new Error("Failed to fetch study runs");
      const data = await res.json();
      
      // Parse dates
      return data.map((run: any) => ({
        ...run,
        startDate: new Date(run.startDate),
        endDate: new Date(run.endDate),
        weeks: run.weeks.map((w: any) => ({
          ...w,
          startDate: new Date(w.startDate),
          endDate: new Date(w.endDate),
        })),
      })) as StudyRun[];
    },
  });

  // Create study run
  const create = useMutation({
    mutationFn: async (input: CreateStudyRunInput) => {
      const res = await fetch("/api/study-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create study run");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-runs", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["courses", workspaceId] });
    },
  });

  // Deactivate study run
  const deactivate = useMutation({
    mutationFn: async (runId: string) => {
      const res = await fetch(`/api/study-runs/${runId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to deactivate study run");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-runs", workspaceId] });
    },
  });

  return {
    list,
    create,
    deactivate,
  };
}

/**
 * Hook for a single study run with detailed progress
 */
export function useStudyRun(runId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["study-run", runId],
    queryFn: async () => {
      const res = await fetch(`/api/study-runs/${runId}`);
      if (!res.ok) throw new Error("Failed to fetch study run");
      const data = await res.json();
      
      return {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        weeks: data.weeks.map((w: any) => ({
          ...w,
          startDate: new Date(w.startDate),
          endDate: new Date(w.endDate),
        })),
      } as StudyRun;
    },
    enabled: !!runId,
  });

  return query;
}

/**
 * Calculate overall progress for a study run
 */
export function calculateOverallProgress(weeks: StudyRun["weeks"]) {
  if (weeks.length === 0) return { percent: 0, status: "pending" as const };

  const totalTarget = weeks.reduce((sum, w) => sum + w.targetMinutes, 0);
  const totalCompleted = weeks.reduce((sum, w) => sum + w.completedMinutes, 0);
  
  const percent = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

  const completedWeeks = weeks.filter(w => w.status === "COMPLETED").length;
  const behindWeeks = weeks.filter(w => w.status === "BEHIND").length;

  let status: "on_track" | "behind" | "ahead" | "completed" = "on_track";
  if (completedWeeks === weeks.length) status = "completed";
  else if (behindWeeks > weeks.length / 3) status = "behind";
  else if (percent > 110) status = "ahead";

  return { percent: Math.min(percent, 100), status };
}

