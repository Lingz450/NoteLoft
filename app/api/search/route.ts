import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const query = searchParams.get("q")?.trim() ?? "";

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  if (query.length < 2) {
    return NextResponse.json({ pages: [], tasks: [], courses: [] });
  }

  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const [pages, tasks, courses] = await Promise.all([
    prisma.page.findMany({
      where: {
        workspaceId,
        title: { contains: query },
      },
      select: { id: true, title: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: {
        workspaceId,
        title: { contains: query },
      },
      select: { id: true, title: true, status: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.course.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: query } },
          { code: { contains: query } },
        ],
      },
      select: { id: true, name: true, code: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ pages, tasks, courses });
}
