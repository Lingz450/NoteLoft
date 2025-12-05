import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/topics
 * List all topics for a workspace
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const courseId = searchParams.get("courseId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  try {
    const topics = await prisma.topic.findMany({
      where: {
        workspaceId,
        ...(courseId && { courseId }),
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

/**
 * POST /api/topics
 * Create a new topic
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = await prisma.topic.create({
      data: body,
    });
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}

