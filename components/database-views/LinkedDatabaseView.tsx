"use client";

/**
 * LinkedDatabaseView Component
 * 
 * Shows relations between entities (Notion-style linked databases).
 */

import { useState } from "react";
import { Link2, Plus, ExternalLink } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

type Relation = {
  id: string;
  type: "task" | "course" | "exam" | "page";
  title: string;
  status?: string;
  metadata?: any;
};

interface LinkedDatabaseViewProps {
  sourceType: "page" | "course" | "exam";
  sourceId: string;
  relationType: "task" | "course" | "exam" | "page";
  relations: Relation[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
}

export function LinkedDatabaseView({
  sourceType,
  sourceId,
  relationType,
  relations,
  onAdd,
  onRemove,
}: LinkedDatabaseViewProps) {
  const getRelationIcon = (type: string) => {
    switch (type) {
      case "task":
        return "✓";
      case "course":
        return "🎓";
      case "exam":
        return "📝";
      case "page":
        return "📄";
      default:
        return "•";
    }
  };

  const getRelationColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
      case "course":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
      case "exam":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300";
      case "page":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-bold text-gray-900 dark:text-white capitalize">
            {relationType}s ({relations.length})
          </h3>
        </div>
        {onAdd && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {relations.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          <Link2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No {relationType}s linked yet.</p>
          {onAdd && (
            <Button size="sm" variant="outline" onClick={onAdd} className="mt-3">
              Link {relationType}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {relations.map((relation) => (
            <div
              key={relation.id}
              className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">{getRelationIcon(relation.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {relation.title}
                  </div>
                  {relation.status && (
                    <Badge className={`text-xs mt-1 ${getRelationColor(relation.type)}`}>
                      {relation.status}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="View"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                {onRemove && (
                  <button
                    onClick={() => onRemove(relation.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Unlink"
                  >
                    <span className="text-red-600 text-xs">×</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

