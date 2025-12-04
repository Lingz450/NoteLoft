"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { MessageSquare, Send, Trash2, Edit2 } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  parentId: string;
  edited?: boolean;
}

interface CommentsProps {
  itemId: string;
  itemType: "page" | "task" | "exam" | "course";
}

export function Comments({ itemId, itemType }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const storageKey = `noteloft-comments-${itemType}-${itemId}`;

  // Load comments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setComments(parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        })));
      } catch (e) {
        // Ignore
      }
    }
  }, [storageKey]);

  // Save comments to localStorage
  const saveComments = (updatedComments: Comment[]) => {
    setComments(updatedComments);
    localStorage.setItem(storageKey, JSON.stringify(updatedComments));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: "Student", // In production, use actual user name
      content: newComment,
      timestamp: new Date(),
      parentId: itemId,
    };

    saveComments([...comments, comment]);
    setNewComment("");
  };

  const handleEditComment = (commentId: string) => {
    if (!editContent.trim()) return;

    const updated = comments.map(c =>
      c.id === commentId
        ? { ...c, content: editContent, edited: true }
        : c
    );
    saveComments(updated);
    setEditingId(null);
    setEditContent("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    saveComments(comments.filter(c => c.id !== commentId));
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Comments</span>
        {comments.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
            {comments.length}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditContent("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {comment.timestamp.toLocaleString()}
                            {comment.edited && " (edited)"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(comment)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            aria-label="Edit comment"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New Comment Input */}
          <div className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or note..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

