import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/databases/[databaseId]/rows
 * Add a new row to database
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { databaseId: string } }
) {
  try {
    const body = await req.json();

    // Get current max order
    const maxOrder = await prisma.databaseRow.aggregate({
      where: { databaseId: params.databaseId },
      _max: { order: true },
    });

    const row = await prisma.databaseRow.create({
      data: {
        databaseId: params.databaseId,
        properties: typeof body.properties === "string" ? body.properties : JSON.stringify(body.properties),
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("Error creating row:", error);
    return NextResponse.json({ error: "Failed to create row" }, { status: 500 });
  }
}

/**
 * PUT /api/databases/[databaseId]/rows/[rowId]
 * Update a row
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { databaseId: string; rowId: string } }
) {
  try {
    const body = await req.json();

    const row = await prisma.databaseRow.update({
      where: { id: params.rowId },
      data: {
        ...(body.properties !== undefined && {
          properties: typeof body.properties === "string" ? body.properties : JSON.stringify(body.properties),
        }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });

    return NextResponse.json(row);
  } catch (error) {
    console.error("Error updating row:", error);
    return NextResponse.json({ error: "Failed to update row" }, { status: 500 });
  }
}

/**
 * DELETE /api/databases/[databaseId]/rows/[rowId]
 * Delete a row
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { databaseId: string; rowId: string } }
) {
  try {
    await prisma.databaseRow.delete({
      where: { id: params.rowId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting row:", error);
    return NextResponse.json({ error: "Failed to delete row" }, { status: 500 });
  }
}

