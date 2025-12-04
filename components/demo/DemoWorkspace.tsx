'use client';

import { useState } from "react";
import { Button } from "@/components/common/Button";

type View = "dashboard" | "course-notes" | "exam-revision" | "tasks";

export default function DemoWorkspace() {
  const [view, setView] = useState<View>("dashboard");

  const tasks = [
    { title: "Read Chapter 3 - Linear Algebra", course: "Math 201", status: "In progress", due: "Today" },
    { title: "Prepare slides for seminar", course: "History 104", status: "Not started", due: "Tomorrow" },
    { title: "Review past exam questions", course: "CS 301", status: "Done", due: "Fri" },
  ];

  const renderContent = () => {
    if (view === "course-notes") {
      return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">Course notes</p>
            <h1 className="text-2xl font-semibold">Course notes template</h1>
            <p className="text-sm text-[var(--muted)] max-w-xl">
              This mirrors the real NOTELOFT "Course notes" page: one place per course with structured sections
              you expand over the semester.
            </p>
          </section>
          <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-card space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Overview</h2>
              <p className="text-sm text-[var(--muted)]">
                High‑level summary of the course, grading scheme, and key resources.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Lectures</h2>
              <p className="text-sm text-[var(--muted)]">
                Bullet points per lecture with links back to slides and readings.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Assignments</h2>
              <p className="text-sm text-[var(--muted)]">
                Track assignment descriptions, due dates, and links to the Study tasks database.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">Exam notes</h2>
              <p className="text-sm text-[var(--muted)]">
                Condensed revision notes and "things that always show up on exams".
              </p>
            </div>
          </section>
        </div>
      );
    }

    if (view === "exam-revision") {
      return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">Exam revision</p>
            <h1 className="text-2xl font-semibold">Revision plan</h1>
            <p className="text-sm text-[var(--muted)] max-w-xl">
              A focused space for turning your notes into exam‑ready understanding: key topics, weak areas, and past
              questions.
            </p>
          </section>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-card space-y-2">
              <h2 className="text-sm font-semibold">Key topics</h2>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>• Eigenvalues and eigenvectors</li>
                <li>• Sorting and time complexity</li>
                <li>• Cold War turning points</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-card space-y-2">
              <h2 className="text-sm font-semibold">Weak areas</h2>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>• Induction proofs</li>
                <li>• Change‑of‑basis intuition</li>
                <li>• Essay structure under time pressure</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-card space-y-2">
              <h2 className="text-sm font-semibold">Past questions</h2>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>• 2023 Algorithms midterm Q4</li>
                <li>• 2022 Linear Algebra final Q2</li>
                <li>• 2021 History essay prompts</li>
              </ul>
            </div>
          </section>
        </div>
      );
    }

    if (view === "tasks") {
      return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">Study tasks</p>
            <h1 className="text-2xl font-semibold">Assignments and revision</h1>
            <p className="text-sm text-[var(--muted)] max-w-xl">
              This is a lightweight demo of the Study tasks database. In the real app this view is backed by Prisma and
              supports drag‑and‑drop between statuses.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Study tasks (demo)</p>
              <Button size="sm">New task</Button>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white shadow-card overflow-hidden">
              <div className="grid grid-cols-4 gap-3 border-b border-[var(--border)] px-4 py-2 text-xs uppercase text-[var(--muted)]">
                <span>Title</span>
                <span>Course</span>
                <span>Status</span>
                <span>Due</span>
              </div>
              <div className="divide-y divide-[var(--border)] text-sm">
                {tasks.map((t) => (
                  <div key={t.title} className="grid grid-cols-4 gap-3 px-4 py-2">
                    <span>{t.title}</span>
                    <span className="text-[var(--muted)]">{t.course}</span>
                    <span>{t.status}</span>
                    <span className="text-[var(--muted)]">{t.due}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      );
    }

    // Default dashboard
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase text-[var(--muted)]">Semester dashboard</p>
          <h1 className="text-2xl font-semibold">Your study control centre</h1>
          <p className="text-sm text-[var(--muted)] max-w-xl">
            Capture lecture notes, keep track of assignments, and plan revision - this is roughly what NOTELOFT feels
            like once wired to a real database.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-card">
            <p className="text-sm font-semibold mb-2">Today&apos;s focus</p>
            <ul className="text-sm text-[var(--muted)] space-y-1">
              <li>• Finish problem set for Math 201</li>
              <li>• Summarise lecture 5 notes</li>
              <li>• Draft questions for Friday&apos;s tutorial</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-card">
            <p className="text-sm font-semibold mb-2">Courses</p>
            <ul className="text-sm text-[var(--muted)] space-y-1">
              <li>• Math 201 - Linear Algebra</li>
              <li>• CS 301 - Algorithms</li>
              <li>• History 104 - Modern Europe</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-card">
            <p className="text-sm font-semibold mb-2">Exams</p>
            <ul className="text-sm text-[var(--muted)] space-y-1">
              <li>• Algorithms midterm - in 12 days</li>
              <li>• Linear Algebra exam - in 24 days</li>
            </ul>
          </div>
        </section>
      </div>
    );
  };

  const navItemClasses = (active: boolean) =>
    `w-full text-left rounded-md px-2 py-1.5 text-sm cursor-pointer ${
      active ? "bg-slate-100 font-semibold" : "hover:bg-slate-50"
    }`;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-stretch">
      <aside className="hidden md:flex w-72 flex-col border-r border-[var(--border)] bg-white px-4 py-5">
        <p className="text-xs font-semibold uppercase text-[var(--muted)] mb-1">Workspace</p>
        <p className="text-lg font-semibold mb-4">My Workspace</p>
        <p className="text-xs uppercase text-[var(--muted)] mb-2">Pages</p>
        <div className="space-y-1">
          <button
            type="button"
            className={navItemClasses(view === "dashboard")}
            onClick={() => setView("dashboard")}
          >
            Semester dashboard
          </button>
          <button
            type="button"
            className={navItemClasses(view === "course-notes")}
            onClick={() => setView("course-notes")}
          >
            Course notes
          </button>
          <button
            type="button"
            className={navItemClasses(view === "exam-revision")}
            onClick={() => setView("exam-revision")}
          >
            Exam revision
          </button>
          <button
            type="button"
            className={navItemClasses(view === "tasks")}
            onClick={() => setView("tasks")}
          >
            Study tasks
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-[var(--border)] bg-white flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">NOTELOFT</span>
            <span>·</span>
            <span>My Workspace</span>
          </div>
          <Button variant="outline" size="sm">
            This is a demo - no login
          </Button>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

