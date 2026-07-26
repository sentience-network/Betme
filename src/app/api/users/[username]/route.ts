import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

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

  return NextResponse.json({ user, isFollowing, isSelf: viewerId === user.id });
}
