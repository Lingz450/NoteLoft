import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/pages/[pageId]
 * Get a single page with blocks
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
      include: {
        blocks: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

/**
 * PUT /api/pages/[pageId]
 * Update page title, content, or properties
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const body = await req.json();
    
    const page = await prisma.page.update({
      where: { id: params.pageId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.isFavorite !== undefined && { isFavorite: body.isFavorite }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
        ...(body.publicSlug !== undefined && { publicSlug: body.publicSlug }),
      },
    });

    // Create page revision for significant updates
    if (body.content !== undefined) {
      await prisma.pageRevision.create({
        data: {
          pageId: params.pageId,
          snapshot: JSON.stringify({
            title: page.title,
            content: page.content,
          }),
        },
      });
    }

    // Log activity
    if (body.title || body.content) {
      await prisma.activityLog.create({
        data: {
          workspaceId: page.workspaceId,
          type: "PAGE_UPDATED",
          targetType: "PAGE",
          targetId: page.id,
          targetTitle: page.title,
        },
      });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

/**
 * DELETE /api/pages/[pageId]
 * Delete a page
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.pageId },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await prisma.page.delete({
      where: { id: params.pageId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        workspaceId: page.workspaceId,
        type: "PAGE_DELETED",
        targetType: "PAGE",
        targetId: page.id,
        targetTitle: page.title,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}

