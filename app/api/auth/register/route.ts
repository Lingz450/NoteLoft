import { NextRequest, NextResponse } from "next/server";
import { register, createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = await register(email, password, name);

    // Create session token
    const token = await createToken(user);

    // Set cookie
    cookies().set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Registration error:", error);
    
    if (error.message === "Email already registered") {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}





