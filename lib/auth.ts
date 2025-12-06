import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { Workspace, User as PrismaUser } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this"
);
export const SKIP_AUTH = process.env.SKIP_AUTH === "true";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

// Create JWT token
export async function createToken(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.user as SessionUser;
  } catch (error) {
    return null;
  }
}

// Get current session
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// Require user (throw if not logged in)
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

// Check workspace access
function resolveSessionUser(user?: PrismaUser | null): SessionUser {
  if (user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  return {
    id: "demo-user",
    email: "demo@noteloft.local",
    name: "Demo User",
  };
}

export async function requireWorkspaceAccess(workspaceId: string) {
  if (SKIP_AUTH) {
    const workspaceWithOwner = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { user: true },
    });

    if (!workspaceWithOwner) {
      throw new Error("Workspace not found");
    }

    const { user, ...workspaceData } = workspaceWithOwner;
    return {
      user: resolveSessionUser(user),
      workspace: workspaceData as Workspace,
    };
  }

  const user = await requireUser();

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      userId: user.id,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found or access denied");
  }

  return { user, workspace };
}

export async function requireWorkspaceMember(workspaceId: string) {
  return requireWorkspaceAccess(workspaceId);
}

// Login user
export async function login(email: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

// Register user
export async function register(email: string, password: string, name: string) {
  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with default workspace
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      workspaces: {
        create: {
          name: "My Semester",
        },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}





