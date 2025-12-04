"use client";

import { QuickCards } from "@/components/dashboard/quick-cards";
import { ThisWeekCard } from "@/components/dashboard/this-week-card";
import { CoursesCard } from "@/components/dashboard/courses-card";
import { GpaCard } from "@/components/dashboard/gpa-card";
import { UpcomingExamsCard } from "@/components/dashboard/upcoming-exams-card";
import { RecentSessionsCard } from "@/components/dashboard/recent-sessions-card";
import { useState, useEffect } from "react";

interface DashboardProps {
  onStartSession: () => void;
}

export function Dashboard({ onStartSession }: DashboardProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [gpa, setGpa] = useState(3.52);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedCourses = localStorage.getItem('noteloft-courses');
      const savedTasks = localStorage.getItem('noteloft-tasks');
      const savedExams = localStorage.getItem('noteloft-exams');
      
      if (savedCourses) {
        const parsed = JSON.parse(savedCourses);
        setCourses(parsed);
        
        // Calculate GPA from courses
        const coursesWithGrades = parsed.filter((c: any) => c.currentGrade);
        if (coursesWithGrades.length > 0) {
          const avgGrade = coursesWithGrades.reduce((sum: number, c: any) => sum + c.currentGrade, 0) / coursesWithGrades.length;
          setGpa(+(avgGrade / 25).toFixed(2)); // Convert percentage to 4.0 scale
        }
      }
      
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        // Filter tasks due this week
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thisWeekTasks = parsed.filter((t: any) => {
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate <= weekFromNow;
        });
        setTasks(thisWeekTasks);
      }
      
      if (savedExams) {
        const parsed = JSON.parse(savedExams);
        const examsWithDates = parsed.map((e: any) => ({
          ...e,
          date: new Date(e.date)
        }));
        // Sort by date and get upcoming ones
        const upcoming = examsWithDates
          .filter((e: any) => new Date(e.date) >= new Date())
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setExams(upcoming);
      }

      // Mock sessions for demo
      const mockSessions = [
        { id: "1", courseCode: "Math 201", minutes: 45, date: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { id: "2", courseCode: "CS 301", minutes: 80, date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { id: "3", courseCode: "Physics 101", minutes: 30, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      ];
      setSessions(mockSessions);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    }
  }, []);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Semester dashboard</h1>
        <p className="mt-1.5 text-muted-foreground">Your study control centre</p>
      </div>

      {/* Quick Cards Row */}
      <QuickCards onStartSession={onStartSession} focusSessions={sessions} />

      {/* Main Content - Two Column Layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Takes 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          <ThisWeekCard tasks={tasks} workspaceId="demo" />
          <CoursesCard courses={courses} workspaceId="demo" />
        </div>

        {/* Right Column - Stacked Cards */}
        <div className="space-y-6">
          <GpaCard gpa={gpa} />
          <UpcomingExamsCard exams={exams} workspaceId="demo" />
          <RecentSessionsCard sessions={sessions} workspaceId="demo" />
        </div>
      </div>
    </div>
  );
}

