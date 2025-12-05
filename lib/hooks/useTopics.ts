"use client";

/**
 * useTopics Hook
 * 
 * Manage knowledge graph topics.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Topic = {
  id: string;
  workspaceId: string;
  courseId?: string | null;
  name: string;
  description?: string | null;
  parentTopicId?: string | null;
  color: string;
};

export function useTopics(workspaceId: string, courseId?: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["topics", workspaceId, courseId],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId });
      if (courseId) params.append("courseId", courseId);
      
      const res = await fetch(`/api/topics?${params}`);
      if (!res.ok) throw new Error("Failed to fetch topics");
      return res.json() as Promise<Topic[]>;
    },
  });

  const create = useMutation({
    mutationFn: async (input: Omit<Topic, "id">) => {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create topic");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", workspaceId] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Topic> & { id: string }) => {
      const res = await fetch(`/api/topics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update topic");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", workspaceId] });
    },
  });

  const linkToTask = useMutation({
    mutationFn: async ({ topicId, taskId }: { topicId: string; taskId: string }) => {
      const res = await fetch(`/api/topics/${topicId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      if (!res.ok) throw new Error("Failed to link topic to task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", workspaceId] });
    },
  });

  return { list, create, update, linkToTask };
}

