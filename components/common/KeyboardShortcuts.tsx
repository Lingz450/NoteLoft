"use client";

/**
 * KeyboardShortcuts Component
 * 
 * Keyboard shortcuts cheat sheet overlay.
 */

import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { Modal } from "@/components/common/Modal";

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["Q"], description: "Quick add" },
      { keys: ["⌘", "Shift", "F"], description: "Focus mode" },
    ],
  },
  {
    category: "Editor",
    items: [
      { keys: ["⌘", "B"], description: "Bold" },
      { keys: ["⌘", "I"], description: "Italic" },
      { keys: ["⌘", "Enter"], description: "Submit comment" },
      { keys: ["/"], description: "Slash commands" },
    ],
  },
  {
    category: "Actions",
    items: [
      { keys: ["⌘", "S"], description: "Save (auto-saves)" },
      { keys: ["Esc"], description: "Close modal/menu" },
      { keys: ["⌘", "Z"], description: "Undo" },
    ],
  },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "?") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-12 h-12 bg-gray-800 dark:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors z-40"
        title="Keyboard Shortcuts (Cmd+Shift+?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Keyboard Shortcuts">
        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

