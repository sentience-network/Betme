import { CASINO } from "../constants";
import { prisma } from "../db";
import { grantCredits } from "../credits";
import { awardBadge, ensureBadgeCatalog } from "../badges";

export function parseStake(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isInteger(n) || n < CASINO.minStake || n > CASINO.maxStake) {
    throw new Error(`Stake must be ${CASINO.minStake}–${CASINO.maxStake} credits`);
  }
  if (!(CASINO.stakes as readonly number[]).includes(n)) {
    throw new Error(`Stake must be one of: ${CASINO.stakes.join(", ")}`);
  }
  return n;
}

export async function getUserCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}

export async function afterCasinoPlay(userId: string, won: boolean) {
  await ensureBadgeCatalog();
  await awardBadge(userId, "floor_walker").catch(() => undefined);

  if (!won) return;

  const recent = await prisma.casinoGameSession.findMany({
    where: { userId, status: "SETTLED" },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { payout: true, stake: true },
  });
  if (recent.length === 3 && recent.every((s) => s.payout > s.stake)) {
    await awardBadge(userId, "hot_streak").catch(() => undefined);
  }
}

export async function settleWin(userId: string, payout: number, reason: string, meta?: Record<string, unknown>) {
  if (payout > 0) {
    await grantCredits(userId, payout, reason, meta);
  }
}
