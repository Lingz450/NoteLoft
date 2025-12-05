"use client";

/**
 * Page Editor
 * 
 * Full Notion-style page editor with blocks.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlockEditor } from "@/components/editor/BlockEditor";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { 
  ArrowLeft, 
  Star, 
  StarOff, 
  Share2, 
  MoreHorizontal,
  Trash2,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function PageEditorPage({
  params,
}: {
  params: { workspaceId: string; pageId: string };
}) {
  const { workspaceId, pageId } = params;
  const router = useRouter();
  const [page, setPage] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load page
  useEffect(() => {
    const loadPage = async () => {
      try {
        const res = await fetch(`/api/pages/${pageId}`);
        if (!res.ok) throw new Error("Failed to load page");
        
        const data = await res.json();
        setPage(data);
        setTitle(data.title);
        setIcon(data.icon || "");
        setIsFavorite(data.isFavorite);
      } catch (error) {
        console.error("Error loading page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageId]);

  const handleSaveContent = async (content: string) => {
    await fetch(`/api/pages/${pageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  };

  const handleSaveTitle = async () => {
    if (!title.trim()) return;
    
    await fetch(`/api/pages/${pageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, icon }),
    });
  };

  const handleToggleFavorite = async () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    
    await fetch(`/api/pages/${pageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: newValue }),
    });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this page? This cannot be undone.")) return;

    await fetch(`/api/pages/${pageId}`, {
      method: "DELETE",
    });

    router.push(`/workspace/${workspaceId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">Loading page...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top Actions Bar */}
      <div className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href={`/workspace/${workspaceId}`}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to workspace
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              ) : (
                <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Share (coming soon)"
            >
              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="History"
            >
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete page"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto">
        {/* Title & Icon */}
        <div className="px-6 pt-12 pb-4">
          <div className="flex items-start gap-3">
            {/* Icon Picker (simplified) */}
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              onBlur={handleSaveTitle}
              placeholder="🎓"
              className="w-12 h-12 text-3xl text-center border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
              maxLength={2}
            />

            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              placeholder="Untitled"
              className="flex-1 text-4xl font-bold bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700"
            />
          </div>
        </div>

        {/* Block Editor */}
        <BlockEditor
          pageId={pageId}
          initialContent={page?.content || ""}
          onSave={handleSaveContent}
          placeholder="Start writing... Type '/' for commands"
        />
      </div>
    </div>
  );
}

