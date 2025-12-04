"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Clock, RotateCcw, Eye, X } from "lucide-react";

interface Version {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  changeDescription?: string;
}

interface VersionHistoryProps {
  itemId: string;
  itemType: "page" | "task";
  currentContent: string;
  onRestore?: (content: string) => void;
}

export function VersionHistory({ itemId, itemType, currentContent, onRestore }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);

  const storageKey = `noteloft-history-${itemType}-${itemId}`;

  // Load version history
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVersions(parsed.map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp),
        })));
      } catch (e) {
        // Ignore
      }
    }
  }, [storageKey]);

  // Save current version when content changes
  const saveVersion = () => {
    const version: Version = {
      id: Date.now().toString(),
      content: currentContent,
      timestamp: new Date(),
      author: "Student",
      changeDescription: "Auto-saved",
    };

    const updated = [version, ...versions].slice(0, 50); // Keep last 50 versions
    setVersions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleRestore = (version: Version) => {
    if (!confirm(`Restore to version from ${version.timestamp.toLocaleString()}?`)) return;
    
    if (onRestore) {
      onRestore(version.content);
    }
    setIsOpen(false);
    setPreviewVersion(null);
  };

  const getTimeDiff = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Clock className="w-4 h-4" />
        <span>Version History</span>
        {versions.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {versions.length}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => {
          setIsOpen(false);
          setPreviewVersion(null);
        }}
      />

      {/* Version History Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Version History
            </h2>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              setPreviewVersion(null);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Close version history"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Save Current Version Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            onClick={saveVersion}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Save Current Version
          </Button>
        </div>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No version history yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Changes will be saved automatically
              </p>
            </div>
          ) : (
            versions.map((version, index) => (
              <div
                key={version.id}
                className={`p-3 rounded-lg border transition-all ${
                  previewVersion?.id === version.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Latest
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeDiff(version.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {version.author}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {version.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>

                {version.changeDescription && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {version.changeDescription}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewVersion(version)}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  {index !== 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleRestore(version)}
                      className="flex-1"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview Modal */}
        {previewVersion && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Preview Version
              </h3>
              <button
                onClick={() => setPreviewVersion(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-full">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {previewVersion.content}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  size="sm"
                  onClick={() => handleRestore(previewVersion)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore This Version
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

