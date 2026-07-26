import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { awardBadge } from "@/lib/badges.server";
import { computePayouts, type Side } from "@/lib/payout";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { outcome } = await request.json();
  if (outcome !== "YES" && outcome !== "NO") {
    return NextResponse.json({ error: "outcome must be YES or NO" }, { status: 400 });
  }

  const prediction = await prisma.prediction.findUnique({
    where: { id },
    include: { stakes: true },
  });
  if (!prediction) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }
  if (prediction.creatorId !== userId) {
    return NextResponse.json(
      { error: "Only the creator can resolve this prediction" },
      { status: 403 }
    );
  }
  if (prediction.status === "RESOLVED") {
    return NextResponse.json({ error: "Already resolved" }, { status: 400 });
  }

  const payouts = computePayouts(
    prediction.stakes.map((s) => ({
      id: s.id,
      userId: s.userId,
      side: s.side as Side,
      amount: s.amount,
    })),
    outcome
  );

  await prisma.$transaction(async (tx) => {
    await tx.prediction.update({
      where: { id },
      data: { status: "RESOLVED", outcome },
    });
    for (const p of payouts) {
      await tx.stake.update({
        where: { id: p.stakeId },
        data: { payout: p.payout },
      });
      if (p.payout > 0) {
        await tx.user.update({
          where: { id: p.userId },
          data: { balance: { increment: p.payout } },
        });
      }
    }
  });

  // Award accuracy badges to winners.
  const winners = new Set(payouts.filter((p) => p.net > 0).map((p) => p.userId));
  for (const winnerId of winners) {
    await awardBadge(winnerId, "sharpshooter");
  }

  return NextResponse.json({ ok: true, outcome, payouts });
}
