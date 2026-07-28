import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { spendCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { randomInt } from "crypto";
import { afterCasinoPlay, getUserCredits, parseStake, settleWin } from "@/lib/casino";

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const stake = parseStake(body.stake);
    const bet = String(body.bet || "red"); // red | black | green
    if (!["red", "black", "green"].includes(bet)) {
      return NextResponse.json({ error: "Bet must be red, black, or green" }, { status: 400 });
    }

    await spendCredits(userId, stake, "roulette_wager", { bet });
    const number = randomInt(0, 37); // 0-36
    const color =
      number === 0 ? "green" : [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(number)
        ? "red"
        : "black";

    let multiplier = 0;
    if (bet === "green" && color === "green") multiplier = 14;
    else if (bet === color) multiplier = 2;

    const payout = Math.floor(stake * multiplier);
    const session = await prisma.casinoGameSession.create({
      data: {
        userId,
        gameType: "ROULETTE",
        stake,
        payout,
        status: "SETTLED",
        resultJson: JSON.stringify({ number, color, bet, multiplier }),
      },
    });
    await settleWin(userId, payout, "roulette_win", { sessionId: session.id, number, color });
    await afterCasinoPlay(userId, payout > stake);
    const credits = await getUserCredits(userId);
    return NextResponse.json({ sessionId: session.id, stake, number, color, bet, multiplier, payout, credits });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Roulette failed";
    const status = message.includes("credits") || message.includes("Stake") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
