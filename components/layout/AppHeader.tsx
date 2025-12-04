"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Reminders } from "@/components/common/Reminders";
import { User, Settings } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/workspace/demo" className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            NOTELOFT
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Reminders />
          <Link
            href="/profile"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Profile"
          >
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <Link
            href="/settings"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}

