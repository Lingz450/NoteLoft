import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { examUpsertSchema } from "@/lib/validation/exams";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const id = searchParams.get("id");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  if (id) {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { course: true },
    });
    return exam ? NextResponse.json(exam) : NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const exams = await prisma.exam.findMany({
    where: { workspaceId },
    include: { course: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = examUpsertSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { workspaceId, courseId, title, date, location, weight, notes } = parsed.data;

  const exam = await prisma.exam.create({
    data: {
      workspaceId,
      courseId,
      title,
      date: new Date(date),
      location: location ?? null,
      weight: weight ?? null,
      notes: notes ?? null,
    },
    include: { course: true },
  });

  return NextResponse.json(exam, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const json = await req.json();
  const parsed = examUpsertSchema.extend({ id: examUpsertSchema.shape.id }).safeParse(json);
  if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { id, workspaceId, courseId, title, date, location, weight, notes } = parsed.data;

  const exam = await prisma.exam.update({
    where: { id, workspaceId },
    data: {
      courseId: courseId ?? undefined,
      title: title ?? undefined,
      date: date ? new Date(date) : undefined,
      location: location ?? undefined,
      weight: weight ?? undefined,
      notes: notes ?? undefined,
    },
    include: { course: true },
  });

  return NextResponse.json(exam);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const id = searchParams.get("id");
  if (!workspaceId || !id) return NextResponse.json({ error: "id and workspaceId required" }, { status: 400 });

  await prisma.exam.delete({ where: { id, workspaceId } });

  return NextResponse.json({ success: true });
}
