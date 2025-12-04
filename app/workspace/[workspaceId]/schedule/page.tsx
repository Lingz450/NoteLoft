"use client";

import { FormEvent, useMemo, useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Plus, Trash2 } from "lucide-react";
import { useSchedule, type ScheduleSlot } from "@/lib/hooks/useSchedule";
import { useCourses } from "@/lib/hooks/useCourses";
import { TIMETABLE_SLOT_TYPE_VALUES, type TimetableSlotTypeValue } from "@/lib/constants/enums";
import { useToast } from "@/components/common/ToastProvider";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

type ScheduleFormFields = {
  title: string;
  courseId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: TimetableSlotTypeValue;
};

export default function SchedulePage({ params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  const { list, create, update, remove } = useSchedule(workspaceId);
  const { list: coursesQuery } = useCourses(workspaceId);
  const courses = coursesQuery.data ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToast();

  const slots = useMemo(() => list.data ?? [], [list.data]);
  const isSaving = create.isPending || update.isPending;

  const slotsByHourAndDay = useMemo(() => {
    const map = new Map<string, ScheduleSlot[]>();
    slots.forEach((slot) => {
      const hour = Number.parseInt(slot.startTime.split(":")[0] ?? "0", 10);
      const key = `${hour}-${slot.dayOfWeek}`;
      const existing = map.get(key) ?? [];
      existing.push(slot);
      map.set(key, existing);
    });
    return map;
  }, [slots]);

  if (list.isLoading || coursesQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading schedule</div>;
  }

  if (list.isError || coursesQuery.isError) {
    return <div className="p-6 text-sm text-destructive">Failed to load schedule data.</div>;
  }

  const openModal = (slotId?: string) => {
    setEditingId(slotId ?? null);
    setError(null);
    setIsModalOpen(true);
  };

  const editingSlot = editingId ? slots.find((s) => s.id === editingId) : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const typeValue = formData.get("type") as string;
    const payload: ScheduleFormFields = {
      title: (formData.get("title") as string).trim(),
      courseId: (formData.get("courseId") as string) || "",
      dayOfWeek: Number(formData.get("dayOfWeek") ?? 0),
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      type: (typeValue as TimetableSlotTypeValue) || "LECTURE",
    };

    if (!payload.title || !payload.startTime || !payload.endTime) {
      setError("Fill out all required fields.");
      return;
    }

    const action = editingSlot
      ? update.mutateAsync({
          id: editingSlot.id,
          ...payload,
          courseId: payload.courseId ? payload.courseId : null,
        })
      : create.mutateAsync({
          ...payload,
          courseId: payload.courseId ? payload.courseId : null,
        });

    try {
      await action;
      setIsModalOpen(false);
      setEditingId(null);
      setError(null);
      event.currentTarget.reset();
      toast.push({
        title: editingSlot ? "Schedule updated" : "Class added",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      setError("Unable to save schedule entry.");
      toast.push({ title: "Failed to save schedule", variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!confirm("Remove this class from your schedule?")) return;
    try {
      setDeletingId(id);
      await remove.mutateAsync(id);
      toast.push({ title: "Class removed", variant: "success" });
    } catch (err) {
      console.error(err);
      toast.push({ title: "Failed to delete class", variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Timetable</p>
          <h1 className="text-3xl font-bold text-foreground">Weekly schedule</h1>
          <p className="text-sm font-medium text-muted-foreground">Your timetable for lectures, labs, and study blocks.</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_15px_30px_-18px_rgba(79,70,229,0.8)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add class
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title={editingSlot ? "Edit class" : "Add class to schedule"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Class title</label>
            <Input name="title" placeholder="e.g., Linear Algebra lecture" defaultValue={editingSlot?.title} required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Course</label>
            <select
              name="courseId"
              defaultValue={editingSlot?.courseId ?? ""}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="">No linked course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="day-select" className="mb-1 block text-sm font-medium text-foreground">
              Day
            </label>
            <select
              id="day-select"
              name="dayOfWeek"
              required
              defaultValue={editingSlot?.dayOfWeek ?? 0}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              {DAYS.map((day, index) => (
                <option value={index} key={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Block type</label>
            <select
              name="type"
              defaultValue={editingSlot?.type ?? "LECTURE"}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              {TIMETABLE_SLOT_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>
                  {type.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Start time</label>
              <Input name="startTime" type="time" defaultValue={editingSlot?.startTime || "09:00"} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">End time</label>
              <Input name="endTime" type="time" defaultValue={editingSlot?.endTime || "10:30"} required />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? "Saving" : editingSlot ? "Save changes" : "Add to schedule"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Table Structure with Clear Grid Lines */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/40">
                  <th className="border border-border p-3 text-center text-sm font-bold text-foreground w-24">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th key={day} className="border border-border p-3 text-center text-sm font-bold text-foreground min-w-[120px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour, rowIndex) => (
                  <tr key={`row-${hour}`} className={rowIndex % 2 === 0 ? "bg-card" : "bg-muted/10"}>
                    <td className="border border-border p-3 text-center text-xs font-medium text-muted-foreground">
                      {String(hour).padStart(2, "0")}:00
                    </td>
                    {DAYS.map((_, dayIndex) => {
                      const cellSlots = slotsByHourAndDay.get(`${hour}-${dayIndex}`) ?? [];
                      if (cellSlots.length === 0) {
                        return (
                          <td key={`${hour}-${dayIndex}`} className="border border-border p-2">
                            <button
                              className="w-full h-16 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/30 rounded-lg"
                              onClick={() => openModal()}
                            >
                              &nbsp;
                            </button>
                          </td>
                        );
                      }
                      return (
                        <td key={`${hour}-${dayIndex}`} className="border border-border p-2">
                          <div className="space-y-2">
                            {cellSlots.map((slot) => (
                              <button
                                key={slot.id}
                                className="group relative w-full rounded-lg border-2 border-transparent px-3 py-2 text-left transition-all hover:border-primary/50 hover:shadow-md"
                                style={{ backgroundColor: `${slot.course?.color ?? "#3B82F6"}22` }}
                                onClick={() => openModal(slot.id)}
                              >
                                <div className="text-xs font-bold" style={{ color: slot.course?.color ?? "#1f2937" }}>
                                  {slot.course?.code ?? "Study"}
                                </div>
                                <div className="text-xs font-medium text-foreground">{slot.title}</div>
                                <div className="text-[10px] font-medium text-muted-foreground mt-1">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 rounded-full bg-card/90 p-1 text-destructive opacity-0 transition group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                                  disabled={deletingId === slot.id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDelete(slot.id);
                                  }}
                                >
                                  {deletingId === slot.id ? <span className="text-[10px]">...</span> : <Trash2 className="h-3 w-3" />}
                                </button>
                              </button>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

