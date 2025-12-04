"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Search,
  FileText,
  CheckSquare,
  Calendar,
  GraduationCap,
  Clock,
  Sparkles,
  Settings,
  User,
  BarChart3,
  Brain,
  Hash,
  AtSign,
  List,
  Table,
  LayoutGrid,
  ChevronRight
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  category: string;
  icon: any;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const workspaceId = pathname?.match(/\/workspace\/([^/]+)/)?.[1] || "demo";

  const commands: Command[] = [
    // Navigation
    { id: "nav-dashboard", label: "Go to Dashboard", category: "Navigate", icon: LayoutGrid, action: () => router.push(`/workspace/${workspaceId}`) },
    { id: "nav-tasks", label: "Go to Tasks", category: "Navigate", icon: CheckSquare, action: () => router.push(`/workspace/${workspaceId}/tasks`) },
    { id: "nav-courses", label: "Go to Courses", category: "Navigate", icon: GraduationCap, action: () => router.push(`/workspace/${workspaceId}/courses`) },
    { id: "nav-schedule", label: "Go to Schedule", category: "Navigate", icon: Calendar, action: () => router.push(`/workspace/${workspaceId}/schedule`) },
    { id: "nav-stats", label: "Go to Stats", category: "Navigate", icon: BarChart3, action: () => router.push(`/workspace/${workspaceId}/stats`) },
    { id: "nav-ai", label: "Go to AI Assistant", category: "Navigate", icon: Sparkles, action: () => router.push(`/ai`) },
    { id: "nav-profile", label: "Go to Profile", category: "Navigate", icon: User, action: () => router.push(`/profile`) },
    { id: "nav-settings", label: "Go to Settings", category: "Navigate", icon: Settings, action: () => router.push(`/settings`) },
    
    // Create Actions
    { id: "create-task", label: "New Task", category: "Create", icon: CheckSquare, action: () => router.push(`/workspace/${workspaceId}/tasks?action=new`), keywords: ["add", "task", "assignment"] },
    { id: "create-page", label: "New Page", category: "Create", icon: FileText, action: () => router.push(`/workspace/${workspaceId}/pages/new`), keywords: ["add", "page", "note"] },
    { id: "create-course", label: "New Course", category: "Create", icon: GraduationCap, action: () => router.push(`/workspace/${workspaceId}/courses?action=new`), keywords: ["add", "course", "class"] },
    { id: "create-exam", label: "New Exam", category: "Create", icon: Calendar, action: () => router.push(`/workspace/${workspaceId}/exams?action=new`), keywords: ["add", "exam", "test"] },
    { id: "create-session", label: "Start Study Session", category: "Create", icon: Clock, action: () => router.push(`/workspace/${workspaceId}/study`), keywords: ["focus", "study", "timer"] },
    
    // AI Commands
    { id: "ai-help", label: "Ask AI Assistant", category: "AI", icon: Sparkles, action: () => router.push(`/ai`), keywords: ["ai", "assistant", "help"] },
    { id: "ai-summarize", label: "AI: Summarize Page", category: "AI", icon: FileText, action: () => alert("AI Summarize - Coming soon!"), keywords: ["summarize", "summary"] },
    { id: "ai-quiz", label: "AI: Generate Quiz", category: "AI", icon: Brain, action: () => alert("AI Quiz Generator - Coming soon!"), keywords: ["quiz", "test", "practice"] },
  ];

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.category.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some(k => k.includes(searchLower))
    );
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch("");
        setSelectedIndex(0);
      }
      // Arrow keys for navigation
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
        }
        // Enter to execute
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault();
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
          setSearch("");
          setSelectedIndex(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
              <span>to close</span>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto py-2">
            {Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {category}
                  </p>
                </div>
                <div>
                  {cmds.map((cmd, index) => {
                    const Icon = cmd.icon;
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                          setSearch("");
                          setSelectedIndex(0);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="flex-1 text-left text-sm text-gray-900 dark:text-white">
                          {cmd.label}
                        </span>
                        {isSelected && (
                          <ChevronRight className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No commands found for &quot;{search}&quot;
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">Enter</kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">⌘K</kbd>
              <span>or</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">Ctrl+K</kbd>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

