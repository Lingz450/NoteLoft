import { prisma } from "@/lib/db";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { CheckSquare, FileQuestion, FileText } from "lucide-react";

export default async function ExamStoryboard({
  params,
}: {
  params: { workspaceId: string; examId: string };
}) {
  const { examId } = params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { course: true },
  });

  if (!exam) {
    return <div className="p-6 text-sm text-destructive">Exam not found.</div>;
  }

  // For now, use placeholder data
  // In production, fetch from database:
  // const syllabusItems = await prisma.syllabusItem.findMany({ where: { examId } });
  // const pastQuestions = await prisma.pastQuestion.findMany({ where: { examId } });
  // const cheatSheetSections = await prisma.cheatSheetSection.findMany({ where: { examId } });

  const syllabusItems = [
    { id: "1", title: "Chapter 1: Fundamentals", isCompleted: true },
    { id: "2", title: "Chapter 2: Core Concepts", isCompleted: true },
    { id: "3", title: "Chapter 3: Advanced Topics", isCompleted: false },
    { id: "4", title: "Chapter 4: Applications", isCompleted: false },
  ];

  const pastQuestions = [
    { id: "1", question: "Prove the fundamental theorem...", difficulty: "HARD", isAttempted: true, isCorrect: true },
    { id: "2", question: "Solve for eigenvalues...", difficulty: "MEDIUM", isAttempted: true, isCorrect: false },
    { id: "3", question: "Define and explain...", difficulty: "EASY", isAttempted: false },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge className="font-semibold">{exam.course.code}</Badge>
          <span className="text-gray-400">•</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {exam.date.toLocaleDateString()}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
        <p className="text-base font-medium text-gray-600 dark:text-gray-400 mt-1">
          Exam Storyboard - Your unified war room for preparation
        </p>
      </div>

      {/* Three Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Syllabus Checklist */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Syllabus</h2>
          </div>
          <div className="space-y-2">
            {syllabusItems.map(item => (
              <button
                key={item.id}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  item.isCompleted
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckSquare
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      item.isCompleted ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                  <span className={`text-sm font-medium ${
                    item.isCompleted
                      ? "text-gray-600 dark:text-gray-400 line-through"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {item.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Past Questions */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileQuestion className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Past Questions</h2>
          </div>
          <div className="space-y-3">
            {pastQuestions.map(q => (
              <div key={q.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={`text-xs font-semibold ${
                    q.difficulty === "HARD" ? "bg-red-100 text-red-700" :
                    q.difficulty === "MEDIUM" ? "bg-orange-100 text-orange-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {q.difficulty}
                  </Badge>
                  {q.isAttempted && (
                    <Badge className={q.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                      {q.isCorrect ? "✓ Correct" : "✗ Review"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {q.question}
                </p>
                {!q.isAttempted && (
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Attempt Question
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Cheat Sheet */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cheat Sheet</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Key Formulas</h3>
              <textarea
                placeholder="Add important formulas..."
                rows={4}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Important Concepts</h3>
              <textarea
                placeholder="Key concepts to remember..."
                rows={4}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

