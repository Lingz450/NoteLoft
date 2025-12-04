import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceMember } from "@/lib/auth";

type ReorderPayload = {
  id: string;
  parentId: string | null;
  position: number;
};

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { workspaceId, updates } = json as {
    workspaceId?: string;
    updates?: ReorderPayload[];
  };

  if (!workspaceId || !Array.isArray(updates)) {
    return NextResponse.json({ error: "workspaceId and updates[] required" }, { status: 400 });
  }

  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.page.update({
        where: { id: update.id, workspaceId },
        data: {
          parentId: update.parentId,
          position: update.position,
        },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
