import { randomInt } from "crypto";
import { PLINKO_MULTIPLIERS } from "./public";

export { PLINKO_MULTIPLIERS } from "./public";

export type PlinkoResult = {
  rows: number;
  path: number[];
  bucket: number;
  multiplier: number;
  payout: number;
};

export function dropPlinko(stake: number, rows = 12): PlinkoResult {
  const path: number[] = [];
  let rights = 0;
  for (let i = 0; i < rows; i++) {
    const dir = randomInt(2) === 0 ? -1 : 1;
    path.push(dir);
    if (dir === 1) rights += 1;
  }
  const bucket = Math.min(PLINKO_MULTIPLIERS.length - 1, Math.max(0, rights));
  const multiplier = PLINKO_MULTIPLIERS[bucket]!;
  const payout = Math.floor(stake * multiplier);
  return { rows, path, bucket, multiplier, payout };
}
