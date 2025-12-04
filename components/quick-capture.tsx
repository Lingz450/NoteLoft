"use client";

import { useState } from "react";
import { Plus, CheckSquare, FileText, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCaptureProps {
  onAddTask: () => void;
  onAddNote: () => void;
  onStartSession: () => void;
}

export function QuickCapture({ onAddTask, onAddNote, onStartSession }: QuickCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: CheckSquare, label: "Add task", action: onAddTask },
    { icon: FileText, label: "Add note", action: onAddNote },
    { icon: Play, label: "Start session", action: onStartSession },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Actions Panel */}
      <div
        className={cn(
          "absolute bottom-16 right-0 w-48 rounded-xl border border-border bg-card/95 backdrop-blur-xl p-2 shadow-xl transition-all",
          isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        {actions.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30",
          isOpen && "scale-95"
        )}
        aria-label="Quick capture menu"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            <span className="text-sm font-medium">Quick capture</span>
          </>
        )}
      </button>
    </div>
  );
}

