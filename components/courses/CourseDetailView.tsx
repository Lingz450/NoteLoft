"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { calculateGrade } from "@/lib/utils";
import { useToast } from "@/components/common/ToastProvider";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
};

type Exam = {
  id: string;
  title: string;
  date: string;
  location: string | null;
  weight: number | null;
};

type Assessment = {
  id: string;
  title: string;
  score: number | null;
  maxScore: number;
  weight: number;
};

type Props = {
  workspaceId: string;
  course: {
    id: string;
    name: string;
    code: string;
    semesterName: string;
    color: string;
    credits: number | null;
    tasks: Task[];
    exams: Exam[];
    assessmentItems: Assessment[];
  };
};

export function CourseDetailView({ workspaceId, course }: Props) {
  const router = useRouter();
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [examForm, setExamForm] = useState({
    title: "",
    date: "",
    location: "",
    weight: "",
  });
  const [assessmentForm, setAssessmentForm] = useState({
    title: "",
    score: "",
    maxScore: "",
    weight: "",
  });
  const [examError, setExamError] = useState<string | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const toast = useToast();

  const gradeInfo = useMemo(() => {
    const { current } = calculateGrade(
      course.assessmentItems.map((item) => ({
        score: item.score,
        maxScore: item.maxScore,
        weight: item.weight,
      })),
    );
    return current;
  }, [course.assessmentItems]);

  function handleCreateExam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExamError(null);
    startTransition(async () => {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          courseId: course.id,
          title: examForm.title,
          date: examForm.date,
          location: examForm.location || null,
          weight: examForm.weight ? Number(examForm.weight) : null,
        }),
      });
      if (!res.ok) {
        setExamError("Failed to create exam");
        toast.push({ title: "Could not create exam", variant: "error" });
        return;
      }
      setExamForm({ title: "", date: "", location: "", weight: "" });
      setExamModalOpen(false);
      toast.push({ title: "Exam added", variant: "success" });
      router.refresh();
    });
  }

  function handleCreateAssessment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAssessmentError(null);
    startTransition(async () => {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          courseId: course.id,
          title: assessmentForm.title,
          score: assessmentForm.score ? Number(assessmentForm.score) : null,
          maxScore: Number(assessmentForm.maxScore || 0),
          weight: Number(assessmentForm.weight || 0),
        }),
      });
      if (!res.ok) {
        setAssessmentError("Failed to create assessment");
        toast.push({ title: "Could not create assessment", variant: "error" });
        return;
      }
      setAssessmentForm({ title: "", score: "", maxScore: "", weight: "" });
      setAssessmentModalOpen(false);
      toast.push({ title: "Assessment added", variant: "success" });
      router.refresh();
    });
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase text-[var(--muted)]">Course</p>
          <h1 className="text-3xl font-semibold">
            {course.code} · {course.name}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {course.semesterName} · {course.credits ?? 0} credits
          </p>
        </div>
        {gradeInfo !== null && (
          <Card className="p-4 text-center min-w-[180px]">
            <p className="text-xs uppercase text-[var(--muted)]">Current grade</p>
            <p className="text-3xl font-semibold">{gradeInfo.toFixed(1)}%</p>
          </Card>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assignments & tasks</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workspace/${workspaceId}/tasks?action=new&courseId=${course.id}`)}
            >
              View all
            </Button>
          </div>
          {course.tasks.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No tasks yet for this course.</p>
          ) : (
            <div className="space-y-2">
              {course.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {task.status.replace("_", " ").toLowerCase()}
                      {task.dueDate
                        ? ` · due ${new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}`
                        : ""}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/workspace/${workspaceId}/sessions?taskId=${encodeURIComponent(task.id)}&courseId=${course.id}`,
                      )
                    }
                  >
                    Start session
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming exams</h2>
            <Button variant="outline" size="sm" onClick={() => setExamModalOpen(true)}>
              + Add exam
            </Button>
          </div>
          {course.exams.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No exams scheduled for this course.</p>
          ) : (
            <div className="space-y-2">
              {course.exams.map((exam) => (
                <div key={exam.id} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                  <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(exam.date).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {exam.location ? ` · ${exam.location}` : ""}
                    </p>
                  {exam.weight && (
                    <p className="text-xs text-[var(--muted)]">Weight: {exam.weight}%</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assessments</h2>
          <Button variant="outline" size="sm" onClick={() => setAssessmentModalOpen(true)}>
            + Add assessment
          </Button>
        </div>
        {course.assessmentItems.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Track assignments, quizzes or projects here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase text-[var(--muted)]">
                <tr className="text-left">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {course.assessmentItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-4">{item.title}</td>
                    <td className="py-2 pr-4">
                      {item.score !== null ? `${item.score}/${item.maxScore}` : `/${item.maxScore}`}
                    </td>
                    <td className="py-2 pr-4">{item.weight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={examModalOpen} onClose={() => setExamModalOpen(false)} title="Create exam">
        <form onSubmit={handleCreateExam} className="space-y-3">
          {examError && <p className="text-sm text-red-600">{examError}</p>}
          <Input
            placeholder="Exam title"
            value={examForm.title}
            onChange={(e) => setExamForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <Input
            type="datetime-local"
            value={examForm.date}
            onChange={(e) => setExamForm((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
          <Input
            placeholder="Location (optional)"
            value={examForm.location}
            onChange={(e) => setExamForm((prev) => ({ ...prev, location: e.target.value }))}
          />
          <Input
            type="number"
            min="0"
            placeholder="Weight (%)"
            value={examForm.weight}
            onChange={(e) => setExamForm((prev) => ({ ...prev, weight: e.target.value }))}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save exam"}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={assessmentModalOpen} onClose={() => setAssessmentModalOpen(false)} title="Add assessment item">
        <form onSubmit={handleCreateAssessment} className="space-y-3">
          {assessmentError && <p className="text-sm text-red-600">{assessmentError}</p>}
          <Input
            placeholder="Assessment title"
            value={assessmentForm.title}
            onChange={(e) => setAssessmentForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min="0"
              placeholder="Score (optional)"
              value={assessmentForm.score}
              onChange={(e) => setAssessmentForm((prev) => ({ ...prev, score: e.target.value }))}
            />
            <Input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Max score"
              value={assessmentForm.maxScore}
              onChange={(e) => setAssessmentForm((prev) => ({ ...prev, maxScore: e.target.value }))}
              required
            />
          </div>
          <Input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Weight (%)"
            value={assessmentForm.weight}
            onChange={(e) => setAssessmentForm((prev) => ({ ...prev, weight: e.target.value }))}
            required
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Add assessment"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
