"use client";

import { X, Sparkles, Wand2, ListTodo, FileText, Brain, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AISidekickProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestions = [
  { icon: ListTodo, title: "Generate study plan", description: "Create a personalized study schedule" },
  { icon: FileText, title: "Summarize this week", description: "Get an overview of your progress" },
  { icon: Brain, title: "Quiz me", description: "Test your knowledge on a topic" },
  { icon: Wand2, title: "Explain a concept", description: "Get a clear explanation of any topic" },
];

export function AISidekick({ isOpen, onClose }: AISidekickProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I can help you with that! Based on your current progress..." 
      }]);
    }, 500);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/50 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 w-96 border-l border-border bg-card/95 backdrop-blur-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Sidekick</h2>
              <p className="text-xs text-muted-foreground">Your study assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close AI sidekick"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-8rem)] flex-col p-4">
          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="mb-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground">Suggestions</p>
              <div className="space-y-2">
                {suggestions.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setInput(item.title)}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3 text-left transition-all hover:border-primary/30 hover:bg-secondary/50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat area */}
          <div className="flex-1 rounded-xl border border-dashed border-border bg-secondary/20 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  Start a conversation or select a suggestion above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg p-3 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground ml-8"
                        : "bg-secondary text-foreground mr-8"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2.5">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button 
              onClick={handleSend}
              className="rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 shadow-md shadow-primary/20"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

