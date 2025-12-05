import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/resources
 * Create a new resource
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const resource = await prisma.resource.create({
      data: {
        workspaceId: body.workspaceId,
        courseId: body.courseId || undefined,
        pageId: body.pageId || undefined,
        title: body.title,
        url: body.url || undefined,
        type: body.type,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}

