import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeUserStats } from "@/lib/stats";

export async function GET() {
  const users = await prisma.user.findMany({
    include: {
      stakes: { select: { amount: true, payout: true } },
      _count: { select: { followers: true, predictions: true } },
    },
  });

  const rows = users
    .map((u) => {
      const stats = computeUserStats(u.stakes);
      return {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarColor: u.avatarColor,
        netEarnings: stats.netEarnings,
        winRate: stats.winRate,
        resolvedCount: stats.resolvedCount,
        totalStaked: stats.totalStaked,
        adEarningsCents: u.adEarningsCents,
        followers: u._count.followers,
        predictions: u._count.predictions,
      };
    })
    .sort(
      (a, b) => b.netEarnings - a.netEarnings || b.winRate - a.winRate
    );

  return NextResponse.json({ leaderboard: rows });
}
