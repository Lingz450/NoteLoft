"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { AppHeader } from "@/components/layout/AppHeader";
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  Brain, 
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  GraduationCap,
  Calendar,
  Pencil,
  X,
  Link as LinkIcon,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const quickActions = [
    {
      icon: FileText,
      title: "Summarize my study notes",
      prompt: "Help me create a summary of my recent study notes for MATH 2051",
      color: "blue"
    },
    {
      icon: CheckSquare,
      title: "Create study plan",
      prompt: "Create a study plan for my upcoming exams based on my courses and schedule",
      color: "green"
    },
    {
      icon: Brain,
      title: "Quiz me on topics",
      prompt: "Create practice questions for Linear Algebra based on my course materials",
      color: "purple"
    },
    {
      icon: TrendingUp,
      title: "Analyze my progress",
      prompt: "Analyze my study patterns and suggest improvements based on my data",
      color: "orange"
    },
    {
      icon: Lightbulb,
      title: "Study technique tips",
      prompt: "Suggest effective study techniques for Computer Science courses",
      color: "yellow"
    },
    {
      icon: Target,
      title: "Set weekly goals",
      prompt: "Help me set realistic study goals for this week based on my schedule",
      color: "red"
    },
  ];

  const handleSend = async (customPrompt?: string) => {
    const messageContent = customPrompt || input;
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setShowQuickActions(false);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I can help you with that! Based on your courses and study patterns, here are some suggestions:\n\n1. Focus on your MATH 2051 course as you have an upcoming exam\n2. Allocate 50-minute study sessions with breaks\n3. Review your recent notes and create flashcards for key concepts\n\nWould you like me to create a detailed study schedule or help with specific topics?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Noteloft AI Assistant
          </h1>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Your intelligent study companion - Ask anything, get help, stay focused
          </p>
        </div>

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-6 py-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        AI Assistant
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-2xl px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Get Started
              </h2>
              <button
                onClick={() => setShowQuickActions(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Close quick actions"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left group"
                  >
                    <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20`}>
                      <Icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {action.title}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* AI Capabilities */}
        {messages.length === 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Ask Anything
                </h3>
              </div>
              <ul className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li>• Get help understanding difficult concepts</li>
                <li>• Ask questions about your courses</li>
                <li>• Request study tips and strategies</li>
                <li>• Get homework and assignment guidance</li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Smart Suggestions
                </h3>
              </div>
              <ul className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li>• Personalized study schedules</li>
                <li>• Task prioritization recommendations</li>
                <li>• Exam preparation strategies</li>
                <li>• Progress analysis and insights</li>
              </ul>
            </Card>
          </div>
        )}

        {/* Input Box */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <button className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full">
                <LinkIcon className="w-3 h-3 inline mr-1" />
                Add context
              </button>
              <button className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full">
                <BookOpen className="w-3 h-3 inline mr-1" />
                My courses
              </button>
              <button className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full">
                <Calendar className="w-3 h-3 inline mr-1" />
                My schedule
              </button>
            </div>

            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask, search, or make anything..."
                rows={4}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isThinking}
                className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                  input.trim() && !isThinking
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              <Sparkles className="w-3 h-3" />
              <span>Powered by AI • Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </Card>

        {/* AI Capabilities Info */}
        {messages.length === 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Study Helper
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Get explanations, summaries, and study materials for your courses
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Smart Planner
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Create personalized study plans and manage your time effectively
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Progress Insights
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Analyze your study habits and get personalized recommendations
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Example Prompts */}
        {messages.length === 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Try asking:
            </h3>
            <div className="space-y-2">
              {[
                "How can I improve my study efficiency?",
                "Create a revision schedule for my Linear Algebra exam",
                "What are the best study techniques for memorizing formulas?",
                "Summarize the Pomodoro technique for studying",
                "Help me prioritize my tasks for this week",
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInput(example)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2 text-gray-400" />
                  {example}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Features Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Context-Aware AI
              </h3>
              <p className="text-sm opacity-90">
                The AI has access to your courses, tasks, schedule, and study sessions to provide
                personalized assistance. All suggestions are tailored to your specific academic needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

