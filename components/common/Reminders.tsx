"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Bell, X, Clock, AlertCircle, CheckCircle, Calendar } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: "task" | "exam" | "session" | "custom";
  dueDate: Date;
  itemId?: string;
  isRead: boolean;
  priority: "low" | "normal" | "high";
}

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load reminders from localStorage
    const saved = localStorage.getItem('noteloft-reminders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const remindersWithDates = parsed.map((r: any) => ({
          ...r,
          dueDate: new Date(r.dueDate),
        }));
        setReminders(remindersWithDates);
        setUnreadCount(remindersWithDates.filter((r: Reminder) => !r.isRead).length);
      } catch (e) {
        // Generate some demo reminders
        generateDemoReminders();
      }
    } else {
      generateDemoReminders();
    }
  }, []);

  const generateDemoReminders = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const demoReminders: Reminder[] = [
      {
        id: "1",
        title: "Upcoming Exam: Linear Algebra",
        description: "Midterm exam in 2 days - don't forget to review chapters 1-5",
        type: "exam",
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        isRead: false,
        priority: "high",
      },
      {
        id: "2",
        title: "Task Due Tomorrow",
        description: "Problem Set 3 - Vector Spaces is due tomorrow",
        type: "task",
        dueDate: tomorrow,
        isRead: false,
        priority: "normal",
      },
      {
        id: "3",
        title: "Study Session Reminder",
        description: "You have a planned study session for CS 2302 in 1 hour",
        type: "session",
        dueDate: new Date(now.getTime() + 60 * 60 * 1000),
        isRead: false,
        priority: "normal",
      },
    ];
    
    setReminders(demoReminders);
    setUnreadCount(demoReminders.length);
    localStorage.setItem('noteloft-reminders', JSON.stringify(demoReminders));
  };

  const handleMarkAsRead = (reminderId: string) => {
    const updated = reminders.map(r =>
      r.id === reminderId ? { ...r, isRead: true } : r
    );
    setReminders(updated);
    setUnreadCount(updated.filter(r => !r.isRead).length);
    localStorage.setItem('noteloft-reminders', JSON.stringify(updated));
  };

  const handleMarkAllAsRead = () => {
    const updated = reminders.map(r => ({ ...r, isRead: true }));
    setReminders(updated);
    setUnreadCount(0);
    localStorage.setItem('noteloft-reminders', JSON.stringify(updated));
  };

  const handleDismiss = (reminderId: string) => {
    const updated = reminders.filter(r => r.id !== reminderId);
    setReminders(updated);
    setUnreadCount(updated.filter(r => !r.isRead).length);
    localStorage.setItem('noteloft-reminders', JSON.stringify(updated));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "normal": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "low": return "text-gray-600 bg-gray-100 dark:bg-gray-700";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task": return CheckCircle;
      case "exam": return AlertCircle;
      case "session": return Clock;
      default: return Bell;
    }
  };

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Reminders List */}
            <div className="flex-1 overflow-y-auto p-2">
              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No notifications
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reminders.map((reminder) => {
                    const TypeIcon = getTypeIcon(reminder.type);
                    return (
                      <div
                        key={reminder.id}
                        className={`p-3 rounded-lg border transition-all ${
                          reminder.isRead
                            ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                            : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(reminder.priority)}`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {reminder.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {reminder.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>{reminder.dueDate.toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{reminder.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDismiss(reminder.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            aria-label="Dismiss notification"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        {!reminder.isRead && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleMarkAsRead(reminder.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark as read
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

