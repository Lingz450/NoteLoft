import { NextRequest, NextResponse } from "next/server";
import { syncCalendarEvents } from "@/lib/services/calendar-sync";

/**
 * POST /api/calendar/sync
 * Sync events from external calendar
 */
export async function POST(req: NextRequest) {
  try {
    const { workspaceId, provider, events } = await req.json();

    const result = await syncCalendarEvents(workspaceId, provider, events);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error syncing calendar:", error);
    return NextResponse.json({ error: "Failed to sync calendar" }, { status: 500 });
  }
}

