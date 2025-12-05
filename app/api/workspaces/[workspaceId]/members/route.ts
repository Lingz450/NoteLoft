import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/workspaces/[workspaceId]/members
 * Get all workspace members
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: params.workspaceId },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

/**
 * POST /api/workspaces/[workspaceId]/members
 * Invite a new member
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { email, role } = await req.json();

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: params.workspaceId,
        email,
        role: role || "MEMBER",
      },
    });

    // TODO: Send invitation email

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error inviting member:", error);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}

