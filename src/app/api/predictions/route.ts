import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { awardBadge } from "@/lib/badges.server";
import { impliedYesProbability, type Side } from "@/lib/payout";

export async function GET() {
  const predictions = await prisma.prediction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: true,
      stakes: true,
      _count: { select: { chatMessages: true, stakes: true } },
    },
  });

  const shaped = predictions.map((p) => ({
    ...p,
    yesProbability: impliedYesProbability(
      p.stakes.map((s) => ({
        id: s.id,
        userId: s.userId,
        side: s.side as Side,
        amount: s.amount,
      }))
    ),
    pool: p.stakes.reduce((sum, s) => sum + s.amount, 0),
  }));

  return NextResponse.json({ predictions: shaped });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { title, description, category, closesAt } = await request.json();
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const prediction = await prisma.prediction.create({
    data: {
      title: title.trim().slice(0, 200),
      description: (description || "").toString().slice(0, 1000),
      category: (category || "General").toString().slice(0, 40),
      closesAt: closesAt ? new Date(closesAt) : null,
      creatorId: userId,
    },
  });

  await awardBadge(userId, "first_prediction");

  return NextResponse.json({ prediction }, { status: 201 });
}
