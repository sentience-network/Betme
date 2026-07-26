import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { computeUserStats } from "@/lib/stats";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      badges: true,
      predictions: { orderBy: { createdAt: "desc" }, include: { _count: { select: { stakes: true } } } },
      stakes: { select: { amount: true, payout: true } },
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const viewerId = await getCurrentUserId();
  let isFollowing = false;
  if (viewerId && viewerId !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
    });
    isFollowing = Boolean(follow);
  }

  const stats = computeUserStats(user.stakes);
  const { stakes, ...userPublic } = user;
  void stakes;

  return NextResponse.json({
    user: userPublic,
    stats,
    isFollowing,
    isSelf: viewerId === user.id,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const viewerId = await getCurrentUserId();
  if (!viewerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.id !== viewerId) {
    return NextResponse.json({ error: "You can only edit your own profile" }, { status: 403 });
  }

  const { displayName, bio, avatarColor } = await request.json();
  const data: { displayName?: string; bio?: string; avatarColor?: string } = {};
  if (typeof displayName === "string" && displayName.trim()) {
    data.displayName = displayName.trim().slice(0, 40);
  }
  if (typeof bio === "string") data.bio = bio.slice(0, 280);
  if (typeof avatarColor === "string" && /^#[0-9a-fA-F]{6}$/.test(avatarColor)) {
    data.avatarColor = avatarColor;
  }

  const user = await prisma.user.update({ where: { id: viewerId }, data });
  return NextResponse.json({ user });
}
