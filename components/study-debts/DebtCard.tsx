"use client";

/**
 * DebtCard Component
 * 
 * Dashboard widget showing total study debt.
 */

import Link from "next/link";
import { Card } from "@/components/common/Card";
import { AlertTriangle, Clock } from "lucide-react";

interface DebtCardProps {
  totalDebtMinutes: number;
  debtCount: number;
  oldestDebtDays: number;
  workspaceId: string;
}

export function DebtCard({ totalDebtMinutes, debtCount, oldestDebtDays, workspaceId }: DebtCardProps) {
  if (debtCount === 0) {
    return (
      <Card className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">No Study Debt</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              All planned sessions completed! 🎉
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const debtHours = Math.floor(totalDebtMinutes / 60);
  const debtMins = totalDebtMinutes % 60;

  return (
    <Link href={`/workspace/${workspaceId}/study-debts`}>
      <Card className="p-5 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all cursor-pointer">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Study Debt</h3>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {debtCount} missed session{debtCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="pl-11">
            <p className="text-2xl font-bold text-orange-600">
              {debtHours > 0 && `${debtHours}h `}
              {debtMins}min
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Oldest debt: {oldestDebtDays} day{oldestDebtDays > 1 ? "s" : ""} ago
            </p>
          </div>

          <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
            Click to repay →
          </p>
        </div>
      </Card>
    </Link>
  );
}

