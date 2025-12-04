import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const SKIP_AUTH = process.env.SKIP_AUTH === "true";

export async function DELETE(_: Request, { params }: { params: { workspaceId: string } }) {
  const { workspaceId } = params;
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  if (!SKIP_AUTH) {
    await requireUser();
  }

  await prisma.workspace.delete({
    where: { id: workspaceId },
  });

  return NextResponse.json({ success: true });
}
