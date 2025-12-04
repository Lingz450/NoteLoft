"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Brain,
  CheckSquare,
  BookOpen,
  GraduationCap,
  Calendar,
  Plus,
  FileText,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const workspaceId = pathname?.match(/\/workspace\/([^/]+)/)?.[1] || "demo";

  const commands = [
    { icon: LayoutDashboard, label: "Go to Dashboard", category: "Navigation", action: () => router.push(`/workspace/${workspaceId}`) },
    { icon: Brain, label: "Go to Study Mode", category: "Navigation", action: () => router.push(`/workspace/${workspaceId}/study`) },
    { icon: CheckSquare, label: "Go to Study Tasks", category: "Navigation", action: () => router.push(`/workspace/${workspaceId}/tasks`) },
    { icon: BookOpen, label: "Go to Courses", category: "Navigation", action: () => router.push(`/workspace/${workspaceId}/courses`) },
    { icon: GraduationCap, label: "Go to Exams", category: "Navigation", action: () => router.push(`/workspace/${workspaceId}/exams`) },
    { icon: Calendar, label: "Go to Schedule", category: "Navigation", action: () => router.push(`/workspace/${workspaceId}/schedule`) },
    { icon: Plus, label: "Add new task", category: "Actions", action: () => router.push(`/workspace/${workspaceId}/tasks?action=new`) },
    { icon: Plus, label: "Add new exam", category: "Actions", action: () => router.push(`/workspace/${workspaceId}/exams?action=new`) },
    { icon: FileText, label: "Create new page", category: "Actions", action: () => router.push(`/workspace/${workspaceId}/pages/new`) },
    { icon: Play, label: "Start study session", category: "Actions", action: () => router.push(`/workspace/${workspaceId}/study`) },
  ];

  const filteredCommands = commands.filter((cmd) => cmd.label.toLowerCase().includes(search.toLowerCase()));

  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, typeof commands>
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
      if (e.key === "ArrowDown" && isOpen) {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      }
      if (e.key === "ArrowUp" && isOpen) {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && isOpen && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  let currentIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0" onClick={onClose} />

      {/* Palette */}
      <div className="fixed left-1/2 top-1/4 z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-95">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">ESC</kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-auto p-2">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category} className="mb-2">
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </p>
              {cmds.map((cmd) => {
                const Icon = cmd.icon;
                const index = currentIndex++;
                return (
                  <button
                    key={cmd.label}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      selectedIndex === index
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {cmd.label}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No commands found</p>
          )}
        </div>
      </div>
    </>
  );
}

