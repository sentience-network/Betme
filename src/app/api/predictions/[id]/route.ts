import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { impliedYesProbability, type Side } from "@/lib/payout";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prediction = await prisma.prediction.findUnique({
    where: { id },
    include: {
      creator: true,
      stakes: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!prediction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stakeInputs = prediction.stakes.map((s) => ({
    id: s.id,
    userId: s.userId,
    side: s.side as Side,
    amount: s.amount,
  }));

  return NextResponse.json({
    prediction: {
      ...prediction,
      yesProbability: impliedYesProbability(stakeInputs),
      pool: prediction.stakes.reduce((sum, s) => sum + s.amount, 0),
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const prediction = await prisma.prediction.findUnique({ where: { id } });
  if (!prediction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (prediction.creatorId !== userId) {
    return NextResponse.json(
      { error: "Only the creator can delete this prediction" },
      { status: 403 }
    );
  }

  // Refund any credits still locked in open stakes before deleting.
  if (prediction.status === "OPEN") {
    const stakes = await prisma.stake.findMany({ where: { predictionId: id } });
    for (const s of stakes) {
      await prisma.user.update({
        where: { id: s.userId },
        data: { balance: { increment: s.amount } },
      });
    }
  }

  await prisma.prediction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
