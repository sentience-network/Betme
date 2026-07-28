import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { spendCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { generateCrashRound, resolveCrashCashout } from "@/lib/casino/crash";
import { afterCasinoPlay, getUserCredits, parseStake, settleWin } from "@/lib/casino";

/** Start a crash round — returns crash point only after client commits cashout target, or auto-resolve. */
export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const stake = parseStake(body.stake);
    const cashoutAt = Number(body.cashoutAt ?? 2);
    if (!Number.isFinite(cashoutAt) || cashoutAt < 1.01 || cashoutAt > 100) {
      return NextResponse.json({ error: "Cashout must be 1.01×–100×" }, { status: 400 });
    }

    await spendCredits(userId, stake, "crash_wager", { game: "CRASH" });
    const round = generateCrashRound();
    const result = resolveCrashCashout(stake, round.crashAt, cashoutAt);

    const session = await prisma.casinoGameSession.create({
      data: {
        userId,
        gameType: "CRASH",
        stake,
        payout: result.payout,
        status: "SETTLED",
        resultJson: JSON.stringify({ ...round, ...result }),
      },
    });

    await settleWin(userId, result.payout, "crash_win", {
      sessionId: session.id,
      crashAt: result.crashAt,
      cashoutAt: result.cashoutAt,
    });
    await afterCasinoPlay(userId, result.payout > stake);
    const credits = await getUserCredits(userId);
    return NextResponse.json({
      sessionId: session.id,
      stake,
      seed: round.seed,
      ...result,
      credits,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Crash failed";
    const status = message.includes("credits") || message.includes("Stake") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
