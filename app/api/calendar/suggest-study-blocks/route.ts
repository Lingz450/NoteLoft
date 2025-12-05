import { NextRequest, NextResponse } from "next/server";
import { suggestStudyBlocks } from "@/lib/services/calendar-sync";

/**
 * GET /api/calendar/suggest-study-blocks
 * Get suggested study blocks from free time
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const courseId = searchParams.get("courseId");
  const duration = searchParams.get("duration");

  if (!workspaceId || !courseId) {
    return NextResponse.json({ error: "workspaceId and courseId required" }, { status: 400 });
  }

  try {
    const suggestions = await suggestStudyBlocks(
      workspaceId,
      courseId,
      duration ? parseInt(duration) : 50
    );

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error suggesting study blocks:", error);
    return NextResponse.json({ error: "Failed to suggest study blocks" }, { status: 500 });
  }
}

