"use client";

import { ReactNode, useState } from "react";
import { useSidebarPosition } from "@/components/common/UserPreferencesProvider";
import { Menu, X } from "lucide-react";

interface WorkspaceShellProps {
  sidebar: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
}

export function WorkspaceShell({ sidebar, topbar, children }: WorkspaceShellProps) {
  const [sidebarPosition] = useSidebarPosition();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const sidebarBorderClass =
    sidebarPosition === "right" ? "border-l border-border" : "border-r border-border";

  return (
    <div
      className={`flex min-h-screen bg-background text-foreground ${
        sidebarPosition === "right" ? "flex-row-reverse" : ""
      }`}
    >
      {/* Desktop Sidebar - hidden on mobile */}
      {/* Sidebar width is controlled by the Sidebar component itself */}
      <div className={`hidden lg:block bg-sidebar flex-shrink-0 overflow-y-auto ${sidebarBorderClass}`}>
        {sidebar}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Drawer */}
          <div
            className={`fixed top-0 ${sidebarPosition === "right" ? "right-0" : "left-0"} bottom-0 w-64 bg-sidebar z-50 overflow-y-auto lg:hidden`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebar}
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border bg-card">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
            NOTELOFT
          </span>
        </div>

        {topbar && <div className="flex-shrink-0 hidden lg:block">{topbar}</div>}
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
