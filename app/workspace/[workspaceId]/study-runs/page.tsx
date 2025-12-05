"use client";

/**
 * Study Runs Page
 * 
 * List and manage all study runs (semester study plans).
 */

import { useState } from "react";
import { Plus, Target, TrendingUp, TrendingDown } from "lucide-react";
import { useStudyRuns } from "@/lib/hooks/useStudyRun";
import { useCourses } from "@/lib/hooks/useCourses";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { STUDY_RUN_GOAL_TYPE_VALUES } from "@/lib/constants/enums";
import Link from "next/link";

export default function StudyRunsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const { list, create } = useStudyRuns(workspaceId);
  const { list: coursesQuery } = useCourses(workspaceId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    goalType: "A_GRADE" as const,
    targetGrade: "A",
    goalDescription: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    preferredDaysPerWeek: 3,
    minutesPerSession: 50,
  });

  const courses = coursesQuery.data || [];
  const studyRuns = list.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await create.mutateAsync({
      workspaceId,
      ...formData,
      preferredDaysPerWeek: Number(formData.preferredDaysPerWeek),
      minutesPerSession: Number(formData.minutesPerSession),
    });

    setIsModalOpen(false);
    setFormData({
      courseId: "",
      goalType: "A_GRADE",
      targetGrade: "A",
      goalDescription: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      preferredDaysPerWeek: 3,
      minutesPerSession: 50,
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Runs</h1>
          <p className="text-base font-medium text-gray-600 dark:text-gray-400 mt-1">
            Structured semester-long study plans with weekly targets
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-primary to-accent">
          <Plus className="w-4 h-4 mr-2" />
          New Study Run
        </Button>
      </div>

      {/* Active Runs */}
      <div className="grid md:grid-cols-2 gap-4">
        {studyRuns.filter(r => r.isActive).map(run => {
          const course = courses.find(c => c.id === run.courseId);
          const totalCompleted = run.weeks.reduce((sum, w) => sum + w.completedMinutes, 0);
          const totalTarget = run.weeks.reduce((sum, w) => sum + w.targetMinutes, 0);
          const progress = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0;

          return (
            <Link key={run.id} href={`/workspace/${workspaceId}/study-runs/${run.id}`}>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course?.color || "#3B82F6" }} />
                      <h3 className="font-bold text-gray-900 dark:text-white">{course?.code || "Course"}</h3>
                    </div>
                    <Badge className="font-semibold">
                      {run.goalType === "A_GRADE" && `Target: ${run.targetGrade}`}
                      {run.goalType === "PASS" && "Pass"}
                      {run.goalType === "CATCH_UP" && "Catch Up"}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-bold text-gray-900 dark:text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {run.weeks.length} weeks · {totalCompleted}/{totalTarget} min
                    </span>
                    <span className="text-blue-600 font-semibold">View details →</span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Study Run">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium"
              required
            >
              <option value="">Select course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Goal Type</label>
            <select
              value={formData.goalType}
              onChange={(e) => setFormData({ ...formData, goalType: e.target.value as any })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium"
            >
              {STUDY_RUN_GOAL_TYPE_VALUES.map(type => (
                <option key={type} value={type}>{type.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          {formData.goalType === "A_GRADE" && (
            <Input
              label="Target Grade"
              value={formData.targetGrade}
              onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value })}
              placeholder="A"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Days per Week"
              type="number"
              min="1"
              max="7"
              value={formData.preferredDaysPerWeek}
              onChange={(e) => setFormData({ ...formData, preferredDaysPerWeek: Number(e.target.value) })}
            />
            <Input
              label="Minutes per Session"
              type="number"
              min="15"
              max="180"
              step="5"
              value={formData.minutesPerSession}
              onChange={(e) => setFormData({ ...formData, minutesPerSession: Number(e.target.value) })}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create Study Run"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

