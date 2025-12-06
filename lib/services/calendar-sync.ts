/**
 * Calendar Sync Service
 * 
 * Integration with external calendars (Google, Outlook, etc.)
 */

import { prisma } from "@/lib/db";

export type CalendarProvider = "GOOGLE" | "OUTLOOK" | "ICAL" | "OTHER";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  allDay?: boolean;
}

/**
 * Sync events from external calendar
 */
export async function syncCalendarEvents(
  workspaceId: string,
  provider: CalendarProvider,
  events: CalendarEvent[]
) {
  // Find or create calendar source
  let source = await prisma.calendarSource.findFirst({
    where: {
      workspaceId,
      provider,
    },
  });

  if (!source) {
    source = await prisma.calendarSource.create({
      data: {
        workspaceId,
        provider,
        accountEmail: "user@example.com", // TODO: Get from authenticated user
        isActive: true,
      },
    });
  }

  // Upsert events
  for (const event of events) {
    // Check if event already exists
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        calendarSourceId: source.id,
        externalId: event.id,
      },
    });

    if (existing) {
      await prisma.calendarEvent.update({
        where: { id: existing.id },
        data: {
          title: event.title,
          startTime: event.start,
          endTime: event.end,
          description: event.description,
          location: event.location,
        },
      });
    } else {
      await prisma.calendarEvent.create({
        data: {
          calendarSourceId: source.id,
          externalId: event.id,
          title: event.title,
          startTime: event.start,
          endTime: event.end,
          description: event.description,
          location: event.location,
        },
      });
    }
  }

  return { synced: events.length };
}

/**
 * Suggest study blocks from free time
 */
export async function suggestStudyBlocks(
  workspaceId: string,
  courseId: string,
  preferredDuration: number = 50
) {
  // Get all calendar events for the workspace via sources
  const sources = await prisma.calendarSource.findMany({
    where: { workspaceId, isActive: true },
    select: { id: true },
  });

  const sourceIds = sources.map(s => s.id);

  const events = await prisma.calendarEvent.findMany({
    where: {
      calendarSourceId: { in: sourceIds },
      startTime: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
    },
    orderBy: { startTime: "asc" },
  });

  const suggestions: Array<{
    start: Date;
    end: Date;
    duration: number;
  }> = [];

  // Find gaps between events
  for (let i = 0; i < events.length - 1; i++) {
    const currentEnd = new Date(events[i].endTime);
    const nextStart = new Date(events[i + 1].startTime);
    const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);

    if (gapMinutes >= preferredDuration) {
      suggestions.push({
        start: currentEnd,
        end: new Date(currentEnd.getTime() + preferredDuration * 60 * 1000),
        duration: preferredDuration,
      });
    }
  }

  return suggestions;
}

/**
 * Create timetable slot from calendar event
 */
export async function createSlotFromCalendarEvent(
  workspaceId: string,
  eventId: string,
  courseId: string
) {
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  // Convert Date to time string (HH:MM format)
  const startTimeStr = event.startTime.toTimeString().slice(0, 5);
  const endTimeStr = event.endTime.toTimeString().slice(0, 5);
  
  // Check if slot already exists
  const existing = await prisma.timetableSlot.findFirst({
    where: {
      workspaceId,
      courseId,
      startTime: startTimeStr,
    },
  });

  if (existing) {
    return existing;
  }

  // Create recurring slot if it's a recurring event
  const slot = await prisma.timetableSlot.create({
    data: {
      workspaceId,
      courseId,
      title: event.title,
      startTime: startTimeStr,
      endTime: endTimeStr,
      dayOfWeek: event.startTime.getDay(),
      type: "LECTURE", // Default, can be changed
    },
  });

  return slot;
}

