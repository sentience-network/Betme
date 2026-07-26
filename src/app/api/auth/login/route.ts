import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

export async function POST(request: Request) {
  const { username, displayName } = await request.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const handle = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!handle) {
    return NextResponse.json(
      { error: "username must contain letters or numbers" },
      { status: 400 }
    );
  }

  let user = await prisma.user.findUnique({ where: { username: handle } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: handle,
        displayName: (displayName || handle).toString().trim().slice(0, 40),
        avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      },
    });
  }

  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
