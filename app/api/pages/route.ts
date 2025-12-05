import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/pages
 * Create a new page
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const page = await prisma.page.create({
      data: {
        workspaceId: body.workspaceId,
        title: body.title,
        icon: body.icon || null,
        type: body.type || "GENERIC",
        content: body.content || "{}",
        parentId: body.parentId || null,
        isFavorite: body.isFavorite || false,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        workspaceId: body.workspaceId,
        type: "PAGE_CREATED",
        targetType: "PAGE",
        targetId: page.id,
        targetTitle: page.title,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
