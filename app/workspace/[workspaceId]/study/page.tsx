"use client";

import { useState } from "react";
import { SessionSetup } from "@/components/study/SessionSetup";
import { FocusView } from "@/components/study/FocusView";
import { SessionSummary } from "@/components/study/SessionSummary";
import { useRouter } from "next/navigation";

// Mock data - in production, fetch from API
const MOCK_COURSES = [
  { id: "1", code: "MATH 2051", name: "Linear Algebra", color: "#3B82F6" },
  { id: "2", code: "CS 2302", name: "Data Structures", color: "#10B981" },
  { id: "3", code: "PHYS 3101", name: "Quantum Mechanics", color: "#F59E0B" },
  { id: "4", code: "HIST 1104", name: "Modern History", color: "#8B5CF6" },
];

const MOCK_TASKS = [
  { id: "1", title: "Problem Set 3 - Vector Spaces", courseId: "1" },
  { id: "2", title: "Implement Binary Search Tree", courseId: "2" },
  { id: "3", title: "Read Chapter 7 - Quantum Mechanics", courseId: "3" },
  { id: "4", title: "Review sorting algorithms", courseId: "2" },
  { id: "5", title: "Essay: Industrial Revolution", courseId: "4" },
];

const MOCK_EXAMS = [
  { id: "1", title: "Midterm Exam", courseId: "1" },
  { id: "2", title: "Final Exam", courseId: "2" },
  { id: "3", title: "Midterm Exam", courseId: "3" },
];

type SessionState = "setup" | "focus" | "summary";

interface ActiveSession {
  course: { code: string; name: string; color: string };
  tasks: Array<{ id: string; title: string }>;
  examTitle?: string;
  duration: number;
}

interface SessionResult {
  actualMinutes: number;
  tasksCompleted: string[];
  notes: string;
  wasStuck: boolean;
}

export default function StudyModePage() {
  const router = useRouter();
  const [state, setState] = useState<SessionState>("setup");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);

  const handleStartSession = (session: {
    courseId: string;
    taskIds: string[];
    examId?: string;
    duration: number;
  }) => {
    const course = MOCK_COURSES.find((c) => c.id === session.courseId);
    if (!course) return;

    const tasks = MOCK_TASKS.filter((t) => session.taskIds.includes(t.id));
    const exam = session.examId
      ? MOCK_EXAMS.find((e) => e.id === session.examId)
      : undefined;

    setActiveSession({
      course,
      tasks,
      examTitle: exam?.title,
      duration: session.duration,
    });
    setState("focus");
  };

  const handleEndSession = (result: SessionResult) => {
    setSessionResult(result);
    setState("summary");

    // In production, save session to database here
    // POST to /api/study-sessions
  };

  const handleStartNew = () => {
    setActiveSession(null);
    setSessionResult(null);
    setState("setup");
  };

  const handleBackToDashboard = () => {
    // Extract workspace ID from URL or pass as prop
    router.push("/workspace/demo");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Focus workspace</p>
        <h1 className="text-3xl font-semibold text-foreground">Study mode</h1>
        <p className="text-sm text-muted-foreground">
          Plan a focus block, capture notes, and log sessions without leaving NOTELOFT.
        </p>
      </div>

      {state === "setup" && (
        <SessionSetup courses={MOCK_COURSES} tasks={MOCK_TASKS} exams={MOCK_EXAMS} onStartSession={handleStartSession} />
      )}

      {state === "focus" && activeSession && (
        <FocusView
          course={activeSession.course}
          tasks={activeSession.tasks}
          examTitle={activeSession.examTitle}
          durationMinutes={activeSession.duration}
          onEndSession={handleEndSession}
        />
      )}

      {state === "summary" && activeSession && sessionResult && (
        <SessionSummary
          course={activeSession.course}
          actualMinutes={sessionResult.actualMinutes}
          tasksCompleted={activeSession.tasks.filter((t) => sessionResult.tasksCompleted.includes(t.id))}
          notes={sessionResult.notes}
          wasStuck={sessionResult.wasStuck}
          onStartNew={handleStartNew}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}

