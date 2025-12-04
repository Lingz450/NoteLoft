"use client";

import { useState } from "react";
import { LayoutGrid, Table } from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCourses } from "@/lib/hooks/useCourses";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { TasksTable } from "@/components/tasks/TasksTable";
import { TasksBoard } from "@/components/tasks/TasksBoard";
import type { TaskViewModel } from "@/components/tasks/TasksTable";
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } from "@/lib/constants/enums";
import { useToast } from "@/components/common/ToastProvider";

export default function TasksPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const { list, create } = useTasks(workspaceId);
  const { list: courseQuery } = useCourses(workspaceId);
  const [view, setView] = useState<"table" | "board">("table");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    courseId: "",
    customCourse: "",
    description: "",
    status: "NOT_STARTED" as (typeof TASK_STATUS_VALUES)[number],
    priority: "NORMAL" as (typeof TASK_PRIORITY_VALUES)[number],
    dueDate: "",
  });
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  if (list.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading tasks...</div>;
  }

  if (list.isError) {
    return <div className="p-6 text-sm text-destructive">Failed to load tasks.</div>;
  }

  const courses = courseQuery.data ?? [];

  const tasks: TaskViewModel[] =
    list.data?.map((task) => ({
      id: task.id,
      title: task.title,
      courseDisplay: task.course?.code ?? task.courseLabel ?? "-",
      courseId: task.courseId ?? null,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? null,
      relatedPageId: task.relatedPageId ?? undefined,
      relatedPageTitle: task.relatedPage?.title ?? undefined,
    })) ?? [];

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formState.title.trim()) {
      setError("Task title is required.");
      return;
    }
    try {
      await create.mutateAsync({
        title: formState.title.trim(),
        courseId: formState.courseId || undefined,
        courseLabel: !formState.courseId ? formState.customCourse.trim() || undefined : undefined,
        description: formState.description.trim() || undefined,
        status: formState.status,
        priority: formState.priority,
        dueDate: formState.dueDate || undefined,
      });
      setFormState({
        title: "",
        courseId: "",
        customCourse: "",
        description: "",
        status: "NOT_STARTED",
        priority: "NORMAL",
        dueDate: "",
      });
      setError(null);
      setIsModalOpen(false);
      toast.push({ title: "Task created", variant: "success" });
    } catch (err) {
      console.error(err);
      setError("Failed to create task. Please try again.");
      toast.push({ title: "Unable to create task", variant: "error" });
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Assignments & revision</p>
          <h1 className="text-3xl font-bold text-foreground">Study tasks</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Capture assignments, readings, and revision work across your semester courses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_15px_30px_-18px_rgba(79,70,229,0.8)]"
            size="sm"
          >
            + New task
          </Button>
          <Button
            variant={view === "table" ? "solid" : "outline"}
            size="sm"
            onClick={() => setView("table")}
            className={view === "table" ? "bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md" : "font-bold text-gray-900 dark:text-white"}
          >
            <Table className="mr-2 h-5 w-5" />
            Table
          </Button>
          <Button
            variant={view === "board" ? "solid" : "outline"}
            size="sm"
            onClick={() => setView("board")}
            className={view === "board" ? "bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md" : "font-bold text-gray-900 dark:text-white"}
          >
            <LayoutGrid className="mr-2 h-5 w-5" />
            Board
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        title="Add task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
            <Input
              value={formState.title}
              onChange={(e) => setFormState((s) => ({ ...s, title: e.target.value }))}
              placeholder="e.g., Finish lab report"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Course</label>
              <select
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
                value={formState.courseId}
                onChange={(e) => setFormState((s) => ({ ...s, courseId: e.target.value }))}
              >
                <option value="">No linked course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            {!formState.courseId && (
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Course label</label>
                <Input
                  value={formState.customCourse}
                  onChange={(e) => setFormState((s) => ({ ...s, customCourse: e.target.value }))}
                  placeholder="e.g., BIO 101"
                />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              placeholder="Add context or acceptance criteria"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Status</label>
              <select
                value={formState.status}
                onChange={(e) => setFormState((s) => ({ ...s, status: e.target.value as typeof formState.status }))}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              >
                {TASK_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {status === "NOT_STARTED" ? "Not started" : status === "IN_PROGRESS" ? "In progress" : "Done"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Priority</label>
              <select
                value={formState.priority}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, priority: e.target.value as typeof formState.priority }))
                }
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              >
                {TASK_PRIORITY_VALUES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0) + priority.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Due date</label>
              <Input type="date" value={formState.dueDate} onChange={(e) => setFormState((s) => ({ ...s, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={create.isPending}>
              {create.isPending ? "Saving..." : "Add task"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {tasks.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            No tasks yet. Use the quick add fields or <span className="font-bold">"New task"</span> to create one.
          </p>
        </Card>
      )}

      {view === "table" ? (
        <TasksTable workspaceId={workspaceId} tasks={tasks} onRefresh={() => list.refetch()} />
      ) : (
        <TasksBoard workspaceId={workspaceId} tasks={tasks} onChange={() => list.refetch()} />
      )}
    </div>
  );
}
