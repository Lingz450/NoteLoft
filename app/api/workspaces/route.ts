import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, SKIP_AUTH } from "@/lib/auth";
import { z } from "zod";

const workspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// Get all workspaces for current user
export async function GET() {
  if (SKIP_AUTH) {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            courses: true,
            tasks: true,
            pages: true,
          },
        },
      },
    });
    return NextResponse.json(workspaces);
  }
  try {
    const user = await requireUser();

    const workspaces = await prisma.workspace.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            courses: true,
            tasks: true,
            pages: true,
          },
        },
      },
    });

    return NextResponse.json(workspaces);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// Create new workspace
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = workspaceSchema.parse(body);

    let userId: string;
    if (SKIP_AUTH) {
      const demoUser = await prisma.user.findFirst();
      if (!demoUser) {
        throw new Error("Demo user not found");
      }
      userId = demoUser.id;
    } else {
      const user = await requireUser();
      userId = user.id;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: validated.name,
        userId,
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
