import { prisma } from "@/lib/db";
import { Card } from "@/components/common/Card";
import { 
  FileText, 
  CheckSquare, 
  ClipboardList, 
  MessageSquare,
  Clock,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

export default async function ActivityPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  const activities = await prisma.activityLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const getActivityIcon = (type: string) => {
    if (type.includes("PAGE")) return FileText;
    if (type.includes("TASK")) return CheckSquare;
    if (type.includes("EXAM")) return ClipboardList;
    if (type.includes("COMMENT")) return MessageSquare;
    return Clock;
  };

  const getActivityColor = (type: string) => {
    if (type.includes("CREATED")) return "text-green-600 dark:text-green-400";
    if (type.includes("COMPLETED")) return "text-blue-600 dark:text-blue-400";
    if (type.includes("UPDATED")) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const formatActivityType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity</h1>
        <p className="text-base font-medium text-gray-600 dark:text-gray-400 mt-1">
          Recent activity across your workspace
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Activity Yet</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Start creating pages, tasks, and exams to see activity here
            </p>
          </Card>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <Card key={activity.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatActivityType(activity.type)}
                      </span>
                      {activity.targetTitle && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          • {activity.targetTitle}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(activity.createdAt)} ago
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

