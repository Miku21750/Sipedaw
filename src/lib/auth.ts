import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "sipedaw_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "development-secret-change-me-please"
);

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  role: UserRole;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, username: true, role: true, isActive: true },
  });
  if (!user?.isActive) throw new Error("UNAUTHORIZED");
  return { id: user.id, name: user.name, username: user.username, role: user.role };
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session;
}
