"use client";

/**
 * UndoToast Component
 * 
 * Undo functionality for destructive actions.
 */

import { useState, useEffect } from "react";
import { RotateCcw, X } from "lucide-react";

type UndoAction = {
  id: string;
  label: string;
  undo: () => void;
};

let undoStack: UndoAction[] = [];
let listeners: Array<() => void> = [];

export function useUndo() {
  const [current, setCurrent] = useState<UndoAction | null>(null);

  useEffect(() => {
    const update = () => {
      setCurrent(undoStack[undoStack.length - 1] || null);
    };

    listeners.push(update);
    update();

    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  const addUndo = (action: UndoAction) => {
    undoStack.push(action);
    listeners.forEach((l) => l());

    // Auto-remove after 5 seconds
    setTimeout(() => {
      undoStack = undoStack.filter((a) => a.id !== action.id);
      listeners.forEach((l) => l());
    }, 5000);
  };

  const handleUndo = () => {
    const action = undoStack.pop();
    if (action) {
      action.undo();
      listeners.forEach((l) => l());
    }
  };

  return { current, addUndo, handleUndo };
}

export function UndoToast() {
  const { current, handleUndo } = useUndo();

  if (!current) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-4">
        <span className="text-sm font-medium">{current.label}</span>
        <button
          onClick={handleUndo}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          Undo
        </button>
      </div>
    </div>
  );
}

