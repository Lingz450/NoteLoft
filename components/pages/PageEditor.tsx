'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { Card } from "@/components/common/Card";
import { summarisePageContent, extractTasksFromPage, ExtractedTaskSuggestion } from "@/lib/ai";

type Props = {
  pageId: string;
  workspaceId: string;
  initialTitle: string;
  initialContent: any;
};

type SaveState = "saved" | "saving" | "error";

export function PageEditor({ pageId, workspaceId, initialTitle, initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarising, setIsSummarising] = useState(false);
  const [suggestions, setSuggestions] = useState<ExtractedTaskSuggestion[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const saveTimer = useRef<NodeJS.Timeout>();

  const save = useCallback(
    async (nextTitle: string, content: any) => {
      setSaveState("saving");
      const res = await fetch("/api/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pageId, workspaceId, title: nextTitle, content }),
      });
      setSaveState(res.ok ? "saved" : "error");
    },
    [pageId, workspaceId]
  );

  const scheduleSave = useCallback(
    (nextTitle: string, content: any) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(nextTitle, content), 600);
    },
    [save]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Capture lecture notes, todos, callouts..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[60vh] px-0 py-4 prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded",
      },
    },
    onUpdate: ({ editor }) => scheduleSave(title, editor.getJSON()),
  });

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function setHeading(level: 1 | 2 | 3) {
    editor?.chain().focus().toggleHeading({ level }).run();
  }

  async function handleSummarise() {
    if (!editor) return;
    setIsSummarising(true);
    try {
      const content = editor.getJSON();
      const response = await summarisePageContent({ title, content });
      setSummary(response);
    } finally {
      setIsSummarising(false);
    }
  }

  async function handleExtractTasks() {
    if (!editor) return;
    setIsExtracting(true);
    try {
      const payload = await extractTasksFromPage({ content: editor.getJSON() });
      setSuggestions(payload);
    } finally {
      setIsExtracting(false);
    }
  }

  function createTaskFromSuggestion(suggestion: ExtractedTaskSuggestion) {
    setTaskError(null);
    startTransition(async () => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: suggestion.title,
          courseLabel: suggestion.courseHint,
          priority: suggestion.priority ?? "NORMAL",
        }),
      });
      if (!res.ok) {
        setTaskError("Failed to create task from suggestion.");
        return;
      }
      setTaskError(null);
    });
  }

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave(e.target.value, editor.getJSON());
          }}
          className="text-2xl font-semibold"
          placeholder="Untitled page"
        />
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          {saveState === "saving" && (
            <span className="flex items-center gap-1">
              <Spinner size={14} /> Saving...
            </span>
          )}
          {saveState === "saved" && <span>Saved</span>}
          {saveState === "error" && <span className="text-red-600">Error</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm">
        <Button variant="ghost" size="sm" onClick={() => setHeading(1)}>
          H1
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setHeading(2)}>
          H2
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setHeading(3)}>
          H3
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()}>
          ✓ Todos
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Callout
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleSummarise} disabled={isSummarising}>
          {isSummarising ? "Summarising..." : "Summarise page"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleExtractTasks} disabled={isExtracting}>
          {isExtracting ? "Finding tasks..." : "Extract tasks"}
        </Button>
      </div>

      <EditorContent editor={editor} />

      {summary && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold">AI summary</p>
          <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{summary}</p>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Suggested tasks</p>
            {taskError && <p className="text-xs text-red-600">{taskError}</p>}
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={`${suggestion.title}-${index}`} className="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{suggestion.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {suggestion.courseHint ? `Course: ${suggestion.courseHint} · ` : ""}
                    Priority: {suggestion.priority ?? "NORMAL"}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => createTaskFromSuggestion(suggestion)}
                >
                  {isPending ? "Creating..." : "Add task"}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
