import { randomInt } from "crypto";
import { CRYPTO_PAIRS, LEVERAGES } from "./public";

export { CRYPTO_PAIRS, LEVERAGES } from "./public";

export type CryptoTradeResult = {
  pair: (typeof CRYPTO_PAIRS)[number];
  side: "long" | "short";
  leverage: number;
  entry: number;
  exit: number;
  movePct: number;
  pnlPct: number;
  liquidated: boolean;
  payout: number;
  disclaimer: string;
};

function basePrice(pair: string): number {
  switch (pair) {
    case "BTC-USD":
      return 64000 + randomInt(4000);
    case "ETH-USD":
      return 3200 + randomInt(400);
    case "SOL-USD":
      return 140 + randomInt(40);
    case "DOGE-USD":
      return 0.12 + randomInt(20) / 1000;
    default:
      return 580 + randomInt(40);
  }
}

export function resolveLeverageTrade(
  stake: number,
  pair: (typeof CRYPTO_PAIRS)[number],
  side: "long" | "short",
  leverage: number
): CryptoTradeResult {
  const lev = (LEVERAGES as readonly number[]).includes(leverage) ? leverage : 10;
  const entry = basePrice(pair);
  const moveBps = randomInt(0, 601) - 300;
  const movePct = moveBps / 100;
  const dir = side === "long" ? 1 : -1;
  const pnlPct = movePct * dir * lev;
  const exit = entry * (1 + movePct / 100);
  const liquidated = pnlPct <= -95;
  let payout = 0;
  if (!liquidated) {
    const creditDelta = stake * (1 + pnlPct / 100);
    payout = Math.max(0, Math.floor(creditDelta));
  }

  return {
    pair,
    side,
    leverage: lev,
    entry: Number(entry.toFixed(pair === "DOGE-USD" ? 4 : 2)),
    exit: Number(exit.toFixed(pair === "DOGE-USD" ? 4 : 2)),
    movePct: Number(movePct.toFixed(2)),
    pnlPct: Number(pnlPct.toFixed(2)),
    liquidated,
    payout,
    disclaimer: "Simulated markets only. Betme credits — never real crypto, never cash.",
  };
}
