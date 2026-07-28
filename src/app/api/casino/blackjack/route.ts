import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { spendCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import {
  dealBlackjack,
  hitBlackjack,
  handValue,
  payoutForOutcome,
  standBlackjack,
  type PersistedBlackjack,
} from "@/lib/casino/blackjack";
import { afterCasinoPlay, getUserCredits, parseStake, settleWin } from "@/lib/casino";

function publicState(data: PersistedBlackjack) {
  const { state } = data;
  return {
    player: state.player,
    dealer: state.dealerHidden
      ? [state.dealer[0], { rank: "?", suit: "?" as const }]
      : state.dealer,
    dealerHidden: state.dealerHidden,
    status: state.status,
    outcome: state.outcome,
    message: state.message,
    playerValue: handValue(state.player),
    dealerValue: state.dealerHidden ? undefined : handValue(state.dealer),
  };
}

async function settleIfNeeded(
  userId: string,
  sessionId: string,
  stake: number,
  data: PersistedBlackjack
) {
  if (data.state.status !== "settled") {
    await prisma.casinoGameSession.update({
      where: { id: sessionId },
      data: { resultJson: JSON.stringify(data), status: "OPEN" },
    });
    return { payout: 0, settled: false };
  }

  const payout = payoutForOutcome(stake, data.state.outcome);
  await prisma.casinoGameSession.update({
    where: { id: sessionId },
    data: {
      resultJson: JSON.stringify(data),
      status: "SETTLED",
      payout,
    },
  });
  await settleWin(userId, payout, "blackjack_win", {
    sessionId,
    outcome: data.state.outcome,
  });
  await afterCasinoPlay(userId, payout > stake);
  return { payout, settled: true };
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = String(body.action || "");

    if (action === "deal") {
      const stake = parseStake(body.stake);
      await spendCredits(userId, stake, "blackjack_wager", { game: "BLACKJACK" });

      const dealt = dealBlackjack();
      const data: PersistedBlackjack = { shoe: dealt.shoe, state: dealt.state };
      const session = await prisma.casinoGameSession.create({
        data: {
          userId,
          gameType: "BLACKJACK",
          stake,
          payout: 0,
          status: data.state.status === "settled" ? "SETTLED" : "OPEN",
          resultJson: JSON.stringify(data),
        },
      });

      let payout = 0;
      if (data.state.status === "settled") {
        payout = payoutForOutcome(stake, data.state.outcome);
        await prisma.casinoGameSession.update({
          where: { id: session.id },
          data: { payout },
        });
        await settleWin(userId, payout, "blackjack_win", {
          sessionId: session.id,
          outcome: data.state.outcome,
        });
        await afterCasinoPlay(userId, payout > stake);
      }

      const credits = await getUserCredits(userId);
      return NextResponse.json({
        sessionId: session.id,
        stake,
        payout,
        credits,
        ...publicState(data),
      });
    }

    if (action === "hit" || action === "stand") {
      const sessionId = String(body.sessionId || "");
      if (!sessionId) throw new Error("Missing sessionId");

      const session = await prisma.casinoGameSession.findFirst({
        where: { id: sessionId, userId, gameType: "BLACKJACK", status: "OPEN" },
      });
      if (!session?.resultJson) throw new Error("No open blackjack hand");

      let data = JSON.parse(session.resultJson) as PersistedBlackjack;
      data =
        action === "hit"
          ? hitBlackjack(data.shoe, data.state)
          : standBlackjack(data.shoe, data.state);

      const { payout } = await settleIfNeeded(userId, session.id, session.stake, data);
      const credits = await getUserCredits(userId);
      return NextResponse.json({
        sessionId: session.id,
        stake: session.stake,
        payout,
        credits,
        ...publicState(data),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Blackjack failed";
    const status =
      message.includes("credits") ||
      message.includes("Stake") ||
      message.includes("turn") ||
      message.includes("open")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
