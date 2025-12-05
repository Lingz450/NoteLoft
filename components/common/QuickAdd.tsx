"use client";

/**
 * QuickAdd Component
 * 
 * Global quick-add with natural language parsing (e.g., "math hw due Fri").
 */

import { useState, useEffect, useRef } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

interface QuickAddProps {
  workspaceId: string;
  onAdd?: (type: "task" | "exam" | "page", data: any) => void;
}

export function QuickAdd({ workspaceId, onAdd }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open with Q key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "q" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only if not typing in an input
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Parse natural language
  useEffect(() => {
    if (!query.trim()) {
      setParsed(null);
      return;
    }

    // Simple parsing logic (can be enhanced with AI)
    const parseQuery = (q: string) => {
      const lower = q.toLowerCase();

      // Detect type
      let type: "task" | "exam" | "page" = "task";
      if (lower.includes("exam") || lower.includes("test") || lower.includes("midterm")) {
        type = "exam";
      } else if (lower.includes("note") || lower.includes("page")) {
        type = "page";
      }

      // Extract course (e.g., "math", "cs", "physics")
      const courseMatch = q.match(/(\w+)\s+(hw|homework|assignment|exam|test|notes?)/i);
      const course = courseMatch ? courseMatch[1] : null;

      // Extract due date (e.g., "due Fri", "due Friday", "due 12/25")
      const datePatterns = [
        /due\s+(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
        /due\s+(\d{1,2}\/\d{1,2})/,
        /due\s+(\d{1,2}\/\d{1,2}\/\d{4})/,
      ];

      let dueDate: string | null = null;
      for (const pattern of datePatterns) {
        const match = q.match(pattern);
        if (match) {
          // Convert day name to date (simplified - would need proper date logic)
          dueDate = match[1];
          break;
        }
      }

      // Extract title (everything before "due" or course)
      let title = q;
      if (courseMatch) {
        title = q.replace(courseMatch[0], "").trim();
      }
      if (dueDate) {
        title = title.replace(new RegExp(`due\\s+${dueDate}`, "i"), "").trim();
      }
      title = title.replace(/^(exam|test|hw|homework|assignment|notes?)\s+/i, "").trim();

      return {
        type,
        title: title || q,
        course,
        dueDate,
      };
    };

    const result = parseQuery(query);
    setParsed(result);
  }, [query]);

  const handleSubmit = async () => {
    if (!parsed || !parsed.title) return;

    try {
      if (parsed.type === "task") {
        // Find course by code/name
        const coursesRes = await fetch(`/api/courses?workspaceId=${workspaceId}`);
        const courses = await coursesRes.json();
        const course = courses.find(
          (c: any) =>
            c.code.toLowerCase().includes(parsed.course?.toLowerCase() || "") ||
            c.name.toLowerCase().includes(parsed.course?.toLowerCase() || "")
        );

        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            title: parsed.title,
            courseId: course?.id,
            dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
            status: "NOT_STARTED",
          }),
        });
      } else if (parsed.type === "exam") {
        const coursesRes = await fetch(`/api/courses?workspaceId=${workspaceId}`);
        const courses = await coursesRes.json();
        const course = courses.find(
          (c: any) =>
            c.code.toLowerCase().includes(parsed.course?.toLowerCase() || "") ||
            c.name.toLowerCase().includes(parsed.course?.toLowerCase() || "")
        );

        await fetch("/api/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            title: parsed.title,
            courseId: course?.id,
            date: parsed.dueDate ? new Date(parsed.dueDate) : new Date(),
          }),
        });
      } else if (parsed.type === "page") {
        await fetch("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            title: parsed.title,
            type: "GENERIC",
          }),
        });
      }

      onAdd?.(parsed.type, parsed);
      setIsOpen(false);
      setQuery("");
      setParsed(null);
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        title="Quick Add (Press Q)"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setQuery("");
          setParsed(null);
        }}
        title="Quick Add"
      >
        <div className="space-y-4">
          <div>
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try: "math hw due Fri" or "CS exam next week"'
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Q</kbd> to
              open, or click the + button
            </p>
          </div>

          {/* Preview */}
          {parsed && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  Creating {parsed.type}:
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Title:</span>{" "}
                  {parsed.title}
                </div>
                {parsed.course && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Course:</span>{" "}
                    {parsed.course}
                  </div>
                )}
                {parsed.dueDate && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Due:</span>{" "}
                    {parsed.dueDate}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleSubmit} disabled={!parsed || !parsed.title}>
              Create {parsed?.type || "Item"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

