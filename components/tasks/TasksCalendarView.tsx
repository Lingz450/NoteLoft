"use client";

import { useState } from "react";
import { Badge } from "@/components/common/Badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  course: { code: string; color: string };
  status: string;
  priority: string;
  dueDate: string;
}

interface TasksCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TasksCalendarView({ tasks, onTaskClick }: TasksCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate.startsWith(dateStr));
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {monthName}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`min-h-24 p-2 border border-gray-200 dark:border-gray-700 rounded-lg ${
                date
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-900"
              } ${isToday ? "ring-2 ring-blue-500" : ""}`}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className="w-full text-left p-1.5 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        style={{
                          borderLeft: `3px solid ${task.course.color}`,
                        }}
                      >
                        <div className="truncate font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </div>
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-1.5">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

