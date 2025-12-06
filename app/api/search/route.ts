import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/search
 * Global search across pages, tasks, courses, exams
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const workspaceId = searchParams.get("workspaceId");

  if (!query || !workspaceId) {
    return NextResponse.json({ error: "Missing query or workspaceId" }, { status: 400 });
  }

  try {
    const searchTerm = query.toLowerCase();

    // Search pages
    const pages = await prisma.page.findMany({
      where: {
        workspaceId,
        title: {
          contains: searchTerm,
        },
      },
      select: {
        id: true,
        title: true,
        icon: true,
      },
      take: 5,
    });

    // Search tasks
    const tasks = await prisma.task.findMany({
      where: {
        workspaceId,
        title: {
          contains: searchTerm,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
      take: 5,
    });

    // Search courses
    const courses = await prisma.course.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: searchTerm } },
          { code: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
      take: 5,
    });

    // Search exams
    const exams = await prisma.exam.findMany({
      where: {
        workspaceId,
        title: {
          contains: searchTerm,
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
      },
      take: 5,
    });

    return NextResponse.json({
      pages,
      tasks,
      courses,
      exams,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
