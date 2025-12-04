import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Course } from "@prisma/client";

export function useCourses(workspaceId: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["courses", workspaceId],
    queryFn: async (): Promise<Course[]> => {
      const res = await fetch(`/api/courses?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load courses");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async (course: Partial<Course>) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, ...course }),
      });
      if (!res.ok) throw new Error("Failed to create course");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses", workspaceId] }),
  });

  const update = useMutation({
    mutationFn: async (course: Partial<Course> & { id: string }) => {
      const res = await fetch("/api/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, ...course }),
      });
      if (!res.ok) throw new Error("Failed to update course");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses", workspaceId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/courses?workspaceId=${workspaceId}&id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete course");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses", workspaceId] }),
  });

  return { list, create, update, remove };
}
