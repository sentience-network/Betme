import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { spendCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { createShoe, draw, handValue, type Card } from "@/lib/casino/blackjack";
import { afterCasinoPlay, getUserCredits, parseStake, settleWin } from "@/lib/casino";

function twoCardValue(cards: Card[]) {
  return handValue(cards);
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const stake = parseStake(body.stake);
    const side = body.side === "banker" || body.side === "tie" ? body.side : "player";

    await spendCredits(userId, stake, "baccarat_wager", { side });
    const shoe = createShoe(1);
    const player = [draw(shoe), draw(shoe)];
    const banker = [draw(shoe), draw(shoe)];
    // Simplified: no third-card rules for MVP speed
    const p = twoCardValue(player) % 10;
    // Baccarat uses modulo 10 of card values — approximate with handValue then % 10
    const b = twoCardValue(banker) % 10;

    let winner: "player" | "banker" | "tie" = "tie";
    if (p > b) winner = "player";
    else if (b > p) winner = "banker";

    let multiplier = 0;
    if (side === "tie" && winner === "tie") multiplier = 8;
    else if (side === winner) multiplier = side === "banker" ? 1.95 : 2;

    const payout = Math.floor(stake * multiplier);
    const session = await prisma.casinoGameSession.create({
      data: {
        userId,
        gameType: "BACCARAT",
        stake,
        payout,
        status: "SETTLED",
        resultJson: JSON.stringify({ side, winner, player, banker, p, b, multiplier }),
      },
    });
    await settleWin(userId, payout, "baccarat_win", { sessionId: session.id, winner });
    await afterCasinoPlay(userId, payout > stake);
    const credits = await getUserCredits(userId);
    return NextResponse.json({
      sessionId: session.id,
      stake,
      side,
      winner,
      player,
      banker,
      playerValue: p,
      bankerValue: b,
      multiplier,
      payout,
      credits,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Baccarat failed";
    const status = message.includes("credits") || message.includes("Stake") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
