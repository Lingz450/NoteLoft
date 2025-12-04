import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/auth";
import { taskUpsertSchema } from "@/lib/validation/tasks";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  // Skip auth check if SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const tasks = await prisma.task.findMany({
    where: { workspaceId },
    include: {
      relatedPage: { select: { id: true, title: true } },
      course: { select: { id: true, code: true, name: true, color: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = taskUpsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { workspaceId, title, courseId, courseLabel, description, status, priority, dueDate, relatedPageId } = parsed.data;

  // Skip auth check if SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const task = await prisma.task.create({
    data: {
      workspaceId,
      title,
      courseId: courseId ?? null,
      courseLabel: courseLabel ?? null,
      description: description ?? null,
      status: status ?? "NOT_STARTED",
      priority: priority ?? "NORMAL",
      dueDate: dueDate ? new Date(dueDate) : null,
      relatedPageId: relatedPageId ?? null,
    },
    include: {
      relatedPage: { select: { id: true, title: true } },
      course: { select: { id: true, code: true, name: true, color: true } },
    },
  });

  return NextResponse.json(task);
}

export async function PUT(req: NextRequest) {
  const json = await req.json();
  const parsed = taskUpsertSchema.extend({ id: taskUpsertSchema.shape.id }).safeParse(json);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, workspaceId, title, courseId, courseLabel, description, status, priority, dueDate, relatedPageId } = parsed.data;

  // Skip auth check if SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const task = await prisma.task.update({
    where: { id, workspaceId },
    data: {
      title: title ?? undefined,
      courseId: courseId ?? undefined,
      courseLabel: courseLabel ?? undefined,
      description: description ?? undefined,
      status: status ?? undefined,
      priority: priority ?? undefined,
      dueDate: dueDate ? new Date(dueDate) : null,
      relatedPageId: relatedPageId ?? undefined,
    },
    include: {
      relatedPage: { select: { id: true, title: true } },
      course: { select: { id: true, code: true, name: true, color: true } },
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const id = searchParams.get("id");
  if (!workspaceId || !id) return NextResponse.json({ error: "id and workspaceId required" }, { status: 400 });

  // Skip auth check if SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await prisma.task.delete({ where: { id, workspaceId } });
  return NextResponse.json({ success: true });
}
