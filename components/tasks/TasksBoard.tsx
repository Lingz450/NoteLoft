'use client';

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  type TaskPriorityValue,
  type TaskStatusValue,
} from "@/lib/constants/enums";
import { TaskViewModel } from "./TasksTable";

type Props = {
  workspaceId: string;
  tasks: TaskViewModel[];
  onChange?: (next: TaskViewModel[]) => void;
};

const columns: { key: TaskStatusValue; label: string }[] = [
  { key: "NOT_STARTED", label: "Not started" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
];

export function TasksBoard({ workspaceId, tasks, onChange }: Props) {
  const [local, setLocal] = useState(tasks);

  useEffect(() => {
    setLocal(tasks);
  }, [tasks]);

  async function updateTask(id: string, patch: Partial<TaskViewModel>) {
    const res = await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, workspaceId, ...patch }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const next = local.map((t) => (t.id === id ? { ...t, ...data } : t));
    setLocal(next);
    onChange?.(next);
  }

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const destStatus = destination.droppableId as TaskStatusValue;
    const sourceStatus = source.droppableId as TaskStatusValue;
    if (destStatus === sourceStatus) return;
    updateTask(draggableId, { status: destStatus });
  }

  function priorityColor(priority: TaskPriorityValue) {
    if (priority === "HIGH") return "text-red-600";
    if (priority === "NORMAL") return "text-amber-600";
    return "text-slate-500";
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <Droppable droppableId={col.key} key={col.key}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="min-h-[320px] rounded-2xl border border-border bg-card p-3 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)]"
              >
                <div className="mb-3 flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>{col.label}</span>
                  <span className="text-muted-foreground">
                    {local.filter((t) => t.status === col.key).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {local
                    .filter((t) => t.status === col.key)
                    .map((task, idx) => (
                      <Draggable key={task.id} draggableId={task.id} index={idx}>
                        {(drag) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            className="rounded-2xl border border-border bg-muted/30 p-3 text-sm text-foreground"
                          >
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-muted-foreground">{task.courseDisplay}</p>
                            <div className={`text-xs font-semibold ${priorityColor(task.priority)}`}>{task.priority}</div>
                            {task.dueDate && (
                              <p className="text-xs text-muted-foreground">
                                Due {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
