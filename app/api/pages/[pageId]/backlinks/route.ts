import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/pages/[pageId]/backlinks
 * Get all pages that link to this page
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const backlinks = await prisma.backlink.findMany({
      where: { toPageId: params.pageId },
      include: {
        fromPage: {
          select: {
            id: true,
            title: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(backlinks);
  } catch (error) {
    console.error("Error fetching backlinks:", error);
    return NextResponse.json({ error: "Failed to fetch backlinks" }, { status: 500 });
  }
}

/**
 * POST /api/pages/[pageId]/backlinks
 * Create a backlink (called when a page links to another)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { fromPageId, context } = await req.json();

    const backlink = await prisma.backlink.upsert({
      where: {
        fromPageId_toPageId: {
          fromPageId,
          toPageId: params.pageId,
        },
      },
      update: {
        context,
      },
      create: {
        fromPageId,
        toPageId: params.pageId,
        context,
      },
    });

    return NextResponse.json(backlink, { status: 201 });
  } catch (error) {
    console.error("Error creating backlink:", error);
    return NextResponse.json({ error: "Failed to create backlink" }, { status: 500 });
  }
}

