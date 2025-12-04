"use client";

import { useState } from "react";
import { Calendar, MapPin, Percent, Plus, Trash2 } from "lucide-react";
import { useExams } from "@/lib/hooks/useExams";
import { useCourses } from "@/lib/hooks/useCourses";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";

const formatDateTimeInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ExamsPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const examsStore = useExams(workspaceId);
  const coursesStore = useCourses(workspaceId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (examsStore.list.isLoading || coursesStore.list.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading exams...</div>;
  }

  if (examsStore.list.isError || coursesStore.list.isError) {
    return <div className="p-6 text-sm text-destructive">Failed to load exams.</div>;
  }

  const exams = examsStore.list.data ?? [];
  const courses = coursesStore.list.data ?? [];

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
    setEditingExam(null);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const dateValue = formData.get("date") as string;
    const payload = {
      courseId: formData.get("courseId") as string,
      title: (formData.get("title") as string)?.trim(),
      date: new Date(dateValue),
      location: (formData.get("location") as string) || null,
      weight: formData.get("weight") ? Number(formData.get("weight")) : null,
      notes: (formData.get("notes") as string) || null,
    };

    if (!payload.courseId || !payload.title || !dateValue) {
      setErrorMessage("Course, title, and date are required.");
      return;
    }

    try {
      if (editingExam) {
        await examsStore.update.mutateAsync({ id: editingExam.id, ...payload });
      } else {
        await examsStore.create.mutateAsync(payload);
      }
      event.currentTarget.reset();
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to save exam. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    try {
      await examsStore.remove.mutateAsync(id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete exam.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Revision planning</p>
          <h1 className="text-3xl font-semibold text-foreground">Exams</h1>
          <p className="text-sm text-muted-foreground">Track upcoming exams and allocate revision time.</p>
        </div>
        <Button
          onClick={() => {
            setEditingExam(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_15px_30px_-18px_rgba(79,70,229,0.8)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add exam
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingExam ? "Edit exam" : "Add exam"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Course</label>
            <select
              name="courseId"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              defaultValue={editingExam?.courseId ?? ""}
              required
            >
              <option value="" disabled>
                Select course
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Title</label>
            <Input name="title" defaultValue={editingExam?.title} placeholder="Midterm exam" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Date & time</label>
              <input
                type="datetime-local"
                name="date"
                defaultValue={formatDateTimeInput(editingExam?.date)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Weight (%)</label>
              <Input type="number" name="weight" min="0" max="100" defaultValue={editingExam?.weight ?? ""} placeholder="25" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Location</label>
            <Input name="location" defaultValue={editingExam?.location ?? ""} placeholder="Room 204" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
            <textarea
              name="notes"
              defaultValue={editingExam?.notes ?? ""}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={examsStore.create.isPending || examsStore.update.isPending}>
              {examsStore.create.isPending || examsStore.update.isPending
                ? "Saving..."
                : editingExam
                ? "Save changes"
                : "Add exam"}
            </Button>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {exams.length === 0 ? (
        <Card className="text-center text-sm text-muted-foreground">
          No exams yet. Click "Add exam" to plan your first one.
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="relative space-y-3">
              <button onClick={() => handleDelete(exam.id)} className="absolute right-4 top-4 text-destructive hover:text-destructive/80">
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground">Exam</p>
                  <p className="text-xl font-semibold text-foreground">{exam.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 text-xs">
                      {exam.course.code}
                    </span>
                    <span>{exam.course.name}</span>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(exam.date).toLocaleString()}
                  </div>
                  {exam.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {exam.location}
                    </div>
                  )}
                  {typeof exam.weight === "number" && (
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      {exam.weight}% of grade
                    </div>
                  )}
                </div>
              </div>
              {exam.notes && (
                <p className="rounded-2xl border border-border bg-muted/20 p-3 text-sm text-foreground">{exam.notes}</p>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingExam(exam);
                    setIsModalOpen(true);
                  }}
                >
                  Edit exam
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
