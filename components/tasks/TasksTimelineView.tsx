"use client";

import { Badge } from "@/components/common/Badge";
import { Calendar, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  course: { code: string; color: string };
  status: string;
  priority: string;
  dueDate: string;
}

interface TasksTimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TasksTimelineView({ tasks, onTaskClick }: TasksTimelineViewProps) {
  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const dateKey = new Date(task.dueDate).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort dates
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  const getRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  return (
    <div className="space-y-1">
      {sortedDates.map((dateStr) => {
        const dateTasks = tasksByDate[dateStr];
        const date = new Date(dateStr);
        const isOverdue = date < new Date() && dateTasks.some(t => t.status !== "DONE");

        return (
          <div key={dateStr} className="relative">
            {/* Date Header */}
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isOverdue
                    ? "bg-red-500"
                    : date.toDateString() === new Date().toDateString()
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`} />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getRelativeDate(dateStr)} • {dateTasks.length} {dateTasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tasks for this date */}
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-6 pb-4 space-y-3">
              {dateTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          style={{ borderColor: task.course.color }}
                        >
                          {task.course.code}
                        </Badge>
                        <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"}>
                          {task.priority}
                        </Badge>
                        <Badge variant={
                          task.status === "DONE" ? "default" :
                          task.status === "IN_PROGRESS" ? "secondary" :
                          "outline"
                        }>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {sortedDates.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tasks scheduled
          </p>
        </div>
      )}
    </div>
  );
}

