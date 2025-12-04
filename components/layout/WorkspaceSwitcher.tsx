"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Check } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  type: "demo" | "personal" | "group";
  color: string;
}

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: "demo", name: "Fall 2025 Semester", type: "demo", color: "#3B82F6" },
  { id: "personal-1", name: "My Personal Workspace", type: "personal", color: "#10B981" },
  { id: "group-1", name: "Study Group - CS 2302", type: "group", color: "#F59E0B" },
];

interface WorkspaceSwitcherProps {
  currentWorkspaceId: string;
}

export function WorkspaceSwitcher({ currentWorkspaceId }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSwitch = (workspaceId: string) => {
    router.push(`/workspace/${workspaceId}`);
    setIsOpen(false);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "demo": return "Workspace";
      case "personal": return "Personal";
      case "group": return "Group";
      default: return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: currentWorkspace.color }}
        >
          {currentWorkspace.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentWorkspace.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getTypeLabel(currentWorkspace.type)}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Your Workspaces
            </p>
          </div>

          <div className="py-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => handleSwitch(workspace.id)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: workspace.color }}
                >
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {workspace.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getTypeLabel(workspace.type)}
                  </div>
                </div>
                {workspace.id === currentWorkspaceId && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
            <button
              onClick={() => {
                alert('Create new workspace feature coming soon!');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
              <span>Create new workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

