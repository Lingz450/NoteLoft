import { NextRequest, NextResponse } from "next/server";
import { createBossFight, listBossFights } from "@/lib/actions/boss-fights";

/**
 * GET /api/boss-fights
 * List all boss fights for a workspace
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  try {
    const bossFights = await listBossFights(workspaceId);
    return NextResponse.json(bossFights);
  } catch (error) {
    console.error("Error fetching boss fights:", error);
    return NextResponse.json({ error: "Failed to fetch boss fights" }, { status: 500 });
  }
}

/**
 * POST /api/boss-fights
 * Create a new boss fight
 */
export async function POST(req: NextRequest) {
  try {
    const { examId, difficulty } = await req.json();
    const bossFight = await createBossFight(examId, difficulty);
    return NextResponse.json(bossFight, { status: 201 });
  } catch (error) {
    console.error("Error creating boss fight:", error);
    return NextResponse.json({ error: "Failed to create boss fight" }, { status: 500 });
  }
}

