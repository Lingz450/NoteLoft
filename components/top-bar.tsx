"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Sparkles, Plus, Play, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Reminders } from "@/components/common/Reminders";

interface TopBarProps {
  workspaceId?: string;
  workspaceName?: string;
}

export function TopBar({ workspaceId, workspaceName }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const effectiveWorkspaceId =
    workspaceId ?? pathname?.match(/\/workspace\/([^/]+)/)?.[1] ?? "demo";
  const workspaceLabel = workspaceName ?? "My Workspace";

  const handleAction = (action: () => void, name: string) => {
    setLoadingButton(name);
    setTimeout(() => {
      action();
      setLoadingButton(null);
    }, 600);
  };

  const handleAddTask = () =>
    router.push(`/workspace/${effectiveWorkspaceId}/tasks?action=new`);
  const handleAddExam = () =>
    router.push(`/workspace/${effectiveWorkspaceId}/exams?action=new`);
  const handleStartSession = () =>
    router.push(`/workspace/${effectiveWorkspaceId}/sessions`);
  const handleAiClick = () => router.push("/ai");

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/70 px-6 backdrop-blur">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">NOTELOFT</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{workspaceLabel}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction(handleAddTask, "task")}
            disabled={loadingButton === "task"}
            className="flex items-center gap-1.5 rounded-lg border border-transparent bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-all hover:border-border hover:bg-secondary/80 active:scale-[0.98] disabled:opacity-70"
          >
            {loadingButton === "task" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add task
          </button>

          <button
            onClick={() => handleAction(handleAddExam, "exam")}
            disabled={loadingButton === "exam"}
            className="flex items-center gap-1.5 rounded-lg border border-transparent bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-all hover:border-border hover:bg-secondary/80 active:scale-[0.98] disabled:opacity-70"
          >
            {loadingButton === "exam" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add exam
          </button>

          <button
            onClick={() => handleAction(handleStartSession, "session")}
            disabled={loadingButton === "session"}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
          >
            {loadingButton === "session" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Start session
          </button>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Icon Actions */}
        <Reminders />

        <button
          onClick={handleAiClick}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Sparkles className="h-5 w-5" />
        </button>

        <ThemeToggle />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-secondary"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent shadow-md" />
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl">
                <button
                  onClick={() => router.push("/profile")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => router.push("/settings")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <div className="my-1 h-px bg-border" />
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

