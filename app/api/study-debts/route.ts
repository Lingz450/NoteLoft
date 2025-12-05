import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/study-debts
 * List all unpaid study debts for a workspace
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  try {
    const debts = await prisma.studyDebt.findMany({
      where: {
        workspaceId,
        isPaid: false,
      },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(debts);
  } catch (error) {
    console.error("Error fetching study debts:", error);
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
  }
}

