import { NextRequest, NextResponse } from "next/server";
import { applyBossDamage } from "@/lib/actions/boss-fights";

/**
 * POST /api/boss-fights/[bossId]/hit
 * Apply damage to a boss from a study session
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { bossId: string } }
) {
  try {
    const { sessionId, sessionMinutes, isConsistentStreak } = await req.json();
    
    const updated = await applyBossDamage(
      params.bossId,
      sessionId,
      sessionMinutes,
      isConsistentStreak
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error applying boss damage:", error);
    return NextResponse.json({ error: "Failed to apply damage" }, { status: 500 });
  }
}

