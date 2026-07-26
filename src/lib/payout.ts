// Core Betme economics: how a resolved prediction's pool is distributed.
//
// The guiding product principle is "accurate predictors earn more". When a
// prediction resolves, everyone who staked on the losing side forfeits their
// stake into a prize pool. Winners get their original stake back plus a share
// of the losers' pool proportional to how much they staked (i.e. how much
// conviction / accuracy they showed).

export type Side = "YES" | "NO";

export interface StakeInput {
  id: string;
  userId: string;
  side: Side;
  amount: number;
}

export interface PayoutResult {
  stakeId: string;
  userId: string;
  /** Total credits returned to the user for this stake (0 for losers). */
  payout: number;
  /** Net profit/loss for this stake (payout - amount). */
  net: number;
}

/**
 * Compute payouts for a resolved prediction.
 *
 * Winners split the losing pool proportionally to their stake, on top of a
 * refund of their own stake. Losers receive nothing.
 */
export function computePayouts(
  stakes: StakeInput[],
  outcome: Side
): PayoutResult[] {
  const winners = stakes.filter((s) => s.side === outcome);
  const losers = stakes.filter((s) => s.side !== outcome);

  const winningPool = winners.reduce((sum, s) => sum + s.amount, 0);
  const losingPool = losers.reduce((sum, s) => sum + s.amount, 0);

  return stakes.map((s) => {
    if (s.side !== outcome) {
      return { stakeId: s.id, userId: s.userId, payout: 0, net: -s.amount };
    }

    // Winner: refund own stake + proportional share of the losing pool.
    const share = winningPool > 0 ? (s.amount / winningPool) * losingPool : 0;
    const payout = Math.round(s.amount + share);
    return {
      stakeId: s.id,
      userId: s.userId,
      payout,
      net: payout - s.amount,
    };
  });
}

/** Implied probability of YES given the current staked amounts, as a percent. */
export function impliedYesProbability(stakes: StakeInput[]): number {
  const yes = stakes.filter((s) => s.side === "YES").reduce((a, s) => a + s.amount, 0);
  const total = stakes.reduce((a, s) => a + s.amount, 0);
  if (total === 0) return 50;
  return Math.round((yes / total) * 100);
}
