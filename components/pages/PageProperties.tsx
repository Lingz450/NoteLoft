"use client";

/**
 * PageProperties Component
 * 
 * Notion-style page properties panel (tags, status, dates, etc.)
 */

import { useState } from "react";
import { Tag, Calendar, User, Hash, CheckCircle } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";

type PageProperty = {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "multi_select" | "person" | "checkbox";
  value: any;
};

interface PagePropertiesProps {
  pageId: string;
  properties?: PageProperty[];
  onUpdate?: (properties: PageProperty[]) => void;
}

export function PageProperties({ pageId, properties: initialProperties = [], onUpdate }: PagePropertiesProps) {
  const [properties, setProperties] = useState<PageProperty[]>(initialProperties);
  const [isAdding, setIsAdding] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyType, setNewPropertyType] = useState<PageProperty["type"]>("text");

  const defaultProperties: PageProperty[] = [
    {
      id: "status",
      name: "Status",
      type: "select",
      value: "In Progress",
    },
    {
      id: "tags",
      name: "Tags",
      type: "multi_select",
      value: [],
    },
    {
      id: "created",
      name: "Created",
      type: "date",
      value: new Date().toISOString(),
    },
  ];

  const displayProperties = properties.length > 0 ? properties : defaultProperties;

  const handleAddProperty = () => {
    if (!newPropertyName.trim()) return;

    const newProperty: PageProperty = {
      id: `prop-${Date.now()}`,
      name: newPropertyName,
      type: newPropertyType,
      value: newPropertyType === "checkbox" ? false : newPropertyType === "multi_select" ? [] : "",
    };

    const updated = [...properties, newProperty];
    setProperties(updated);
    onUpdate?.(updated);
    setIsAdding(false);
    setNewPropertyName("");
  };

  const handleUpdateProperty = (id: string, value: any) => {
    const updated = properties.map((p) => (p.id === id ? { ...p, value } : p));
    setProperties(updated);
    onUpdate?.(updated);
  };

  const getPropertyIcon = (type: PageProperty["type"]) => {
    switch (type) {
      case "text":
        return <Hash className="w-4 h-4" />;
      case "date":
        return <Calendar className="w-4 h-4" />;
      case "select":
      case "multi_select":
        return <Tag className="w-4 h-4" />;
      case "person":
        return <User className="w-4 h-4" />;
      case "checkbox":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const renderPropertyValue = (property: PageProperty) => {
    switch (property.type) {
      case "text":
        return (
          <input
            type="text"
            value={property.value || ""}
            onChange={(e) => handleUpdateProperty(property.id, e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            placeholder="Enter text..."
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={property.value || ""}
            onChange={(e) => handleUpdateProperty(property.id, parseFloat(e.target.value) || 0)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={property.value ? new Date(property.value).toISOString().split("T")[0] : ""}
            onChange={(e) => handleUpdateProperty(property.id, e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
        );
      case "select":
        return (
          <select
            value={property.value || ""}
            onChange={(e) => handleUpdateProperty(property.id, e.target.value)}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={property.value || false}
            onChange={(e) => handleUpdateProperty(property.id, e.target.checked)}
            className="w-4 h-4"
          />
        );
      default:
        return <span className="text-sm text-gray-500">{String(property.value || "")}</span>;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">Properties</h3>
        {!isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
            + Add
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {displayProperties.map((property) => (
          <div key={property.id} className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 w-4">
              {getPropertyIcon(property.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {property.name}
              </div>
              {renderPropertyValue(property)}
            </div>
          </div>
        ))}

        {isAdding && (
          <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg space-y-2">
            <Input
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              placeholder="Property name"
              autoFocus
            />
            <select
              value={newPropertyType}
              onChange={(e) => setNewPropertyType(e.target.value as PageProperty["type"])}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="multi_select">Multi-select</option>
              <option value="checkbox">Checkbox</option>
            </select>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddProperty}>
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

