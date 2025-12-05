import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/databases/[databaseId]
 * Get inline database with rows
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { databaseId: string } }
) {
  try {
    const database = await prisma.inlineDatabase.findUnique({
      where: { id: params.databaseId },
      include: {
        rows: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!database) {
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    }

    return NextResponse.json(database);
  } catch (error) {
    console.error("Error fetching database:", error);
    return NextResponse.json({ error: "Failed to fetch database" }, { status: 500 });
  }
}

/**
 * PUT /api/databases/[databaseId]
 * Update database
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { databaseId: string } }
) {
  try {
    const body = await req.json();

    const database = await prisma.inlineDatabase.update({
      where: { id: params.databaseId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.viewType !== undefined && { viewType: body.viewType }),
        ...(body.properties !== undefined && {
          properties: typeof body.properties === "string" ? body.properties : JSON.stringify(body.properties),
        }),
      },
    });

    return NextResponse.json(database);
  } catch (error) {
    console.error("Error updating database:", error);
    return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
  }
}

