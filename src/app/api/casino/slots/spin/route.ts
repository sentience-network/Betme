import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { spendCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { spinSlots } from "@/lib/casino/slots";
import { getSlotById } from "@/lib/casino/catalog";
import { afterCasinoPlay, getUserCredits, parseStake, settleWin } from "@/lib/casino";

type BonusState = {
  remaining: number;
  stake: number;
  gameId: string;
  totalWin: number;
  stickyWilds: Array<{ col: number; row: number }>;
  freeSpinMult: number;
};

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = String(body.action || "spin");
    const game = getSlotById(String(body.gameId || "slot-001"));

    // Free-spin continuation — no additional wager
    if (action === "freespin") {
      const bonusId = String(body.bonusId || "");
      const bonusSession = await prisma.casinoGameSession.findFirst({
        where: { id: bonusId, userId, gameType: "SLOTS_BONUS", status: "OPEN" },
      });
      if (!bonusSession?.resultJson) {
        return NextResponse.json({ error: "No active free spins" }, { status: 400 });
      }
      const state = JSON.parse(bonusSession.resultJson) as BonusState;
      if (state.remaining <= 0) {
        return NextResponse.json({ error: "Free spins finished" }, { status: 400 });
      }

      const result = spinSlots(state.stake, getSlotById(state.gameId), {
        isFreeSpin: true,
        freeSpinMult: state.freeSpinMult,
        stickyWilds: state.stickyWilds,
      });

      state.remaining -= 1;
      state.totalWin += result.payout;
      state.stickyWilds = result.stickyWilds;
      if (result.bonus?.awarded) state.remaining += result.bonus.awarded;

      await settleWin(userId, result.payout, "slots_freespin_win", {
        bonusId,
        remaining: state.remaining,
      });

      const finished = state.remaining <= 0;
      await prisma.casinoGameSession.update({
        where: { id: bonusId },
        data: {
          status: finished ? "SETTLED" : "OPEN",
          payout: state.totalWin,
          resultJson: JSON.stringify(state),
        },
      });

      if (finished) await afterCasinoPlay(userId, state.totalWin > state.stake);

      const credits = await getUserCredits(userId);
      return NextResponse.json({
        sessionId: bonusId,
        bonusId,
        stake: state.stake,
        ...result,
        bonusRemaining: state.remaining,
        bonusTotalWin: state.totalWin,
        bonusActive: !finished,
        freeSpinMult: state.freeSpinMult,
        credits,
      });
    }

    // Base spin
    const stake = parseStake(body.stake);
    await spendCredits(userId, stake, "slots_wager", {
      game: "SLOTS",
      gameId: game.id,
      gameName: game.name,
    });
    const result = spinSlots(stake, game);

    const session = await prisma.casinoGameSession.create({
      data: {
        userId,
        gameType: "SLOTS",
        stake,
        payout: result.payout,
        status: "SETTLED",
        resultJson: JSON.stringify(result),
      },
    });

    await settleWin(userId, result.payout, "slots_win", {
      sessionId: session.id,
      gameId: game.id,
      gameName: game.name,
      winTier: result.winTier,
      lineMode: result.lineMode,
    });

    let bonusId: string | undefined;
    let bonusRemaining = 0;
    if (result.bonus?.type === "freespins" && result.bonus.awarded > 0) {
      const bonusState: BonusState = {
        remaining: result.bonus.awarded,
        stake,
        gameId: game.id,
        totalWin: 0,
        stickyWilds: [],
        freeSpinMult: game.volatility === "high" ? 3 : 2,
      };
      const bonusSession = await prisma.casinoGameSession.create({
        data: {
          userId,
          gameType: "SLOTS_BONUS",
          stake,
          payout: 0,
          status: "OPEN",
          resultJson: JSON.stringify(bonusState),
        },
      });
      bonusId = bonusSession.id;
      bonusRemaining = bonusState.remaining;
    }

    await afterCasinoPlay(userId, result.payout > stake);
    const credits = await getUserCredits(userId);
    return NextResponse.json({
      sessionId: session.id,
      stake,
      ...result,
      bonusId,
      bonusRemaining,
      bonusActive: bonusRemaining > 0,
      bonusTotalWin: 0,
      freeSpinMult: game.volatility === "high" ? 3 : 2,
      credits,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Spin failed";
    const status = message.includes("credits") || message.includes("Stake") || message.includes("free") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
