"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Link2, ChevronRight, Filter } from "lucide-react";

interface LinkedItem {
  id: string;
  title: string;
  type: "task" | "exam" | "session" | "page";
  status?: string;
  dueDate?: string;
  metadata?: any;
}

interface LinkedDatabaseProps {
  title: string;
  parentId: string;
  parentType: "course" | "exam" | "task";
  linkType: "task" | "exam" | "session" | "page";
  filter?: (item: LinkedItem) => boolean;
  rollup?: {
    field: string;
    calculation: "count" | "sum" | "average";
  };
}

export function LinkedDatabase({ 
  title, 
  parentId, 
  parentType,
  linkType, 
  filter,
  rollup 
}: LinkedDatabaseProps) {
  const [items, setItems] = useState<LinkedItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Load related items from localStorage based on type
    const storageKey = `noteloft-${linkType}s`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        let allItems = JSON.parse(saved);
        
        // Filter items related to parent
        let relatedItems = allItems.filter((item: any) => {
          if (parentType === "course") {
            return item.courseId === parentId || item.course?.code === parentId;
          }
          return false;
        });

        // Apply custom filter if provided
        if (filter) {
          relatedItems = relatedItems.filter(filter);
        }

        // Map to LinkedItem format
        const mapped = relatedItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          type: linkType,
          status: item.status,
          dueDate: item.dueDate || item.date,
          metadata: item,
        }));

        setItems(mapped);
      } catch (e) {
        // Ignore
      }
    }
  }, [parentId, parentType, linkType, filter]);

  const calculateRollup = () => {
    if (!rollup) return null;

    switch (rollup.calculation) {
      case "count":
        return items.length;
      case "sum":
        return items.reduce((sum, item) => {
          const value = item.metadata?.[rollup.field];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
      case "average":
        const sum = items.reduce((sum, item) => {
          const value = item.metadata?.[rollup.field];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
        return items.length > 0 ? (sum / items.length).toFixed(1) : 0;
      default:
        return null;
    }
  };

  const rollupValue = calculateRollup();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task": return "blue";
      case "exam": return "red";
      case "session": return "purple";
      case "page": return "green";
      default: return "gray";
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <Badge variant="secondary">
            {items.length}
          </Badge>
          {rollupValue !== null && (
            <Badge variant="outline">
              {rollup?.calculation}: {rollupValue}
            </Badge>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No related {linkType}s found
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.status && (
                        <Badge variant="secondary" className="text-xs">
                          {item.status}
                        </Badge>
                      )}
                      {item.dueDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}

