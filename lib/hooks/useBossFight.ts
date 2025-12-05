"use client";

/**
 * useBossFight Hook
 * 
 * Manage boss fights (gamified exam prep).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BossDifficulty } from "@/lib/constants/enums";

export function useBossFights(workspaceId: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["boss-fights", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/boss-fights?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch boss fights");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async ({ examId, difficulty }: { examId: string; difficulty: BossDifficulty }) => {
      const res = await fetch("/api/boss-fights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, difficulty }),
      });
      if (!res.ok) throw new Error("Failed to create boss fight");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boss-fights", workspaceId] });
    },
  });

  const applyDamage = useMutation({
    mutationFn: async ({ 
      bossFightId, 
      sessionId, 
      sessionMinutes, 
      isConsistentStreak 
    }: { 
      bossFightId: string; 
      sessionId: string; 
      sessionMinutes: number; 
      isConsistentStreak?: boolean;
    }) => {
      const res = await fetch(`/api/boss-fights/${bossFightId}/hit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, sessionMinutes, isConsistentStreak }),
      });
      if (!res.ok) throw new Error("Failed to apply damage");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boss-fights", workspaceId] });
    },
  });

  return { list, create, applyDamage };
}

export function useBossFight(bossFightId: string) {
  return useQuery({
    queryKey: ["boss-fight", bossFightId],
    queryFn: async () => {
      const res = await fetch(`/api/boss-fights/${bossFightId}`);
      if (!res.ok) throw new Error("Failed to fetch boss fight");
      return res.json();
    },
    enabled: !!bossFightId,
  });
}

