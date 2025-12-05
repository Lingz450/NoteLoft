import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/pages/[pageId]/revisions
 * Get all revisions for a page
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const revisions = await prisma.pageRevision.findMany({
      where: { pageId: params.pageId },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit to latest 20 revisions
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error("Error fetching revisions:", error);
    return NextResponse.json({ error: "Failed to fetch revisions" }, { status: 500 });
  }
}

