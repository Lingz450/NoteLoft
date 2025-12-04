"use client";

import { useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { 
  Sparkles, 
  X, 
  Minimize2,
  Maximize2,
  Send,
  RefreshCw,
  FileText,
  Lightbulb,
  MessageSquare
} from "lucide-react";

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export function AISidekick() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const quickPrompts = [
    { icon: FileText, text: "Summarize this page", action: "summarize" },
    { icon: Lightbulb, text: "Explain this concept", action: "explain" },
    { icon: RefreshCw, text: "Rewrite clearly", action: "rewrite" },
    { icon: MessageSquare, text: "Ask a question", action: "question" },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AIMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: AIMessage = {
        role: "assistant",
        content: "I can help you with that! Based on your current page and study materials, here's what I suggest...",
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 p-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        aria-label="Open AI assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed right-6 z-40 transition-all ${
        isMinimized ? "bottom-24 w-80" : "bottom-6 w-96 h-[600px]"
      }`}
    >
      <Card className="h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Close AI assistant"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Quick Prompts */}
            {messages.length === 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Quick actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={prompt.action}
                        onClick={() => setInput(prompt.text)}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                      >
                        <Icon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    How can I help?
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ask me anything about your studies
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className={`p-2 rounded-lg transition-all ${
                    input.trim() && !isThinking
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {isMinimized && (
          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI Assistant minimized
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

