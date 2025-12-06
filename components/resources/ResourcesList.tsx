"use client";

/**
 * ResourcesList Component
 * 
 * Manage web clippings, PDFs, and file attachments.
 */

import { useState } from "react";
import { Link2, File, Image, Video, Plus, ExternalLink, Trash2 } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";

type Resource = {
  id: string;
  title: string;
  url?: string;
  type: "LINK" | "PDF" | "IMAGE" | "FILE" | "VIDEO";
  createdAt: Date;
};

interface ResourcesListProps {
  workspaceId: string;
  courseId?: string;
  pageId?: string;
}

export function ResourcesList({ workspaceId, courseId, pageId }: ResourcesListProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({ title: "", url: "", type: "LINK" as const });

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newResource,
          workspaceId,
          courseId,
          pageId,
        }),
      });

      if (!res.ok) throw new Error("Failed to add resource");

      const resource = await res.json();
      setResources([resource, ...resources]);
      setNewResource({ title: "", url: "", type: "LINK" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;

    try {
      await fetch(`/api/resources/${id}`, { method: "DELETE" });
      setResources(resources.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "LINK": return <Link2 className="w-4 h-4" />;
      case "PDF": case "FILE": return <File className="w-4 h-4" />;
      case "IMAGE": return <Image className="w-4 h-4" />;
      case "VIDEO": return <Video className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">Resources</h3>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          No resources yet. Add links, PDFs, or files.
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map(resource => (
            <div
              key={resource.id}
              className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-gray-600 dark:text-gray-400">
                  {getIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {resource.title}
                  </div>
                  {resource.url && (
                    <div className="text-xs text-gray-500 truncate">
                      {resource.url}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Resource">
        <form onSubmit={handleAddResource} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Title
            </label>
            <Input
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              placeholder="Research Paper"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              URL or Path
            </label>
            <Input
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              placeholder="https://example.com/paper.pdf"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Type</label>
            <select
              value={newResource.type}
              onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium"
            >
              <option value="LINK">Web Link</option>
              <option value="PDF">PDF Document</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="FILE">Other File</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Add Resource</Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

