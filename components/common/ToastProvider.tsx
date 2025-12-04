"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

type ToastVariant = "default" | "success" | "error";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastInternal = ToastOptions & { id: string };

type ToastContextValue = {
  push: (toast: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const push = useCallback((toast: ToastOptions) => {
    const id = generateId();
    const toastWithId = { id, variant: "default" as ToastVariant, ...toast };
    setToasts((prev) => [...prev, toastWithId]);
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
    return () => clearTimeout(timeout);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg transition-all ${
              toast.variant === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : toast.variant === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.description && <p className="text-xs text-[var(--muted)]">{toast.description}</p>}
              </div>
              <button
                type="button"
                className="text-[var(--muted)] hover:text-[var(--text)]"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
