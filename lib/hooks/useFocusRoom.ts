"use client";

/**
 * useFocusRoom Hook
 * 
 * Manage focus room participation and real-time sync.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type FocusRoomParticipant = {
  id: string;
  displayName: string;
  avatarColor: string;
  currentReaction?: string | null;
  lastSeenAt: Date;
};

type FocusRoom = {
  id: string;
  name: string;
  status: string;
  timerDuration: number;
  timerStartedAt?: Date | null;
  participants: FocusRoomParticipant[];
};

export function useFocusRooms() {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["focus-rooms"],
    queryFn: async () => {
      const res = await fetch("/api/focus-rooms");
      if (!res.ok) throw new Error("Failed to fetch focus rooms");
      return res.json() as Promise<FocusRoom[]>;
    },
    refetchInterval: 5000, // Poll every 5 seconds for room updates
  });

  const create = useMutation({
    mutationFn: async ({ name, duration }: { name: string; duration: number }) => {
      const res = await fetch("/api/focus-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timerDuration: duration }),
      });
      if (!res.ok) throw new Error("Failed to create focus room");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-rooms"] });
    },
  });

  return { list, create };
}

export function useFocusRoom(roomId: string, displayName: string) {
  const queryClient = useQueryClient();
  const [participantId, setParticipantId] = useState<string | null>(null);

  // Join room
  const join = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/focus-rooms/${roomId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok) throw new Error("Failed to join room");
      const data = await res.json();
      setParticipantId(data.id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-room", roomId] });
    },
  });

  // Leave room
  const leave = useMutation({
    mutationFn: async () => {
      if (!participantId) return;
      const res = await fetch(`/api/focus-rooms/${roomId}/participants/${participantId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to leave room");
      return res.json();
    },
    onSuccess: () => {
      setParticipantId(null);
      queryClient.invalidateQueries({ queryKey: ["focus-room", roomId] });
    },
  });

  // Send reaction
  const sendReaction = useMutation({
    mutationFn: async (reaction: string) => {
      if (!participantId) return;
      const res = await fetch(`/api/focus-rooms/${roomId}/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentReaction: reaction }),
      });
      if (!res.ok) throw new Error("Failed to send reaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-room", roomId] });
    },
  });

  // Get room state (poll for real-time updates)
  const room = useQuery({
    queryKey: ["focus-room", roomId],
    queryFn: async () => {
      const res = await fetch(`/api/focus-rooms/${roomId}`);
      if (!res.ok) throw new Error("Failed to fetch focus room");
      return res.json() as Promise<FocusRoom>;
    },
    refetchInterval: 2000, // Poll every 2 seconds
    enabled: !!roomId,
  });

  // Heartbeat to keep participant "alive"
  useEffect(() => {
    if (!participantId || !roomId) return;

    const interval = setInterval(async () => {
      // Send heartbeat
      await fetch(`/api/focus-rooms/${roomId}/participants/${participantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heartbeat: true }),
      });
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [participantId, roomId]);

  return {
    room,
    join,
    leave,
    sendReaction,
    participantId,
  };
}

