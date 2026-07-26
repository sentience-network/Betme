// Aggregate performance stats for a user, derived from their stakes.
//
// "Net earnings" is the realized profit/loss across *resolved* markets:
//   sum(payout - amount) for every stake whose prediction has resolved.
// (Open stakes have no payout yet and are treated as pending, not counted.)

export interface StakeForStats {
  amount: number;
  payout: number | null;
}

export interface UserStats {
  netEarnings: number;
  totalStaked: number;
  resolvedCount: number;
  wins: number;
  winRate: number; // 0-100, rounded
}

export function computeUserStats(stakes: StakeForStats[]): UserStats {
  let netEarnings = 0;
  let totalStaked = 0;
  let resolvedCount = 0;
  let wins = 0;

  for (const s of stakes) {
    totalStaked += s.amount;
    if (s.payout != null) {
      resolvedCount += 1;
      netEarnings += s.payout - s.amount;
      if (s.payout > s.amount) wins += 1;
    }
  }

  const winRate = resolvedCount > 0 ? Math.round((wins / resolvedCount) * 100) : 0;
  return { netEarnings, totalStaked, resolvedCount, wins, winRate };
}
