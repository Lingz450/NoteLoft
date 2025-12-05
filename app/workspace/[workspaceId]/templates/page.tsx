"use client";

/**
 * Template Gallery Page
 * 
 * Browse and apply templates for pages, study plans, and more.
 */

import { useState } from "react";
import { Sparkles, FileText, GraduationCap, Calendar, Target, BookOpen } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  name: string;
  description: string;
  category: "page" | "study-plan" | "project" | "exam-prep";
  icon: React.ReactNode;
  preview: string[];
};

const templates: Template[] = [
  {
    id: "course-notes",
    name: "Course Notes",
    description: "Structured template for taking course notes with sections for lectures, readings, and key concepts",
    category: "page",
    icon: <BookOpen className="w-6 h-6" />,
    preview: ["📚 Course Overview", "📝 Lecture Notes", "🔑 Key Concepts", "📖 Readings"],
  },
  {
    id: "exam-revision",
    name: "Exam Revision Page",
    description: "Comprehensive exam preparation template with syllabus checklist, past questions, and cheat sheet",
    category: "exam-prep",
    icon: <Target className="w-6 h-6" />,
    preview: ["✓ Syllabus Checklist", "📋 Past Questions", "📝 Cheat Sheet", "⏰ Study Schedule"],
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    description: "Reflect on your week with accomplishments, challenges, and goals for next week",
    category: "page",
    icon: <Calendar className="w-6 h-6" />,
    preview: ["✅ Accomplishments", "🎯 Goals Achieved", "📈 Progress", "🚀 Next Week"],
  },
  {
    id: "study-plan",
    name: "Study Plan Template",
    description: "Create a structured study plan with goals, schedule, and progress tracking",
    category: "study-plan",
    icon: <Target className="w-6 h-6" />,
    preview: ["🎯 Goals", "📅 Schedule", "📊 Progress", "✅ Milestones"],
  },
  {
    id: "project-tracker",
    name: "Project Tracker",
    description: "Track group projects with tasks, deadlines, and team members",
    category: "project",
    icon: <FileText className="w-6 h-6" />,
    preview: ["👥 Team Members", "📋 Tasks", "⏰ Deadlines", "📊 Progress"],
  },
  {
    id: "crash-revision",
    name: "Crash Revision Weekend",
    description: "Intensive weekend revision plan with time blocks and focus areas",
    category: "study-plan",
    icon: <Calendar className="w-6 h-6" />,
    preview: ["⏰ Time Blocks", "📚 Topics", "☕ Breaks", "✅ Checklist"],
  },
];

export default function TemplatesPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUseTemplate = async (template: Template) => {
    // Create a new page from template
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: template.name,
          type: "GENERIC",
          content: JSON.stringify({
            template: template.id,
            blocks: template.preview.map((item, i) => ({
              type: "PARAGRAPH",
              content: item,
              order: i,
            })),
          }),
        }),
      });

      if (!res.ok) throw new Error("Failed to create page");

      const page = await res.json();
      router.push(`/workspace/${workspaceId}/pages/${page.id}/edit`);
    } catch (error) {
      console.error("Error creating page from template:", error);
    }
  };

  const categories = ["all", "page", "study-plan", "exam-prep", "project"] as const;
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>("all");

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Template Gallery</h1>
        </div>
        <p className="text-base font-medium text-gray-600 dark:text-gray-400">
          Choose a template to get started quickly
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              selectedCategory === cat
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="p-5 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => {
              setSelectedTemplate(template);
              setIsModalOpen(true);
            }}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600">
                  {template.icon}
                </div>
                <Badge className="capitalize font-semibold">{template.category.replace("-", " ")}</Badge>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
              </div>

              <div className="space-y-1">
                {template.preview.slice(0, 3).map((item, i) => (
                  <div key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item}
                  </div>
                ))}
                {template.preview.length > 3 && (
                  <div className="text-xs font-medium text-gray-400">
                    +{template.preview.length - 3} more
                  </div>
                )}
              </div>

              <Button className="w-full" size="sm">
                Use Template
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Use Template: ${selectedTemplate.name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTemplate.description}
            </p>

            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                What's included:
              </h4>
              <ul className="space-y-1">
                {selectedTemplate.preview.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span className="text-purple-600">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setIsModalOpen(false);
                }}
              >
                Create Page from Template
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

