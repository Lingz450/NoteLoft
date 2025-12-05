"use client";

/**
 * AIPageActions Component
 * 
 * AI-powered actions for pages (summarize, flashcards, extract tasks).
 */

import { useState } from "react";
import { Sparkles, FileText, Brain, ListTodo } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { summarizePage, generateFlashcards, extractTasks } from "@/lib/services/ai-service";

interface AIPageActionsProps {
  pageId: string;
}

export function AIPageActions({ pageId }: AIPageActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modalType, setModalType] = useState<"summary" | "flashcards" | "tasks" | null>(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    setModalType("summary");
    try {
      const summary = await summarizePage(pageId);
      setResult(summary);
    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    setModalType("flashcards");
    try {
      const flashcards = await generateFlashcards(pageId);
      setResult(flashcards);
    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractTasks = async () => {
    setIsLoading(true);
    setModalType("tasks");
    try {
      const tasks = await extractTasks(pageId);
      setResult(tasks);
    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSummarize}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
        >
          <FileText className="w-4 h-4 mr-2" />
          Summarize
        </Button>

        <Button
          onClick={handleGenerateFlashcards}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <Brain className="w-4 h-4 mr-2" />
          Flashcards
        </Button>

        <Button
          onClick={handleExtractTasks}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
        >
          <ListTodo className="w-4 h-4 mr-2" />
          Extract Tasks
        </Button>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null);
          setResult(null);
        }}
        title={
          modalType === "summary"
            ? "AI Summary"
            : modalType === "flashcards"
            ? "Generated Flashcards"
            : "Extracted Tasks"
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              <p className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {modalType === "summary" && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{result}</p>
              </div>
            )}

            {modalType === "flashcards" && (
              <div className="space-y-3">
                {result.map((card: any, i: number) => (
                  <div key={i} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                      Q: {card.question}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      A: {card.answer}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {modalType === "tasks" && (
              <div className="space-y-2">
                {result.map((task: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {task.description}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={() => setModalType(null)} className="w-full">
              Done
            </Button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

