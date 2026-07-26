import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = await prisma.chatMessage.findMany({
    where: { predictionId: id },
    orderBy: { createdAt: "asc" },
    include: { author: true },
  });
  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { body } = await request.json();
  if (!body || typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "message body is required" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      predictionId: id,
      authorId: userId,
      body: body.trim().slice(0, 2000),
    },
    include: { author: true },
  });

  return NextResponse.json({ message }, { status: 201 });
}
