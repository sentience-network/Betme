import { describe, it, expect } from "vitest";
import { computePayouts, impliedYesProbability, type StakeInput } from "./payout";

describe("computePayouts", () => {
  it("pays winners their stake plus a proportional share of the losing pool", () => {
    const stakes: StakeInput[] = [
      { id: "a", userId: "u1", side: "YES", amount: 100 },
      { id: "b", userId: "u2", side: "YES", amount: 300 },
      { id: "c", userId: "u3", side: "NO", amount: 200 },
    ];
    const result = computePayouts(stakes, "YES");

    // Losing pool = 200, split across winning pool of 400.
    const u1 = result.find((r) => r.stakeId === "a")!;
    const u2 = result.find((r) => r.stakeId === "b")!;
    const u3 = result.find((r) => r.stakeId === "c")!;

    expect(u1.payout).toBe(150); // 100 + (100/400)*200
    expect(u2.payout).toBe(450); // 300 + (300/400)*200
    expect(u3.payout).toBe(0); // loser
    expect(u3.net).toBe(-200);
  });

  it("rewards the more accurate (larger) predictor with a bigger absolute gain", () => {
    const stakes: StakeInput[] = [
      { id: "small", userId: "u1", side: "YES", amount: 50 },
      { id: "big", userId: "u2", side: "YES", amount: 250 },
      { id: "loser", userId: "u3", side: "NO", amount: 300 },
    ];
    const result = computePayouts(stakes, "YES");
    const small = result.find((r) => r.stakeId === "small")!;
    const big = result.find((r) => r.stakeId === "big")!;
    expect(big.net).toBeGreaterThan(small.net);
  });

  it("returns zero payouts to everyone if nobody backed the outcome", () => {
    const stakes: StakeInput[] = [
      { id: "a", userId: "u1", side: "NO", amount: 100 },
    ];
    const result = computePayouts(stakes, "YES");
    expect(result[0].payout).toBe(0);
  });

  it("conserves total credits (payouts equal total staked)", () => {
    const stakes: StakeInput[] = [
      { id: "a", userId: "u1", side: "YES", amount: 100 },
      { id: "b", userId: "u2", side: "NO", amount: 100 },
      { id: "c", userId: "u3", side: "YES", amount: 100 },
    ];
    const total = stakes.reduce((s, x) => s + x.amount, 0);
    const paid = computePayouts(stakes, "YES").reduce((s, r) => s + r.payout, 0);
    expect(paid).toBe(total);
  });
});

describe("impliedYesProbability", () => {
  it("defaults to 50% with no stakes", () => {
    expect(impliedYesProbability([])).toBe(50);
  });

  it("reflects the balance of staked amounts", () => {
    const stakes: StakeInput[] = [
      { id: "a", userId: "u1", side: "YES", amount: 75 },
      { id: "b", userId: "u2", side: "NO", amount: 25 },
    ];
    expect(impliedYesProbability(stakes)).toBe(75);
  });
});
