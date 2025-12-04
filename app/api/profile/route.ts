import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email().optional(),
});

const SKIP_AUTH = process.env.SKIP_AUTH === "true";

async function getCurrentUser() {
  if (SKIP_AUTH) {
    return prisma.user.findFirst();
  }
  const user = await requireUser();
  return prisma.user.findUnique({ where: { id: user.id } });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No user" }, { status: 404 });
  }
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No user" }, { status: 404 });
  }

  const json = await req.json();
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name ?? undefined,
      email: parsed.data.email ?? undefined,
    },
  });

  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email });
}
