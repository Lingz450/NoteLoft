import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding NOTELOFT demo data...");

  await prisma.studySessionEvent.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.assessmentItem.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.task.deleteMany();
  await prisma.page.deleteMany();
  await prisma.course.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const primaryUser = await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Alex Student",
      password,
    },
  });

  const secondaryUser = await prisma.user.create({
    data: {
      email: "sarah@example.com",
      name: "Sarah Johnson",
      password,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo semester",
      userId: primaryUser.id,
    },
  });

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        workspaceId: workspace.id,
        name: "Linear Algebra",
        code: "MATH 2051",
        semesterName: "Fall 2025",
        color: "#3B82F6",
        credits: 3,
      },
    }),
    prisma.course.create({
      data: {
        workspaceId: workspace.id,
        name: "Data Structures",
        code: "CS 2302",
        semesterName: "Fall 2025",
        color: "#10B981",
        credits: 4,
      },
    }),
    prisma.course.create({
      data: {
        workspaceId: workspace.id,
        name: "Modern Physics",
        code: "PHYS 3101",
        semesterName: "Fall 2025",
        color: "#F59E0B",
        credits: 4,
      },
    }),
  ]);

  await prisma.page.create({
    data: {
      workspaceId: workspace.id,
      title: "Semester dashboard",
      type: "SEMESTER_DASHBOARD",
      content: JSON.stringify({
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Welcome back �?" }] },
          { type: "paragraph", content: [{ type: "text", text: "Use this workspace to manage the semester." }] },
        ],
      }),
    },
  });

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        courseId: courses[0].id,
        courseLabel: courses[0].code,
        title: "Problem set 3",
        status: "IN_PROGRESS",
        type: "ASSIGNMENT",
        priority: "HIGH",
        dueDate: new Date("2025-12-15"),
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        courseId: courses[1].id,
        courseLabel: courses[1].code,
        title: "Implement BST",
        status: "NOT_STARTED",
        type: "ASSIGNMENT",
        priority: "HIGH",
        dueDate: new Date("2025-12-18"),
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        courseId: courses[2].id,
        courseLabel: courses[2].code,
        title: "Read chapter 7",
        status: "NOT_STARTED",
        type: "READING",
        priority: "NORMAL",
        dueDate: new Date("2025-12-12"),
      },
    }),
  ]);

  const exams = await Promise.all([
    prisma.exam.create({
      data: {
        workspaceId: workspace.id,
        courseId: courses[0].id,
        title: "Midterm exam",
        date: new Date("2025-12-10T10:00:00Z"),
        location: "Room 204",
        weight: 30,
      },
    }),
    prisma.exam.create({
      data: {
        workspaceId: workspace.id,
        courseId: courses[1].id,
        title: "Algorithms quiz",
        date: new Date("2025-12-05T15:00:00Z"),
        location: "CS Building 120",
        weight: 15,
      },
    }),
  ]);

  await prisma.assessmentItem.createMany({
    data: [
      {
        workspaceId: workspace.id,
        courseId: courses[0].id,
        title: "Quiz 1",
        score: 18,
        maxScore: 20,
        weight: 10,
      },
      {
        workspaceId: workspace.id,
        courseId: courses[1].id,
        title: "Assignment 1",
        score: 42,
        maxScore: 50,
        weight: 15,
      },
    ],
  });

  await prisma.timetableSlot.createMany({
    data: [
      {
        workspaceId: workspace.id,
        courseId: courses[0].id,
        title: "Lecture",
        dayOfWeek: 0,
        startTime: "09:00",
        endTime: "10:30",
        type: "LECTURE",
      },
      {
        workspaceId: workspace.id,
        courseId: courses[1].id,
        title: "Lab",
        dayOfWeek: 1,
        startTime: "14:00",
        endTime: "16:00",
        type: "LAB",
      },
      {
        workspaceId: workspace.id,
        courseId: courses[2].id,
        title: "Revision block",
        dayOfWeek: 2,
        startTime: "16:00",
        endTime: "17:00",
        type: "STUDY",
      },
    ],
  });

  const session = await prisma.studySession.create({
    data: {
      workspaceId: workspace.id,
      courseId: courses[0].id,
      taskId: tasks[0].id,
      plannedDurationMinutes: 50,
      durationMinutes: 50,
      startedAt: new Date("2025-11-28T09:00:00Z"),
      endedAt: new Date("2025-11-28T09:50:00Z"),
      status: "COMPLETED",
      notes: "Wrapped most of the vector space proofs.",
      mood: "HIGH",
    },
  });

  await prisma.studySessionEvent.create({
    data: {
      studySessionId: session.id,
      type: "ENDED",
      metadata: "Seeded session",
    },
  });

  await prisma.workspace.create({
    data: {
      name: "My second semester",
      userId: secondaryUser.id,
    },
  });

  console.log("Seeding complete. Demo credentials: student@example.com / password123");
}

main()
  .catch((err) => {
    console.error("Seed error", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
