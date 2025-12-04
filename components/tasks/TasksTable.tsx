'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  type TaskPriorityValue,
  type TaskStatusValue,
} from "@/lib/constants/enums";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Dropdown } from "@/components/common/Dropdown";
import { useToast } from "@/components/common/ToastProvider";

export type TaskViewModel = {
  id: string;
  title: string;
  courseDisplay: string;
  courseId?: string | null;
  status: TaskStatusValue;
  priority: TaskPriorityValue;
  dueDate: string | null;
  relatedPageId?: string | null;
  relatedPageTitle?: string | null;
};

type Props = {
  workspaceId: string;
  tasks: TaskViewModel[];
  onChange?: (next: TaskViewModel[]) => void;
  onRefresh?: () => void;
};

export function TasksTable({ workspaceId, tasks, onChange, onRefresh }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<TaskStatusValue | "ALL">("ALL");
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority">("dueDate");
  const [localTasks, setLocalTasks] = useState(tasks);
  const [newTask, setNewTask] = useState({ title: "", course: "" });
  const [isAdding, setIsAdding] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = [...localTasks];
    if (statusFilter !== "ALL") list = list.filter((t) => t.status === statusFilter);
    if (courseFilter) list = list.filter((t) => t.courseDisplay.toLowerCase().includes(courseFilter.toLowerCase()));
    list.sort((a, b) => {
      if (sortBy === "dueDate") {
        return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
      }
      return priorityWeight(b.priority) - priorityWeight(a.priority);
    });
    return list;
  }, [courseFilter, localTasks, sortBy, statusFilter]);

  function priorityWeight(priority: TaskPriorityValue) {
    if (priority === "HIGH") return 3;
    if (priority === "NORMAL") return 2;
    return 1;
  }

  function toViewModel(task: any): TaskViewModel {
    const courseDisplay =
      task.course?.code ??
      task.courseLabel ??
      task.course ??
      (typeof task.course === "string" ? task.course : "-");
    return {
      id: task.id,
      title: task.title,
      courseDisplay,
      courseId: task.courseId ?? null,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      relatedPageId: task.relatedPageId ?? null,
      relatedPageTitle: task.relatedPage?.title ?? task.relatedPageTitle ?? null,
    };
  }

  async function updateTask(id: string, patch: Partial<TaskViewModel>) {
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, workspaceId, ...patch }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const updated = toViewModel(data);
    const next = localTasks.map((t) => (t.id === id ? updated : t));
    setLocalTasks(next);
    onChange?.(next);
    onRefresh?.();
  }

  async function createTask() {
    if (!newTask.title || !newTask.course) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: newTask.title,
          courseLabel: newTask.course,
          status: "NOT_STARTED",
          priority: "NORMAL",
        }),
      });
      if (!res.ok) {
        toast.push({ title: "Failed to add task", variant: "error" });
        return;
      }
      const data = await res.json();
      const next = [toViewModel(data), ...localTasks];
      setLocalTasks(next);
      setNewTask({ title: "", course: "" });
      onChange?.(next);
      onRefresh?.();
      toast.push({ title: "Task added", variant: "success" });
    } finally {
      setIsAdding(false);
    }
  }

  return (
      <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Filter by course" className="font-medium placeholder:font-normal" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} />
        <Dropdown
          label="Status"
          options={[
            { label: "All", value: "ALL" as const },
            { label: "Not started", value: "NOT_STARTED" },
            { label: "In progress", value: "IN_PROGRESS" },
            { label: "Done", value: "DONE" },
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as TaskStatusValue | "ALL")}
        />
        <Dropdown
          label="Sort"
          options={[
            { label: "Due date", value: "dueDate" as const },
            { label: "Priority", value: "priority" as const },
          ]}
          value={sortBy}
          onChange={(val) => setSortBy(val as "dueDate" | "priority")}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]">
        <div className="grid grid-cols-7 gap-3 border-b border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Title</span>
          <span>Course</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Due</span>
          <span>Related page</span>
          <span>Focus</span>
        </div>
        <div className="divide-y divide-border">
          <div className="grid grid-cols-7 gap-3 px-4 py-2">
            <Input
              placeholder="New task title"
              value={newTask.title}
              onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
            />
            <Input
              placeholder="Course"
              value={newTask.course}
              onChange={(e) => setNewTask((p) => ({ ...p, course: e.target.value }))}
            />
            <Button variant="outline" size="sm" className="col-span-2" onClick={createTask} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add task"}
            </Button>
            <div />
          </div>

          {filtered.map((task) => (
            <div key={task.id} className="grid grid-cols-7 gap-3 px-4 py-2 text-sm text-foreground">
              <div className="truncate">{task.title}</div>
              <div className="truncate">{task.courseDisplay}</div>
              <select
                className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                value={task.status}
                onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatusValue })}
              >
                {TASK_STATUS_VALUES.map((value) => (
                  <option value={value} key={value}>
                    {value === "NOT_STARTED"
                      ? "Not started"
                      : value === "IN_PROGRESS"
                      ? "In progress"
                      : "Done"}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriorityValue })}
              >
                {TASK_PRIORITY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0) + value.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                value={task.dueDate?.substring(0, 10) ?? ""}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value ? e.target.value : null })}
              />
              <div className="truncate text-muted-foreground">{task.relatedPageId ? task.relatedPageTitle ?? "Linked page" : "-"}</div>
              <div className="flex items-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/workspace/${workspaceId}/sessions?taskId=${encodeURIComponent(task.id)}`)
                  }
                >
                  Start session
                </Button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-semibold text-muted-foreground">No tasks match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
