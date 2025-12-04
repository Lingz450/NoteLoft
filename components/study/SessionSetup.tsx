"use client";

import { useState } from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Play } from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  courseId: string;
}

interface Exam {
  id: string;
  title: string;
  courseId: string;
}

interface SessionSetupProps {
  courses: Course[];
  tasks: Task[];
  exams: Exam[];
  onStartSession: (session: {
    courseId: string;
    taskIds: string[];
    examId?: string;
    duration: number;
  }) => void;
}

const DURATION_PRESETS = [
  { label: "25 min", value: 25 },
  { label: "50 min", value: 50 },
  { label: "90 min", value: 90 },
];

export function SessionSetup({ courses, tasks, exams, onStartSession }: SessionSetupProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [duration, setDuration] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [showCustom, setShowCustom] = useState(false);

  const availableTasks = tasks.filter((t) => t.courseId === selectedCourse);
  const availableExams = exams.filter((e) => e.courseId === selectedCourse);

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleStart = () => {
    if (!selectedCourse) return;

    const finalDuration = showCustom ? parseInt(customDuration) : duration;
    if (!finalDuration || finalDuration < 1) return;

    onStartSession({
      courseId: selectedCourse,
      taskIds: selectedTasks,
      examId: selectedExam || undefined,
      duration: finalDuration,
    });
  };

  const canStart = selectedCourse && (showCustom ? customDuration : duration > 0);

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Start study session</h2>
          <p className="text-sm text-muted-foreground">
            Choose a course, tie tasks or exams, and set a focus timer before you start.
          </p>
        </div>

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Select course
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  setSelectedCourse(course.id);
                  setSelectedTasks([]);
                  setSelectedExam("");
                }}
                className={`
                  rounded-2xl border-2 p-3 text-left transition-all
                  ${
                    selectedCourse === course.id
                      ? "border-primary/60 bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }
                `}
              >
                <div
                  className="mb-2 h-1 w-full rounded-full"
                  style={{ backgroundColor: course.color }}
                />
                <div className="font-semibold text-foreground">{course.code}</div>
                <div className="text-xs text-muted-foreground">{course.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Task Selection (if course selected) */}
        {selectedCourse && availableTasks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select tasks (optional)
            </label>
            <div className="space-y-2">
              {availableTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`
                    w-full rounded-2xl px-3 py-2 text-left text-sm transition-all
                    ${
                      selectedTasks.includes(task.id)
                        ? "border-2 border-primary/60 bg-primary/5 text-foreground"
                        : "border border-border bg-background hover:border-primary/40"
                    }
                  `}
                >
                  <span className="text-foreground">{task.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Exam Selection (if course selected) */}
        {selectedCourse && availableExams.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preparing for exam (optional)
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {availableExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Session duration
          </label>
          <div className="flex gap-2 mb-2">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setDuration(preset.value);
                  setShowCustom(false);
                }}
                className={`
                  flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-medium transition-all
                  ${
                    !showCustom && duration === preset.value
                      ? "border-primary/60 bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }
                `}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(true)}
              className={`flex-1 rounded-2xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                showCustom
                  ? "border-primary/60 bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              Custom
            </button>
          </div>
          {showCustom && (
            <input
              type="number"
              min="1"
              max="180"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              placeholder="Enter minutes"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
            />
          )}
        </div>

        {/* Start Button */}
        <Button onClick={handleStart} disabled={!canStart} className="w-full py-3 text-base" size="lg">
          <Play className="w-5 h-5 mr-2" />
          Start Focus Session
        </Button>
      </div>
    </Card>
  );
}

