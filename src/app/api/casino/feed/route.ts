import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SLOT_SYMBOL_LABEL } from "@/lib/casino/symbols";

/** Public social feed of recent casino wins. */
export async function GET() {
  const wins = await prisma.casinoGameSession.findMany({
    where: {
      status: "SETTLED",
      payout: { gt: 0 },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      user: { select: { username: true, displayName: true, avatarHue: true } },
    },
  });

  return NextResponse.json({
    wins: wins.map((w) => {
      let detail = "";
      if (w.gameType === "SLOTS" && w.resultJson) {
        try {
          const r = JSON.parse(w.resultJson) as { reels?: string[] };
          detail = (r.reels || []).map((s) => SLOT_SYMBOL_LABEL[s as keyof typeof SLOT_SYMBOL_LABEL] || s).join(" ");
        } catch {
          detail = "";
        }
      }
      return {
        id: w.id,
        gameType: w.gameType,
        stake: w.stake,
        payout: w.payout,
        detail,
        createdAt: w.createdAt,
        user: w.user,
      };
    }),
  });
}
