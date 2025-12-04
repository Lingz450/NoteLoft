"use client";

import { Clock } from "lucide-react";
import Link from "next/link";

interface Session {
  id: string;
  courseCode: string;
  minutes: number;
  date: Date;
}

interface RecentSessionsCardProps {
  sessions?: Session[];
  workspaceId: string;
}

export function RecentSessionsCard({ sessions = [], workspaceId }: RecentSessionsCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins} min`;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent sessions</h2>
          <Link
            href={`/workspace/${workspaceId}/stats`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View stats →
          </Link>
        </div>
      </div>
      <div className="divide-y divide-border">
        {recentSessions.length > 0 ? (
          recentSessions.map((session, index) => (
            <div
              key={session.id}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/30"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20">
                  {session.courseCode}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{formatDuration(session.minutes)}</p>
                <p className="text-xs text-muted-foreground">{getTimeAgo(session.date)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No study sessions recorded yet
          </div>
        )}
      </div>
    </div>
  );
}

