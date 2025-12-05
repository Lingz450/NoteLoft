"use client";

/**
 * ContextMenu Component
 * 
 * Right-click / three-dot menu for tasks and courses.
 */

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Play,
  FileText,
  Edit,
  Trash2,
  MoreVertical,
  ExternalLink,
} from "lucide-react";

type ContextMenuAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
};

interface ContextMenuProps {
  children: React.ReactNode;
  actions: ContextMenuAction[];
  trigger?: "right-click" | "three-dot";
}

export function ContextMenu({ children, actions, trigger = "right-click" }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleRightClick = (e: MouseEvent) => {
      if (trigger === "right-click" && containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        setPosition({ x: e.clientX, y: e.clientY });
        setIsOpen(true);
      }
    };

    if (trigger === "right-click") {
      document.addEventListener("contextmenu", handleRightClick);
    }
    document.addEventListener("click", handleClickOutside);

    return () => {
      if (trigger === "right-click") {
        document.removeEventListener("contextmenu", handleRightClick);
      }
      document.removeEventListener("click", handleClickOutside);
    };
  }, [trigger]);

  const commonActions: ContextMenuAction[] = [
    {
      label: "Mark Done",
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: () => {},
    },
    {
      label: "Start Session",
      icon: <Play className="w-4 h-4" />,
      onClick: () => {},
    },
    {
      label: "Open Notes",
      icon: <FileText className="w-4 h-4" />,
      onClick: () => {},
    },
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: () => {},
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {},
      variant: "danger",
    },
  ];

  const menuActions = actions.length > 0 ? actions : commonActions;

  return (
    <div ref={containerRef} className="relative">
      {trigger === "three-dot" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPosition({ x: e.clientX, y: e.clientY });
            setIsOpen(!isOpen);
          }}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      )}

      {children}

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 w-48 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          {menuActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm font-medium transition-colors ${
                action.variant === "danger"
                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

