import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { awardBadge } from "@/lib/badges.server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const partner = await prisma.user.findUnique({ where: { username } });
  if (!partner) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: partner.id },
        { senderId: partner.id, recipientId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: { sender: true },
  });

  return NextResponse.json({ partner, messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const partner = await prisma.user.findUnique({ where: { username } });
  if (!partner) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (partner.id === userId) {
    return NextResponse.json({ error: "You cannot message yourself" }, { status: 400 });
  }

  const { body, videoUrl } = await request.json();
  const text = (body || "").toString().trim().slice(0, 2000);
  if (!text && !videoUrl) {
    return NextResponse.json(
      { error: "message must have text or a video" },
      { status: 400 }
    );
  }

  const message = await prisma.directMessage.create({
    data: {
      senderId: userId,
      recipientId: partner.id,
      body: text,
      videoUrl: videoUrl || null,
    },
    include: { sender: true },
  });

  await awardBadge(userId, "conversationalist");

  return NextResponse.json({ message }, { status: 201 });
}
