"use client";

/**
 * CommandPalette Component
 * 
 * Notion-style quick switcher and command palette (Cmd/Ctrl+K).
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  CheckSquare,
  GraduationCap,
  ClipboardList,
  Plus,
  Clock,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";

type SearchResult = {
  id: string;
  title: string;
  type: "page" | "task" | "course" | "exam" | "action";
  subtitle?: string;
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Quick actions (always visible when query is empty)
  const quickActions: SearchResult[] = [
    {
      id: "new-page",
      title: "Create new page",
      type: "action",
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push("/workspace/demo/pages/new"),
    },
    {
      id: "new-task",
      title: "Add new task",
      type: "action",
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => router.push("/workspace/demo/tasks?action=new"),
    },
    {
      id: "new-exam",
      title: "Add new exam",
      type: "action",
      icon: <ClipboardList className="w-4 h-4" />,
      action: () => router.push("/workspace/demo/exams?action=new"),
    },
    {
      id: "start-session",
      title: "Start 25-min focus session",
      type: "action",
      icon: <Clock className="w-4 h-4" />,
      action: () => router.push("/workspace/demo/sessions?action=start&duration=25"),
    },
    {
      id: "ai-assistant",
      title: "Open AI assistant",
      type: "action",
      icon: <Sparkles className="w-4 h-4" />,
      action: () => router.push("/ai"),
    },
  ];

  // Open palette with Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search
  useEffect(() => {
    if (!query.trim()) {
      setResults(quickActions);
      setIsSearching(false);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&workspaceId=demo`);
        const data = await res.json();
        
        // Map API results to SearchResult format
        const mapped: SearchResult[] = [
          ...data.pages?.map((p: any) => ({
            id: p.id,
            title: p.title,
            type: "page" as const,
            subtitle: "Page",
            icon: <FileText className="w-4 h-4" />,
            href: `/workspace/demo/pages/${p.id}/edit`,
          })) || [],
          ...data.tasks?.map((t: any) => ({
            id: t.id,
            title: t.title,
            type: "task" as const,
            subtitle: `Task • ${t.status}`,
            icon: <CheckSquare className="w-4 h-4" />,
            href: `/workspace/demo/tasks?selected=${t.id}`,
          })) || [],
          ...data.courses?.map((c: any) => ({
            id: c.id,
            title: `${c.code} - ${c.name}`,
            type: "course" as const,
            subtitle: "Course",
            icon: <GraduationCap className="w-4 h-4" />,
            href: `/workspace/demo/courses/${c.id}`,
          })) || [],
          ...data.exams?.map((e: any) => ({
            id: e.id,
            title: e.title,
            type: "exam" as const,
            subtitle: `Exam • ${e.date}`,
            icon: <ClipboardList className="w-4 h-4" />,
            href: `/workspace/demo/exams/${e.id}`,
          })) || [],
        ];

        setResults(mapped);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.action) {
      result.action();
    } else if (result.href) {
      router.push(result.href);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger button (optional, shown in UI) */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Quick search</span>
        <kbd className="px-2 py-0.5 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded">
          {typeof window !== "undefined" && /Mac|iPhone|iPod|iPad/i.test(navigator.platform) ? "⌘" : "Ctrl"}K
        </kbd>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, tasks, courses, exams... or type a command"
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  {query ? "No results found" : "Start typing to search..."}
                </div>
              ) : (
                <>
                  {!query && (
                    <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Quick Actions
                    </div>
                  )}
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="text-gray-600 dark:text-gray-400">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      {index === selectedIndex && (
                        <kbd className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                          ↵
                        </kbd>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
