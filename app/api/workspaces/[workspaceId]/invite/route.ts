import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Workspace invitations are disabled in the single-user demo. Enable multi-user support before using this endpoint.",
    },
    { status: 501 },
  );
}
