"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/common/Spinner";

type SearchResult = {
  pages: Array<{ id: string; title: string }>;
  tasks: Array<{ id: string; title: string; status: string }>;
  courses: Array<{ id: string; code: string; name: string }>;
};

type Props = {
  workspaceId: string;
};

export function GlobalSearch({ workspaceId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult>({ pages: [], tasks: [], courses: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults({ pages: [], tasks: [], courses: [] });
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setResults({ pages: [], tasks: [], courses: [] });
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/search?workspaceId=${workspaceId}&q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((data) => {
        setResults(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults({ pages: [], tasks: [], courses: [] });
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [open, query, workspaceId]);

  function navigateTo(path: string) {
    setOpen(false);
    router.push(path);
  }

  const hasResults = useMemo(
    () => results.pages.length + results.tasks.length + results.courses.length > 0,
    [results],
  );

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-1 text-sm text-[var(--muted)] hover:text-[var(--text)]"
        onClick={() => setOpen(true)}
      >
        Search...
        <span className="rounded border border-[var(--border)] px-1 text-xs text-[var(--muted)]">Ctrl + K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div
            className="mx-auto max-w-2xl rounded-2xl border border-[var(--border)] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[var(--border)] px-4 py-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, tasks, courses..."
                className="w-full border-none bg-transparent text-base focus:outline-none"
              />
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-4 py-3 space-y-4">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Spinner size={16} /> Searching...
                </div>
              )}
              {!loading && !hasResults && query.length >= 2 && (
                <p className="text-sm text-[var(--muted)]">No results.</p>
              )}
              {results.pages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase mb-1">Pages</p>
                  <ul className="space-y-1">
                    {results.pages.map((page) => (
                      <li key={page.id}>
                        <button
                          className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                          onClick={() => navigateTo(`/workspace/${workspaceId}/pages/${page.id}`)}
                        >
                          {page.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.tasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase mb-1">Tasks</p>
                  <ul className="space-y-1">
                    {results.tasks.map((task) => (
                      <li key={task.id}>
                        <button
                          className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                          onClick={() => navigateTo(`/workspace/${workspaceId}/tasks?focus=${task.id}`)}
                        >
                          {task.title} · <span className="text-[var(--muted)]">{task.status.toLowerCase()}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.courses.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase mb-1">Courses</p>
                  <ul className="space-y-1">
                    {results.courses.map((course) => (
                      <li key={course.id}>
                        <button
                          className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
                          onClick={() => navigateTo(`/workspace/${workspaceId}/courses/${course.id}`)}
                        >
                          {course.code} · {course.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
