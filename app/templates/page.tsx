"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { AppHeader } from "@/components/layout/AppHeader";
import { 
  FileText, 
  CheckSquare, 
  Calendar, 
  GraduationCap,
  Brain,
  Target,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Search
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  category: "study" | "planning" | "tracking" | "collaboration";
  icon: any;
  color: string;
  preview: string;
  data: any;
}

const TEMPLATES: Template[] = [
  {
    id: "exam-cram-plan",
    title: "Exam Cram Plan",
    description: "Structured 7-day intensive study plan for exam preparation",
    category: "study",
    icon: Brain,
    color: "blue",
    preview: "Week-by-week breakdown with daily focus topics and practice sessions",
    data: {
      type: "study-plan",
      duration: 7,
      sessions: ["Morning review", "Afternoon practice", "Evening consolidation"],
    },
  },
  {
    id: "weekly-revision-planner",
    title: "Weekly Revision Planner",
    description: "Plan your weekly study sessions with time blocks and topics",
    category: "planning",
    icon: Calendar,
    color: "green",
    preview: "Monday-Sunday schedule with customizable study blocks",
    data: {
      type: "schedule",
      weekdays: 7,
      blocksPerDay: 4,
    },
  },
  {
    id: "assignment-tracker",
    title: "Assignment Tracker",
    description: "Track all assignments with deadlines, priorities, and progress",
    category: "tracking",
    icon: CheckSquare,
    color: "purple",
    preview: "Task database with status, priority, due date, and course columns",
    data: {
      type: "task-database",
      views: ["table", "board", "calendar"],
    },
  },
  {
    id: "group-project-planner",
    title: "Group Project Planner",
    description: "Collaborate on group projects with task assignments and timelines",
    category: "collaboration",
    icon: Users,
    color: "orange",
    preview: "Shared workspace with task assignments, deadlines, and file links",
    data: {
      type: "project",
      collaborative: true,
    },
  },
  {
    id: "scholarship-tracker",
    title: "Scholarship Tracker",
    description: "Keep track of scholarship applications, deadlines, and requirements",
    category: "tracking",
    icon: Award,
    color: "yellow",
    preview: "Database with application status, deadlines, and essay requirements",
    data: {
      type: "tracker",
      fields: ["Name", "Deadline", "Amount", "Status", "Requirements"],
    },
  },
  {
    id: "course-notes-system",
    title: "Course Notes System",
    description: "Organized note-taking template with lecture notes and summaries",
    category: "study",
    icon: BookOpen,
    color: "indigo",
    preview: "Structured pages for each lecture with date, topic, and key concepts",
    data: {
      type: "notes",
      structure: "lecture-based",
    },
  },
  {
    id: "grade-calculator",
    title: "Grade Calculator Dashboard",
    description: "Track all your grades and calculate semester GPA automatically",
    category: "tracking",
    icon: TrendingUp,
    color: "pink",
    preview: "Interactive dashboard with course grades, weights, and GPA calculation",
    data: {
      type: "dashboard",
      calculations: true,
    },
  },
  {
    id: "study-goals-tracker",
    title: "Study Goals Tracker",
    description: "Set and track your weekly and monthly study goals",
    category: "planning",
    icon: Target,
    color: "red",
    preview: "Goal setting with progress bars, streaks, and achievement tracking",
    data: {
      type: "goals",
      periods: ["daily", "weekly", "monthly"],
    },
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { value: "all", label: "All Templates" },
    { value: "study", label: "Study" },
    { value: "planning", label: "Planning" },
    { value: "tracking", label: "Tracking" },
    { value: "collaboration", label: "Collaboration" },
  ];

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: Template) => {
    alert(`Template "${template.title}" applied! This feature will create the template in your workspace.`);
    // In production, this would create the template structure
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      yellow: "from-yellow-500 to-yellow-600",
      indigo: "from-indigo-500 to-indigo-600",
      pink: "from-pink-500 to-pink-600",
      red: "from-red-500 to-red-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Template Gallery
          </h1>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400">
            Jump-start your workflow with pre-built templates designed for students
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="p-5 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Template Icon/Preview */}
                  <div className={`w-full h-32 bg-gradient-to-br ${getColorClasses(template.color)} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>

                  {/* Template Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {template.title}
                      </h3>
                      <Badge variant="secondary" className="capitalize font-semibold">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                        📋 {template.preview}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                      size="sm"
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert("Template preview coming soon!")}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              No templates found matching your search
            </p>
          </Card>
        )}
        </div>
      </div>
    </>
  );
}

