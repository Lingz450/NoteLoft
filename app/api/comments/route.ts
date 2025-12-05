import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/comments
 * Get comments for a specific target (page, task, or exam)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId");
  const taskId = searchParams.get("taskId");
  const examId = searchParams.get("examId");

  if (!pageId && !taskId && !examId) {
    return NextResponse.json({ error: "Target ID required" }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        ...(pageId && { pageId }),
        ...(taskId && { taskId }),
        ...(examId && { examId }),
      },
      include: {
        mentions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

/**
 * POST /api/comments
 * Create a new comment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract mentions from content (simple regex for @mentions)
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(body.content)) !== null) {
      mentions.push(match[1]);
    }

    const comment = await prisma.comment.create({
      data: {
        workspaceId: body.workspaceId,
        ...(body.pageId && { pageId: body.pageId }),
        ...(body.taskId && { taskId: body.taskId }),
        ...(body.examId && { examId: body.examId }),
        authorName: body.authorName || "Student",
        content: body.content,
        mentions: {
          create: mentions.map(name => ({
            targetType: "USER",
            targetName: `@${name}`,
          })),
        },
      },
      include: {
        mentions: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        workspaceId: body.workspaceId,
        type: "COMMENT_ADDED",
        targetType: body.pageId ? "PAGE" : body.taskId ? "TASK" : "EXAM",
        targetId: body.pageId || body.taskId || body.examId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

