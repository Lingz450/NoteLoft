"use client";

/**
 * SessionTemplates Component
 * 
 * Pre-configured session templates (deep work, light review, exam cram).
 */

import { Brain, BookOpen, Zap, Clock } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

type SessionTemplate = {
  id: string;
  name: string;
  description: string;
  duration: number;
  breakDuration: number;
  icon: React.ReactNode;
  color: string;
};

const templates: SessionTemplate[] = [
  {
    id: "deep-work",
    name: "Deep Work",
    description: "Focused, distraction-free study session",
    duration: 50,
    breakDuration: 10,
    icon: <Brain className="w-5 h-5" />,
    color: "blue",
  },
  {
    id: "light-review",
    name: "Light Review",
    description: "Quick review and note-taking",
    duration: 25,
    breakDuration: 5,
    icon: <BookOpen className="w-5 h-5" />,
    color: "green",
  },
  {
    id: "exam-cram",
    name: "Exam Cram",
    description: "Intensive focused session for exam prep",
    duration: 90,
    breakDuration: 15,
    icon: <Zap className="w-5 h-5" />,
    color: "red",
  },
];

interface SessionTemplatesProps {
  onSelect: (template: SessionTemplate) => void;
}

export function SessionTemplates({ onSelect }: SessionTemplatesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="p-5 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
          onClick={() => onSelect(template)}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-2 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/20 text-${template.color}-600`}
            >
              {template.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{template.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {template.duration} min
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {template.description}
          </p>
          <Button
            className="w-full"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            Start Session
          </Button>
        </Card>
      ))}
    </div>
  );
}

