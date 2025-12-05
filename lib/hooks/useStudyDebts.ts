"use client";

/**
 * useStudyDebts Hook
 * 
 * Manage study debts (missed planned sessions).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useStudyDebts(workspaceId: string) {
  const queryClient = useQueryClient();

  const summary = useQuery({
    queryKey: ["study-debts-summary", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/study-debts/summary?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch debt summary");
      return res.json();
    },
  });

  const list = useQuery({
    queryKey: ["study-debts", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/study-debts?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch debts");
      return res.json();
    },
  });

  const repay = useMutation({
    mutationFn: async ({ 
      debtId, 
      sessionId, 
      minutesRepaid 
    }: { 
      debtId: string; 
      sessionId: string; 
      minutesRepaid: number;
    }) => {
      const res = await fetch(`/api/study-debts/${debtId}/repay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, minutesRepaid }),
      });
      if (!res.ok) throw new Error("Failed to repay debt");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-debts", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["study-debts-summary", workspaceId] });
    },
  });

  return { summary, list, repay };
}

