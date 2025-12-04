"use client";

import { CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type: "success" | "info";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed right-6 top-20 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl animate-in slide-in-from-right-5 fade-in-0",
        type === "success"
          ? "border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm"
          : "border-primary/30 bg-primary/10 backdrop-blur-sm"
      )}
    >
      {type === "success" ? (
        <CheckCircle className="h-5 w-5 text-emerald-400" />
      ) : (
        <Info className="h-5 w-5 text-primary" />
      )}
      <p className="text-sm font-medium text-foreground">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

