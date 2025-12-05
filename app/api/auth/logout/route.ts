import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Delete session cookie
  cookies().delete("session");

  return NextResponse.json({ success: true });
}



