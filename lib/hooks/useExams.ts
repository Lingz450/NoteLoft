import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Exam } from "@prisma/client";

type ApiExam = Exam & {
  course: {
    id: string;
    code: string;
    name: string;
    color: string | null;
  };
};

export function useExams(workspaceId: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["exams", workspaceId],
    queryFn: async (): Promise<ApiExam[]> => {
      const res = await fetch(`/api/exams?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load exams");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<ApiExam>) => {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to create exam");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams", workspaceId] }),
  });

  const update = useMutation({
    mutationFn: async (payload: Partial<ApiExam> & { id: string }) => {
      const res = await fetch("/api/exams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to update exam");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams", workspaceId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/exams?workspaceId=${workspaceId}&id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete exam");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams", workspaceId] }),
  });

  return { list, create, update, remove };
}
