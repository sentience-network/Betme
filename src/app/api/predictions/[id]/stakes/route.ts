import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { awardBadge } from "@/lib/badges.server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { side, amount } = await request.json();
  if (side !== "YES" && side !== "NO") {
    return NextResponse.json({ error: "side must be YES or NO" }, { status: 400 });
  }
  const amt = Math.floor(Number(amount));
  if (!Number.isFinite(amt) || amt <= 0) {
    return NextResponse.json({ error: "amount must be positive" }, { status: 400 });
  }

  const prediction = await prisma.prediction.findUnique({ where: { id } });
  if (!prediction) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }
  if (prediction.status !== "OPEN") {
    return NextResponse.json({ error: "Prediction is closed" }, { status: 400 });
  }
  if (prediction.closesAt && prediction.closesAt.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "This market has passed its close time" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.balance < amt) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const stake = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: amt } },
    });
    return tx.stake.create({
      data: { predictionId: id, userId, side, amount: amt },
    });
  });

  await awardBadge(userId, "first_stake");

  return NextResponse.json({ stake }, { status: 201 });
}
