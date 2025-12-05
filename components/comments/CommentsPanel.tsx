"use client";

/**
 * CommentsPanel Component
 * 
 * Threaded comments with @mentions for pages, tasks, and exams.
 */

import { useState, useEffect } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  createdAt: Date;
  mentions: {
    targetName: string;
  }[];
};

interface CommentsPanelProps {
  targetType: "page" | "task" | "exam";
  targetId: string;
  workspaceId: string;
}

export function CommentsPanel({ targetType, targetId, workspaceId }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const res = await fetch(`/api/comments?${targetType}Id=${targetId}`);
        if (!res.ok) throw new Error("Failed to load comments");
        
        const data = await res.json();
        setComments(data);
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };

    loadComments();
  }, [targetType, targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          [`${targetType}Id`]: targetId,
          content: newComment,
          authorName: "Student", // Will be replaced with real user later
        }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const comment = await res.json();
      setComments([comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Detect @ symbol for mentions
    if (e.key === "@") {
      setShowMentions(true);
    }

    // Submit with Cmd/Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const insertMention = (name: string) => {
    setNewComment(prev => prev + `@${name} `);
    setShowMentions(false);
  };

  // Sample mention suggestions
  const mentionSuggestions = ["Alice", "Bob", "Carol", "Study Group"];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-bold text-gray-900 dark:text-white">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comment Composer */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... Type @ to mention someone"
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none resize-none"
          />

          {/* Mention Suggestions */}
          {showMentions && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden z-10">
              {mentionSuggestions.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => insertMention(name)}
                  className="w-full px-4 py-2 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Tip: Use @ to mention, Cmd+Enter to submit
          </p>
          <Button type="submit" size="sm" disabled={isLoading || !newComment.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? "Posting..." : "Comment"}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
                {comment.mentions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {comment.mentions.map((mention, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                      >
                        {mention.targetName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

