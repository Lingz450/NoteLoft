"use client";

/**
 * CalendarView Component
 * 
 * Generic calendar view for any database with date fields (exams, tasks with due dates).
 */

import { useState } from "react";
import { Card } from "@/components/common/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarItem = {
  id: string;
  title: string;
  date: Date;
  color?: string;
  metadata?: any;
};

interface CalendarViewProps<T extends CalendarItem> {
  items: T[];
  onItemClick?: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
}

export function CalendarView<T extends CalendarItem>({
  items,
  onItemClick,
  renderItem,
}: CalendarViewProps<T>) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const days = [];
  let current = new Date(startDate);

  while (days.length < 42) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return items.filter(item => item.date.toDateString() === dateStr);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Day Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div
            key={day}
            className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-xs font-bold text-gray-600 dark:text-gray-400"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((date, index) => {
          const dayItems = getItemsForDate(date);
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-900 min-h-[100px] p-2 ${
                !isCurrentMonth ? "opacity-40" : ""
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${
                isToday
                  ? "w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}>
                {date.getDate()}
              </div>

              {/* Items for this day */}
              <div className="space-y-1">
                {dayItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onItemClick?.(item)}
                    className="w-full text-left px-2 py-1 rounded text-xs font-medium truncate transition-colors"
                    style={{
                      backgroundColor: `${item.color || "#3B82F6"}20`,
                      color: item.color || "#3B82F6",
                    }}
                  >
                    {renderItem ? renderItem(item) : item.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

