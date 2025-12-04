import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { studySessionCreateSchema, studySessionUpdateSchema } from "@/lib/validation/studySessions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const sessions = await prisma.studySession.findMany({
    where: { workspaceId },
    include: {
      course: true,
      task: true,
      exam: true,
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = studySessionCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { workspaceId, courseId, taskId, examId, plannedDurationMinutes, mood } = parsed.data;

  const session = await prisma.studySession.create({
    data: {
      workspaceId,
      courseId: courseId ?? null,
      taskId: taskId ?? null,
      examId: examId ?? null,
      plannedDurationMinutes: plannedDurationMinutes ?? 25,
      startedAt: new Date(),
      status: "IN_PROGRESS",
      mood: mood ?? null,
      notes: null,
    },
    include: {
      course: true,
      task: true,
      exam: true,
    },
  });

  await prisma.studySessionEvent.create({
    data: {
      studySessionId: session.id,
      type: "STARTED",
      metadata: null,
    },
  });

  return NextResponse.json(session, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const json = await req.json();
  const parsed = studySessionUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id, workspaceId, endedAt, status, notes } = parsed.data;

  const existing = await prisma.studySession.findUnique({
    where: { id },
  });

  if (!existing || existing.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const endTime = endedAt ? new Date(endedAt) : new Date();
  const durationMinutes =
    existing.startedAt && endTime
      ? Math.max(
          1,
          Math.round((endTime.getTime() - existing.startedAt.getTime()) / (60 * 1000)),
        )
      : existing.durationMinutes;

  const updatedNotes = notes ?? existing.notes ?? null;
  const updated = await prisma.studySession.update({
    where: { id, workspaceId },
    data: {
      endedAt: endTime,
      durationMinutes,
      status: status ? status : existing.status,
      notes: updatedNotes,
    },
    include: {
      course: true,
      task: true,
      exam: true,
    },
  });

  // Map status to event type
  const eventType =
    status === "COMPLETED"
      ? "ENDED"
      : status === "INTERRUPTED"
      ? "INTERRUPTED"
      : status === "CANCELLED"
      ? "ENDED"
      : "NOTE_ADDED";

  await prisma.studySessionEvent.create({
    data: {
      studySessionId: updated.id,
      type: eventType,
      metadata: updatedNotes,
    },
  });

  return NextResponse.json(updated);
}
