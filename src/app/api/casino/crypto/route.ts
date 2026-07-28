import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { spendCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { CRYPTO_PAIRS, LEVERAGES, resolveLeverageTrade } from "@/lib/casino/crypto";
import { afterCasinoPlay, getUserCredits, parseStake, settleWin } from "@/lib/casino";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const stake = parseStake(body.stake);
    const pair = CRYPTO_PAIRS.includes(body.pair) ? body.pair : "BTC-USD";
    const side = body.side === "short" ? "short" : "long";
    const leverage = LEVERAGES.includes(Number(body.leverage) as (typeof LEVERAGES)[number])
      ? Number(body.leverage)
      : 10;

    await spendCredits(userId, stake, "crypto_sim_wager", {
      game: "CRYPTO_LEV",
      pair,
      side,
      leverage,
    });

    const result = resolveLeverageTrade(stake, pair, side, leverage);
    const session = await prisma.casinoGameSession.create({
      data: {
        userId,
        gameType: "CRYPTO_LEV",
        stake,
        payout: result.payout,
        status: "SETTLED",
        resultJson: JSON.stringify(result),
      },
    });

    await settleWin(userId, result.payout, "crypto_sim_win", {
      sessionId: session.id,
      pair: result.pair,
      pnlPct: result.pnlPct,
    });
    await afterCasinoPlay(userId, result.payout > stake);
    const credits = await getUserCredits(userId);
    return NextResponse.json({ sessionId: session.id, stake, ...result, credits });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Trade failed";
    const status = message.includes("credits") || message.includes("Stake") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
