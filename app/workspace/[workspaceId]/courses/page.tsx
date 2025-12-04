"use client";

import { useState } from "react";
import type { Course } from "@prisma/client";
import { useCourses } from "@/lib/hooks/useCourses";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Plus, GraduationCap, Trash2 } from "lucide-react";

type FormFields = {
  code: string;
  name: string;
  semesterName: string;
  color: string;
  credits: number;
};

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function CoursesPage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const { list, create, update, remove } = useCourses(workspaceId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const courses = list.data ?? [];

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setErrorMessage(null);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: FormFields = {
      code: (formData.get("code") as string).trim(),
      name: (formData.get("name") as string).trim(),
      semesterName: (formData.get("semester") as string).trim(),
      color: (formData.get("color") as string) || COLORS[0],
      credits: Number(formData.get("credits")) || 0,
    };

    if (!payload.code || !payload.name || !payload.semesterName) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    try {
      if (editingCourse) {
        await update.mutateAsync({ id: editingCourse.id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      closeModal();
      event.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to save course. Please try again.");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Delete this course? This will also remove associated tasks and exams.")) return;
    try {
      await remove.mutateAsync(courseId);
    } catch (err) {
      console.error(err);
      alert("Failed to delete course.");
    }
  };

  if (list.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading courses...</div>;
  }

  if (list.isError) {
    return <div className="p-6 text-sm text-destructive">Failed to load courses.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Semester overview</p>
          <h1 className="text-3xl font-semibold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground">Manage your semester courses and track their credits.</p>
        </div>
        <Button
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_15px_30px_-18px_rgba(79,70,229,0.8)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add course
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCourse ? "Edit course" : "Add course"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Course code</label>
            <Input name="code" placeholder="e.g., MATH 2051" defaultValue={editingCourse?.code} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Course name</label>
            <Input name="name" placeholder="e.g., Linear Algebra" defaultValue={editingCourse?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Semester</label>
              <Input
                name="semester"
                placeholder="e.g., Fall 2025"
                defaultValue={editingCourse?.semesterName ?? "Fall 2025"}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Credits</label>
              <Input name="credits" type="number" min="0" placeholder="3" defaultValue={editingCourse?.credits ?? 3} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Color</label>
            <input
              type="color"
              name="color"
              className="h-10 w-full rounded-xl border border-border bg-card"
              defaultValue={editingCourse?.color ?? COLORS[0]}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Saving..." : editingCourse ? "Save changes" : "Add course"}
            </Button>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {courses.length === 0 ? (
        <Card className="text-center text-sm text-muted-foreground">No courses yet - click "Add course" to create one.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="relative space-y-4">
              <button
                onClick={() => handleDelete(course.id)}
                className="absolute right-4 top-4 text-destructive transition hover:text-destructive/80"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl p-3" style={{ backgroundColor: `${course.color}20` }}>
                  <GraduationCap className="h-5 w-5" style={{ color: course.color }} />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Course</p>
                  <p className="text-lg font-semibold text-foreground">{course.code}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-foreground">{course.name}</p>
                <p className="text-sm text-muted-foreground">{course.semesterName}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{course.credits ?? 0} credits</span>
                <span className="text-xs">Color-coded for quick reference</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingCourse(course);
                  setIsModalOpen(true);
                }}
              >
                Edit course
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
