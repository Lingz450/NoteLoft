"use client";

/**
 * PageHistory Component
 * 
 * View past revisions of a page (Notion-style version history).
 */

import { useState, useEffect } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";

type PageRevision = {
  id: string;
  snapshot: string; // JSON string
  createdAt: Date;
  createdBy?: string;
};

interface PageHistoryProps {
  pageId: string;
}

export function PageHistory({ pageId }: PageHistoryProps) {
  const [revisions, setRevisions] = useState<PageRevision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<PageRevision | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRevisions = async () => {
      try {
        const res = await fetch(`/api/pages/${pageId}/revisions`);
        if (!res.ok) throw new Error("Failed to load revisions");
        
        const data = await res.json();
        setRevisions(data);
      } catch (error) {
        console.error("Error loading revisions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRevisions();
  }, [pageId]);

  const handleViewRevision = (revision: PageRevision) => {
    setSelectedRevision(revision);
  };

  const parsedSnapshot = selectedRevision ? JSON.parse(selectedRevision.snapshot) : null;

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">Version History</h3>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-sm text-gray-500">Loading...</div>
        ) : revisions.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No history yet. Versions are saved periodically as you edit.
          </div>
        ) : (
          <div className="space-y-2">
            {revisions.map((revision) => (
              <button
                key={revision.id}
                onClick={() => handleViewRevision(revision)}
                className="w-full flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-left"
              >
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">
                    {new Date(revision.createdAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {revision.createdBy || "Auto-saved"}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Revision Viewer Modal */}
      <Modal
        isOpen={selectedRevision !== null}
        onClose={() => setSelectedRevision(null)}
        title={`Version from ${selectedRevision ? new Date(selectedRevision.createdAt).toLocaleString() : ""}`}
      >
        {parsedSnapshot && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Title</label>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {parsedSnapshot.title}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Content</label>
              <div 
                className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                dangerouslySetInnerHTML={{ __html: parsedSnapshot.content }}
              />
            </div>

            <Button onClick={() => setSelectedRevision(null)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}

