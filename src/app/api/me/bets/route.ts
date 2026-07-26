import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { computeUserStats } from "@/lib/stats";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const stakes = await prisma.stake.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { prediction: { select: { id: true, title: true, status: true, outcome: true } } },
  });

  const stats = computeUserStats(stakes.map((s) => ({ amount: s.amount, payout: s.payout })));

  return NextResponse.json({ stakes, stats });
}
