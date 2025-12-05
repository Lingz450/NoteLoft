"use client";

/**
 * BacklinksPanel Component
 * 
 * Shows all pages that link to the current page (Notion-style backlinks).
 */

import { useState, useEffect } from "react";
import { Link2, FileText } from "lucide-react";
import { Card } from "@/components/common/Card";
import Link from "next/link";

interface Backlink {
  id: string;
  fromPage: {
    id: string;
    title: string;
    icon?: string;
  };
  context?: string;
}

interface BacklinksPanelProps {
  pageId: string;
  workspaceId: string;
}

export function BacklinksPanel({ pageId, workspaceId }: BacklinksPanelProps) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBacklinks = async () => {
      try {
        const res = await fetch(`/api/pages/${pageId}/backlinks`);
        if (!res.ok) throw new Error("Failed to load backlinks");
        
        const data = await res.json();
        setBacklinks(data);
      } catch (error) {
        console.error("Error loading backlinks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBacklinks();
  }, [pageId]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="text-sm text-gray-500">Loading backlinks...</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-bold text-gray-900 dark:text-white">
          Backlinks {backlinks.length > 0 && `(${backlinks.length})`}
        </h3>
      </div>

      {backlinks.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          <Link2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No pages link to this page yet.</p>
          <p className="text-xs mt-1">Create links using [[Page Name]] syntax</p>
        </div>
      ) : (
        <div className="space-y-3">
          {backlinks.map((backlink) => (
            <Link
              key={backlink.id}
              href={`/workspace/${workspaceId}/pages/${backlink.fromPage.id}/edit`}
              className="block p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start gap-2">
                {backlink.fromPage.icon && (
                  <span className="text-lg">{backlink.fromPage.icon}</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                    {backlink.fromPage.title}
                  </div>
                  {backlink.context && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      ...{backlink.context}...
                    </div>
                  )}
                </div>
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

