"use client";

import { ReactNode } from "react";
import { useSidebarPosition } from "@/components/common/UserPreferencesProvider";

interface WorkspaceShellProps {
  sidebar: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
}

export function WorkspaceShell({ sidebar, topbar, children }: WorkspaceShellProps) {
  const [sidebarPosition] = useSidebarPosition();

  const sidebarBorderClass =
    sidebarPosition === "right" ? "border-l border-border" : "border-r border-border";

  return (
    <div
      className={`flex min-h-screen bg-background text-foreground ${
        sidebarPosition === "right" ? "flex-row-reverse" : ""
      }`}
    >
      <div className={`w-64 bg-sidebar flex-shrink-0 overflow-y-auto ${sidebarBorderClass}`}>
        {sidebar}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {topbar && <div className="flex-shrink-0">{topbar}</div>}
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
