import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { courseUpsertSchema } from "@/lib/validation/courses";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const id = searchParams.get("id");

  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  if (id) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { exams: true, tasks: true, assessmentItems: true },
    });
    return course
      ? NextResponse.json(course)
      : NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const courses = await prisma.course.findMany({
    where: { workspaceId },
    orderBy: { code: "asc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = courseUpsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { workspaceId, name, code, semesterName, color, credits } = parsed.data;

  const course = await prisma.course.create({
    data: {
      workspaceId,
      name,
      code,
      semesterName,
      color,
      credits,
    },
  });

  return NextResponse.json(course, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const json = await req.json();
  const parsed = courseUpsertSchema.extend({ id: courseUpsertSchema.shape.id }).safeParse(json);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id, workspaceId, name, code, semesterName, color, credits } = parsed.data;

  const course = await prisma.course.update({
    where: { id, workspaceId },
    data: {
      name: name ?? undefined,
      code: code ?? undefined,
      semesterName: semesterName ?? undefined,
      color: color ?? undefined,
      credits: credits ?? undefined,
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId || !id) return NextResponse.json({ error: "id and workspaceId required" }, { status: 400 });

  await prisma.course.delete({ where: { id, workspaceId } });

  return NextResponse.json({ success: true });
}
