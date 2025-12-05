"use client";

/**
 * FocusMode Component
 * 
 * Distraction-free editing mode (Notion-style focus mode).
 */

import { useState, useEffect } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/common/Button";

interface FocusModeProps {
  children: React.ReactNode;
  onExit?: () => void;
}

export function FocusMode({ children, onExit }: FocusModeProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+Shift+F to toggle focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setIsActive((prev) => !prev);
      }

      // Escape to exit focus mode
      if (e.key === "Escape" && isActive) {
        setIsActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="relative">
        {children}
        <button
          onClick={() => setIsActive(true)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
          title={`Enter Focus Mode (${typeof window !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? "Cmd" : "Ctrl"}+Shift+F)`}
        >
          <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
      {/* Exit Button */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsActive(false)}
          className="bg-white dark:bg-gray-800"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Exit Focus Mode
        </Button>
        {onExit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="bg-white dark:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Focused Content */}
      <div className="max-w-4xl mx-auto pt-20 pb-10 px-8 h-full overflow-y-auto">
        {children}
      </div>

      {/* Keyboard Hint */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-75">
        Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Esc</kbd> to exit focus mode
      </div>
    </div>
  );
}

