import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { timetableSlotSchema } from "@/lib/validation/schedule";

const timetableSlotUpdateSchema = timetableSlotSchema.extend({
  id: z.string(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  const slots = await prisma.timetableSlot.findMany({
    where: { workspaceId },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  });

  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = timetableSlotSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { workspaceId, courseId, title, dayOfWeek, startTime, endTime, type } = parsed.data;

  const slot = await prisma.timetableSlot.create({
    data: {
      workspaceId,
      courseId: courseId ?? null,
      title,
      dayOfWeek,
      startTime,
      endTime,
      type: type ?? "LECTURE",
    },
  });

  return NextResponse.json(slot, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const json = await req.json();
  const parsed = timetableSlotUpdateSchema.safeParse(json);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id, workspaceId, courseId, title, dayOfWeek, startTime, endTime, type } = parsed.data;

  const slot = await prisma.timetableSlot.update({
    where: { id, workspaceId },
    data: {
      title,
      dayOfWeek,
      startTime,
      endTime,
      courseId: courseId ?? null,
      type: type ?? "LECTURE",
    },
  });

  return NextResponse.json(slot);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const id = searchParams.get("id");

  if (!workspaceId || !id) {
    return NextResponse.json({ error: "id and workspaceId required" }, { status: 400 });
  }

  await prisma.timetableSlot.delete({
    where: { id, workspaceId },
  });

  return NextResponse.json({ success: true });
}
