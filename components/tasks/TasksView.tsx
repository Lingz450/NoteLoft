'use client';

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { TasksBoard } from "./TasksBoard";
import { TasksTable, TaskViewModel } from "./TasksTable";

type Props = {
  workspaceId: string;
  tasks: TaskViewModel[];
};

export function TasksView({ workspaceId, tasks }: Props) {
  const [view, setView] = useState<"table" | "board">("table");
  const [data, setData] = useState(tasks);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button variant={view === "table" ? "solid" : "outline"} onClick={() => setView("table")}>
          Table view
        </Button>
        <Button variant={view === "board" ? "solid" : "outline"} onClick={() => setView("board")}>
          Board view
        </Button>
      </div>
      {view === "table" ? (
        <TasksTable workspaceId={workspaceId} tasks={data} onChange={setData} />
      ) : (
        <TasksBoard workspaceId={workspaceId} tasks={data} onChange={setData} />
      )}
    </div>
  );
}
