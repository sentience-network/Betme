import { describe, it, expect } from "vitest";
import { computeUserStats } from "./stats";

describe("computeUserStats", () => {
  it("counts only resolved stakes toward net earnings and win rate", () => {
    const stats = computeUserStats([
      { amount: 100, payout: 150 }, // resolved win (+50)
      { amount: 100, payout: 0 }, // resolved loss (-100)
      { amount: 50, payout: null }, // open, pending
    ]);
    expect(stats.netEarnings).toBe(-50);
    expect(stats.resolvedCount).toBe(2);
    expect(stats.wins).toBe(1);
    expect(stats.winRate).toBe(50);
    expect(stats.totalStaked).toBe(250);
  });

  it("returns zeros for a user with no stakes", () => {
    const stats = computeUserStats([]);
    expect(stats).toEqual({
      netEarnings: 0,
      totalStaked: 0,
      resolvedCount: 0,
      wins: 0,
      winRate: 0,
    });
  });
});
