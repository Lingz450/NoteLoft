"use client";

/**
 * InlineDatabase Component
 * 
 * Notion-style inline database embedded in pages.
 */

import { useState } from "react";
import { Database, Plus, MoreVertical } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";

type DatabaseProperty = {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "person";
  options?: string[]; // For select type
};

type DatabaseRow = {
  id: string;
  properties: Record<string, any>;
};

interface InlineDatabaseProps {
  databaseId: string;
  title: string;
  viewType: "TABLE" | "BOARD" | "CALENDAR" | "GALLERY";
  properties: DatabaseProperty[];
  rows: DatabaseRow[];
  onUpdate?: (rows: DatabaseRow[]) => void;
}

export function InlineDatabase({
  databaseId,
  title,
  viewType,
  properties,
  rows,
  onUpdate,
}: InlineDatabaseProps) {
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});

  const handleAddRow = async () => {
    const newRow: DatabaseRow = {
      id: `row-${Date.now()}`,
      properties: newRowData,
    };

    const updated = [...rows, newRow];
    onUpdate?.(updated);
    setIsAddingRow(false);
    setNewRowData({});
  };

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700">
            {properties.map((prop) => (
              <th
                key={prop.id}
                className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400"
              >
                {prop.name}
              </th>
            ))}
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              {properties.map((prop) => (
                <td key={prop.id} className="px-4 py-3 text-sm">
                  {renderPropertyValue(row.properties[prop.id], prop.type)}
                </td>
              ))}
              <td className="px-4 py-3">
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPropertyValue = (value: any, type: string) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }

    switch (type) {
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={value}
            readOnly
            className="w-4 h-4"
          />
        );
      case "date":
        return <span>{new Date(value).toLocaleDateString()}</span>;
      case "select":
        return <Badge>{value}</Badge>;
      case "number":
        return <span className="font-mono">{value}</span>;
      default:
        return <span>{String(value)}</span>;
    }
  };

  return (
    <Card className="p-4 my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          <Badge className="text-xs">{viewType}</Badge>
        </div>
        <Button size="sm" onClick={() => setIsAddingRow(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>

      {viewType === "TABLE" && renderTableView()}

      {rows.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No rows yet. Click "Add Row" to get started.</p>
        </div>
      )}

      {/* Add Row Modal */}
      <Modal isOpen={isAddingRow} onClose={() => setIsAddingRow(false)} title="Add Row">
        <div className="space-y-4">
          {properties.map((prop) => (
            <div key={prop.id}>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                {prop.name}
              </label>
              {prop.type === "text" && (
                <Input
                  value={newRowData[prop.id] || ""}
                  onChange={(e) =>
                    setNewRowData({ ...newRowData, [prop.id]: e.target.value })
                  }
                />
              )}
              {prop.type === "number" && (
                <Input
                  type="number"
                  value={newRowData[prop.id] || ""}
                  onChange={(e) =>
                    setNewRowData({
                      ...newRowData,
                      [prop.id]: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              )}
              {prop.type === "date" && (
                <Input
                  type="date"
                  value={newRowData[prop.id] || ""}
                  onChange={(e) =>
                    setNewRowData({ ...newRowData, [prop.id]: e.target.value })
                  }
                />
              )}
              {prop.type === "select" && (
                <select
                  value={newRowData[prop.id] || ""}
                  onChange={(e) =>
                    setNewRowData({ ...newRowData, [prop.id]: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Select...</option>
                  {prop.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
              {prop.type === "checkbox" && (
                <input
                  type="checkbox"
                  checked={newRowData[prop.id] || false}
                  onChange={(e) =>
                    setNewRowData({ ...newRowData, [prop.id]: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleAddRow}>
              Add Row
            </Button>
            <Button variant="outline" onClick={() => setIsAddingRow(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

