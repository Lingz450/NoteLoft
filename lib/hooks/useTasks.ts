import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TaskPriorityValue,
  TaskStatusValue,
} from "@/lib/constants/enums";

export type ApiTask = {
  id: string;
  workspaceId: string;
  title: string;
  courseId?: string | null;
  courseLabel?: string | null;
  course?: { id: string; code: string; name: string; color?: string | null } | null;
  description?: string | null;
  status: TaskStatusValue;
  priority: TaskPriorityValue;
  dueDate?: string | null;
  relatedPageId?: string | null;
  relatedPage?: { title?: string | null } | null;
};

export function useTasks(workspaceId: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: async (): Promise<ApiTask[]> => {
      const res = await fetch(`/api/tasks?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load tasks");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<ApiTask>) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
  });

  const update = useMutation({
    mutationFn: async (payload: Partial<ApiTask> & { id: string }) => {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks?workspaceId=${workspaceId}&id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] }),
  });

  return { list, create, update, remove };
}
