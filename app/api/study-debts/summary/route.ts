import { NextRequest, NextResponse } from "next/server";
import { getStudyDebtSummary } from "@/lib/services/debt-calculator";

/**
 * GET /api/study-debts/summary
 * Get study debt summary for a workspace
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  try {
    const summary = await getStudyDebtSummary(workspaceId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching debt summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}

