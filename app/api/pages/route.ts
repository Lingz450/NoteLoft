import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pageUpsertSchema } from "@/lib/validation/pages";
import { requireWorkspaceMember } from "@/lib/auth";

const emptyDoc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [],
    },
  ],
};

function serializeContent(content: any | undefined) {
  if (!content) return JSON.stringify(emptyDoc);
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content);
  } catch {
    return JSON.stringify(emptyDoc);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });

  // Skip auth check if SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const pages = await prisma.page.findMany({
    where: { workspaceId },
    orderBy: [{ parentId: "asc" }, { position: "asc" }],
  });

  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = pageUpsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { workspaceId, title, parentId, content, position, isFavorite } = parsed.data;

  // Skip auth check if SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const maxPosition = await prisma.page.aggregate({
    where: { workspaceId, parentId: parentId ?? null },
    _max: { position: true },
  });

  const page = await prisma.page.create({
    data: {
      workspaceId,
      title,
      parentId: parentId ?? null,
      content: serializeContent(content),
      isFavorite: isFavorite ?? false,
      position: position ?? (maxPosition._max.position ?? 0) + 1,
    },
  });

  return NextResponse.json(page);
}

export async function PUT(req: NextRequest) {
  const json = await req.json();
  const parsed = pageUpsertSchema.extend({ id: pageUpsertSchema.shape.id }).safeParse(json);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, workspaceId, title, parentId, content, position, isFavorite } = parsed.data;

  // Skip auth check if SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const page = await prisma.page.update({
    where: { id, workspaceId },
    data: {
      title: title ?? undefined,
      parentId: parentId ?? undefined,
      content: content ? serializeContent(content) : undefined,
      position: typeof position === "number" ? position : undefined,
      isFavorite: typeof isFavorite === "boolean" ? isFavorite : undefined,
    },
  });

  return NextResponse.json(page);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const workspaceId = searchParams.get("workspaceId");
  if (!id || !workspaceId) return NextResponse.json({ error: "id and workspaceId required" }, { status: 400 });

  // Skip auth check if SKIP_AUTH is enabled
  if (process.env.SKIP_AUTH !== "true") {
    try {
      await requireWorkspaceMember(workspaceId);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await prisma.page.delete({ where: { id, workspaceId } });
  return NextResponse.json({ success: true });
}
