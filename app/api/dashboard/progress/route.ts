import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/dashboard/progress
 * Get weekly progress and streak data
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get sessions this week
    const sessions = await prisma.studySession.findMany({
      where: {
        workspaceId,
        startedAt: { gte: startOfWeek },
        status: "COMPLETED",
      },
      select: {
        durationMinutes: true,
        startedAt: true,
      },
    });

    const actualMinutes = sessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );

    // Default weekly goal (15 hours = 900 minutes)
    const plannedMinutes = 900;

    // Calculate streak
    const sessionDates = new Set(
      sessions.map((s) => s.startedAt.toISOString().split("T")[0])
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (sessionDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        // Break in streak
        break;
      }
    }

    // Get last studied date
    const lastSession = await prisma.studySession.findFirst({
      where: {
        workspaceId,
        status: "COMPLETED",
      },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true },
    });

    return NextResponse.json({
      plannedMinutes,
      actualMinutes,
      streak,
      lastStudied: lastSession?.startedAt || null,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

