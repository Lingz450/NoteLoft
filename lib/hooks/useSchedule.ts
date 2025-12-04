import { TimetableSlot } from "@prisma/client";
import type { TimetableSlotTypeValue } from "@/lib/constants/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ScheduleSlot = TimetableSlot & {
  course?: {
    id: string;
    code: string;
    name: string;
    color: string;
  } | null;
};

type UpsertPayload = {
  title: string;
  courseId?: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type?: TimetableSlotTypeValue;
};

export function useSchedule(workspaceId: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["schedule", workspaceId],
    queryFn: async (): Promise<ScheduleSlot[]> => {
      const res = await fetch(`/api/schedule?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load schedule");
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async (payload: UpsertPayload) => {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to create slot");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule", workspaceId] }),
  });

  const update = useMutation({
    mutationFn: async (payload: UpsertPayload & { id: string }) => {
      const res = await fetch("/api/schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to update slot");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule", workspaceId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/schedule?workspaceId=${workspaceId}&id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete slot");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule", workspaceId] }),
  });

  return { list, create, update, remove };
}
