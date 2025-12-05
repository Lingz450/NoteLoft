import { NextRequest, NextResponse } from "next/server";
import { createStudyRun, listStudyRuns } from "@/lib/actions/study-runs";

/**
 * GET /api/study-runs
 * List all study runs for a workspace
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const courseId = searchParams.get("courseId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  try {
    const studyRuns = await listStudyRuns(workspaceId, courseId || undefined);
    return NextResponse.json(studyRuns);
  } catch (error) {
    console.error("Error fetching study runs:", error);
    return NextResponse.json({ error: "Failed to fetch study runs" }, { status: 500 });
  }
}

/**
 * POST /api/study-runs
 * Create a new study run
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const studyRun = await createStudyRun(body);
    return NextResponse.json(studyRun, { status: 201 });
  } catch (error) {
    console.error("Error creating study run:", error);
    return NextResponse.json({ error: "Failed to create study run" }, { status: 500 });
  }
}

