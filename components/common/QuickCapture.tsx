"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, X, CheckSquare, FileText, Calendar, Clock, GraduationCap } from "lucide-react";

export function QuickCapture() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Extract workspace ID from path
  const workspaceId = pathname?.match(/\/workspace\/([^/]+)/)?.[1] || "demo";

  const quickActions = [
    {
      icon: CheckSquare,
      label: "New Task",
      color: "bg-blue-500",
      action: () => router.push(`/workspace/${workspaceId}/tasks?action=new`),
    },
    {
      icon: FileText,
      label: "New Page",
      color: "bg-green-500",
      action: () => router.push(`/workspace/${workspaceId}/pages/new`),
    },
    {
      icon: Clock,
      label: "Study Session",
      color: "bg-purple-500",
      action: () => router.push(`/workspace/${workspaceId}/study`),
    },
    {
      icon: Calendar,
      label: "New Exam",
      color: "bg-red-500",
      action: () => router.push(`/workspace/${workspaceId}/exams?action=new`),
    },
    {
      icon: GraduationCap,
      label: "New Course",
      color: "bg-orange-500",
      action: () => router.push(`/workspace/${workspaceId}/courses?action=new`),
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Action Menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 mb-2 space-y-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-48"
                style={{
                  animation: `slideUp 0.2s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className={`${action.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all ${
          isOpen
            ? "bg-gray-700 dark:bg-gray-600 rotate-45"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-label="Quick capture menu"
      >
        <Plus className="w-6 h-6 text-white mx-auto" />
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

