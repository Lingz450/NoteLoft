import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assessmentUpsertSchema } from "@/lib/validation/assessments";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const courseId = searchParams.get("courseId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const assessments = await prisma.assessmentItem.findMany({
    where: {
      workspaceId,
      ...(courseId ? { courseId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = assessmentUpsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { workspaceId, courseId, title, score, maxScore, weight } = parsed.data;

  const assessment = await prisma.assessmentItem.create({
    data: {
      workspaceId,
      courseId,
      title,
      score,
      maxScore,
      weight,
    },
  });

  return NextResponse.json(assessment, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const json = await req.json();
  const parsed = assessmentUpsertSchema.extend({ id: assessmentUpsertSchema.shape.id }).safeParse(json);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id, workspaceId, courseId, title, score, maxScore, weight } = parsed.data;

  const assessment = await prisma.assessmentItem.update({
    where: { id, workspaceId },
    data: {
      courseId,
      title,
      score,
      maxScore,
      weight,
    },
  });

  return NextResponse.json(assessment);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const id = searchParams.get("id");
  if (!workspaceId || !id) {
    return NextResponse.json({ error: "id and workspaceId required" }, { status: 400 });
  }

  await prisma.assessmentItem.delete({
    where: { id, workspaceId },
  });

  return NextResponse.json({ success: true });
}
