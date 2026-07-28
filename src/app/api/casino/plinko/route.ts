import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { spendCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { dropPlinko } from "@/lib/casino/plinko";
import { afterCasinoPlay, getUserCredits, parseStake, settleWin } from "@/lib/casino";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const stake = parseStake(body.stake);
    await spendCredits(userId, stake, "plinko_wager", { game: "PLINKO" });
    const result = dropPlinko(stake);
    const session = await prisma.casinoGameSession.create({
      data: {
        userId,
        gameType: "PLINKO",
        stake,
        payout: result.payout,
        status: "SETTLED",
        resultJson: JSON.stringify(result),
      },
    });
    await settleWin(userId, result.payout, "plinko_win", { sessionId: session.id, ...result });
    await afterCasinoPlay(userId, result.payout > stake);
    const credits = await getUserCredits(userId);
    return NextResponse.json({ sessionId: session.id, stake, ...result, credits });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Plinko failed";
    const status = message.includes("credits") || message.includes("Stake") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
