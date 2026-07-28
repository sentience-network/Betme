import { randomInt } from "crypto";

export type CrashRound = {
  crashAt: number;
  /** Hash-like seed string for client display */
  seed: string;
};

export type CrashCashoutResult = {
  crashAt: number;
  cashoutAt: number;
  survived: boolean;
  multiplier: number;
  payout: number;
};

/** Generate crash point with soft house edge (most rounds < 2x). */
export function generateCrashRound(): CrashRound {
  // Bustaproof-style curve approximation
  const e = 2 ** 32;
  const h = randomInt(1, e);
  const crashAt = Math.max(1, Math.floor((100 * e - h) / (e - h)) / 100);
  const capped = Math.min(crashAt, 100);
  return {
    crashAt: Number(capped.toFixed(2)),
    seed: `bm_${h.toString(16)}`,
  };
}

export function resolveCrashCashout(stake: number, crashAt: number, cashoutAt: number): CrashCashoutResult {
  const target = Math.max(1.01, Math.min(cashoutAt, 100));
  const survived = target <= crashAt;
  const multiplier = survived ? target : 0;
  const payout = survived ? Math.floor(stake * multiplier) : 0;
  return {
    crashAt,
    cashoutAt: target,
    survived,
    multiplier,
    payout,
  };
}
