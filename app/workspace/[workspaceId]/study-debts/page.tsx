"use client";

/**
 * Study Debts Page
 * 
 * View and repay missed study sessions.
 */

import { Flame, AlertTriangle, CheckCircle } from "lucide-react";
import { useStudyDebts } from "@/lib/hooks/useStudyDebts";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

export default function StudyDebtsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const { list, summary } = useStudyDebts(workspaceId);

  const debts = list.data || [];
  const summaryData = summary.data;

  const formatDebt = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Flame className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Debts</h1>
        </div>
        <p className="text-base font-medium text-gray-600 dark:text-gray-400">
          Track and repay missed planned study sessions
        </p>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Total Debt</p>
            <p className="text-3xl font-bold text-orange-600">
              {formatDebt(summaryData.totalDebtMinutes)}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Unpaid Sessions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {summaryData.debtCount}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Oldest Debt</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {summaryData.oldestDebtDays}d
            </p>
          </Card>
        </div>
      )}

      {/* Debts List */}
      {debts.length > 0 ? (
        <div className="space-y-3">
          {debts.map((debt: any) => {
            const remaining = debt.durationMinutes - debt.paidMinutes;
            const progress = (debt.paidMinutes / debt.durationMinutes) * 100;

            return (
              <Card key={debt.id} className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          Missed Session - {formatDebt(debt.durationMinutes)}
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Due: {new Date(debt.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`font-semibold ${
                      progress > 0 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {remaining}min left
                    </Badge>
                  </div>

                  {progress > 0 && (
                    <div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                        {debt.paidMinutes}/{debt.durationMinutes} min repaid
                      </p>
                    </div>
                  )}

                  <Button size="sm" variant="outline" className="w-full">
                    Repay with Next Session
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Study Debt!</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            You're keeping up with all your planned sessions. Great work! 🎉
          </p>
        </Card>
      )}
    </div>
  );
}

