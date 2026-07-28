import { randomInt } from "crypto";
import type { SlotCatalogItem } from "./catalog";
import { getLayoutForLines, type LineMode } from "./lines";
import {
  ALL_SLOT_SYMBOLS,
  PAY_SYMBOLS,
  getThemePack,
  symbolLabel,
  type SlotSymbol,
} from "./symbols";

export type { SlotSymbol } from "./symbols";
export { symbolLabel as SLOT_SYMBOL_LABEL_FN } from "./symbols";

export type LineWin = {
  lineIndex: number;
  symbol: SlotSymbol;
  count: number;
  cells: Array<{ col: number; row: number }>;
  payout: number;
};

export type WinTier = "none" | "nice" | "big" | "mega" | "epic";

export type BonusTrigger = {
  type: "freespins";
  awarded: number;
  scatters: number;
};

export type SlotSpinResult = {
  gameId: string;
  gameName: string;
  theme: string;
  lineMode: LineMode;
  mode: "lines" | "ways";
  cols: number;
  rows: number;
  grid: SlotSymbol[][];
  labels: string[][];
  lineWins: LineWin[];
  waysWon: number;
  totalMultiplier: number;
  payout: number;
  win: boolean;
  winTier: WinTier;
  isFreeSpin: boolean;
  freeSpinMult: number;
  bonus?: BonusTrigger;
  stickyWilds: Array<{ col: number; row: number }>;
};

export type SpinOptions = {
  isFreeSpin?: boolean;
  freeSpinMult?: number;
  stickyWilds?: Array<{ col: number; row: number }>;
};

const PAY: Record<SlotSymbol, Record<number, number>> = {
  low1: { 3: 0.4, 4: 1.2, 5: 4 },
  low2: { 3: 0.5, 4: 1.5, 5: 5 },
  low3: { 3: 0.8, 4: 2.5, 5: 8 },
  mid1: { 3: 1.2, 4: 4, 5: 12 },
  mid2: { 3: 2, 4: 8, 5: 25 },
  high: { 3: 3, 4: 12, 5: 40 },
  wild: { 3: 2, 4: 8, 5: 30 },
  scatter: { 3: 1, 4: 3, 5: 10 },
};

const THEME_WEIGHTS: Record<string, Partial<Record<SlotSymbol, number>>> = {
  Mythology: { low1: 18, low2: 16, low3: 16, mid1: 14, mid2: 12, high: 10, wild: 8, scatter: 8 },
  Fishing: { low1: 20, low2: 18, low3: 16, mid1: 12, mid2: 10, high: 8, wild: 7, scatter: 8 },
  Fortune: { low1: 16, low2: 16, low3: 15, mid1: 14, mid2: 12, high: 12, wild: 9, scatter: 8 },
  Candy: { low1: 20, low2: 18, low3: 16, mid1: 14, mid2: 12, high: 8, wild: 7, scatter: 7 },
  Classic: { low1: 22, low2: 20, low3: 18, mid1: 14, mid2: 10, high: 6, wild: 4, scatter: 6 },
  default: { low1: 18, low2: 17, low3: 16, mid1: 14, mid2: 12, high: 10, wild: 6, scatter: 7 },
};

function pickSymbol(
  theme: string,
  volatility: SlotCatalogItem["volatility"],
  opts: { boostWild?: boolean; boostScatter?: boolean } = {}
): SlotSymbol {
  const base = THEME_WEIGHTS[theme] ?? THEME_WEIGHTS.default!;
  const weights: Record<SlotSymbol, number> = {
    low1: base.low1 ?? 18,
    low2: base.low2 ?? 17,
    low3: base.low3 ?? 16,
    mid1: base.mid1 ?? 14,
    mid2: base.mid2 ?? 12,
    high: base.high ?? 10,
    wild: (base.wild ?? 6) * (volatility === "high" ? 1.2 : 1) * (opts.boostWild ? 2.4 : 1),
    scatter: (base.scatter ?? 7) * (opts.boostScatter ? 1.6 : opts.boostWild ? 0.7 : 1),
  };
  const entries = Object.entries(weights) as [SlotSymbol, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let roll = randomInt(Math.max(1, Math.floor(total)));
  for (const [sym, w] of entries) {
    roll -= w;
    if (roll < 0) return sym;
  }
  return "low1";
}

export function winTierFor(stake: number, payout: number): WinTier {
  if (payout <= 0) return "none";
  const x = payout / stake;
  if (x >= 25) return "epic";
  if (x >= 10) return "mega";
  if (x >= 5) return "big";
  if (x >= 2) return "nice";
  return "none";
}

function evaluateLine(
  grid: SlotSymbol[][],
  line: number[],
  lineIndex: number,
  betPerLine: number
): LineWin | null {
  const sequence: SlotSymbol[] = [];
  const cells: Array<{ col: number; row: number }> = [];
  for (let col = 0; col < 5; col++) {
    const row = line[col]!;
    sequence.push(grid[col]![row]!);
    cells.push({ col, row });
  }
  if (sequence[0] === "scatter") return null;

  let target: SlotSymbol | null = sequence[0] === "wild" ? null : sequence[0]!;
  let count = 0;
  const winCells: Array<{ col: number; row: number }> = [];

  for (let i = 0; i < sequence.length; i++) {
    const s = sequence[i]!;
    if (s === "scatter") break;
    if (target === null) {
      if (s === "wild") {
        count += 1;
        winCells.push(cells[i]!);
        continue;
      }
      target = s;
      count += 1;
      winCells.push(cells[i]!);
      continue;
    }
    if (s === target || s === "wild") {
      count += 1;
      winCells.push(cells[i]!);
    } else break;
  }

  if (!target || count < 3) return null;
  const mult = PAY[target]?.[count] ?? 0;
  if (mult <= 0) return null;
  return {
    lineIndex,
    symbol: target,
    count,
    cells: winCells,
    payout: Math.max(1, Math.floor(betPerLine * mult)),
  };
}

function evaluateWays(grid: SlotSymbol[][], stake: number) {
  const rows = grid[0]!.length;
  const candidates = new Set<SlotSymbol>();
  for (const s of grid[0]!) {
    if (s === "scatter") continue;
    if (s === "wild") PAY_SYMBOLS.forEach((x) => candidates.add(x));
    else candidates.add(s);
  }

  const wins: LineWin[] = [];
  let waysWon = 0;
  let payout = 0;

  for (const target of candidates) {
    const counts: number[] = [];
    const cellSets: Array<Array<{ col: number; row: number }>> = [];
    for (let col = 0; col < 5; col++) {
      const cells: Array<{ col: number; row: number }> = [];
      for (let row = 0; row < rows; row++) {
        const s = grid[col]![row]!;
        if (s === target || s === "wild") cells.push({ col, row });
      }
      if (cells.length === 0) break;
      counts.push(cells.length);
      cellSets.push(cells);
    }
    const length = counts.length;
    if (length < 3) continue;
    const ways = counts.slice(0, length).reduce((a, b) => a * b, 1);
    const mult = PAY[target]?.[length] ?? 0;
    if (mult <= 0) continue;
    const winPay = Math.floor(stake * mult * ways * 0.15);
    if (winPay <= 0) continue;
    waysWon += ways;
    payout += winPay;
    wins.push({
      lineIndex: -1,
      symbol: target,
      count: length,
      cells: cellSets.flat(),
      payout: winPay,
    });
  }
  return { wins, waysWon: Math.min(waysWon, 500), payout: Math.min(payout, stake * 80) };
}

function freeSpinsAwarded(scatters: number, volatility: SlotCatalogItem["volatility"]) {
  if (scatters < 3) return 0;
  const base = scatters === 3 ? 10 : scatters === 4 ? 15 : 20;
  return volatility === "high" ? base + 2 : base;
}

export function spinSlots(
  stake: number,
  game: SlotCatalogItem,
  options: SpinOptions = {}
): SlotSpinResult {
  const isFreeSpin = !!options.isFreeSpin;
  const freeSpinMult = options.freeSpinMult ?? (isFreeSpin ? 2 : 1);
  const sticky = options.stickyWilds ?? [];
  const layout = getLayoutForLines(game.lines);
  const pack = getThemePack(game.theme);

  const grid: SlotSymbol[][] = [];
  for (let c = 0; c < layout.cols; c++) {
    const col: SlotSymbol[] = [];
    for (let r = 0; r < layout.rows; r++) {
      const stickyHit = sticky.some((w) => w.col === c && w.row === r);
      col.push(
        stickyHit
          ? "wild"
          : pickSymbol(game.theme, game.volatility, {
              boostWild: isFreeSpin,
              boostScatter: !isFreeSpin,
            })
      );
    }
    grid.push(col);
  }

  const nextSticky = [...sticky];
  if (isFreeSpin) {
    for (let c = 0; c < layout.cols; c++) {
      for (let r = 0; r < layout.rows; r++) {
        if (grid[c]![r] === "wild" && !nextSticky.some((w) => w.col === c && w.row === r)) {
          nextSticky.push({ col: c, row: r });
        }
      }
    }
  }

  let lineWins: LineWin[] = [];
  let waysWon = 0;
  let payout = 0;

  if (layout.mode === "ways") {
    const result = evaluateWays(grid, stake);
    lineWins = result.wins;
    waysWon = result.waysWon;
    payout = result.payout;
  } else {
    const betPerLine = stake / layout.lineCount;
    for (let i = 0; i < layout.lines.length; i++) {
      const win = evaluateLine(grid, layout.lines[i]!, i, betPerLine);
      if (win) lineWins.push(win);
    }
    payout = Math.min(
      lineWins.reduce((a, w) => a + w.payout, 0),
      stake * 60
    );
  }

  let scatters = 0;
  const scatterCells: Array<{ col: number; row: number }> = [];
  for (let c = 0; c < grid.length; c++) {
    for (let r = 0; r < grid[c]!.length; r++) {
      if (grid[c]![r] === "scatter") {
        scatters += 1;
        scatterCells.push({ col: c, row: r });
      }
    }
  }

  let bonus: BonusTrigger | undefined;
  if (scatters >= 3) {
    const scatterPay = Math.floor(stake * (PAY.scatter[Math.min(5, scatters) as 3 | 4 | 5] ?? 1));
    payout += scatterPay;
    lineWins.push({
      lineIndex: -2,
      symbol: "scatter",
      count: scatters,
      cells: scatterCells,
      payout: scatterPay,
    });
    if (!isFreeSpin) {
      bonus = {
        type: "freespins",
        awarded: freeSpinsAwarded(scatters, game.volatility),
        scatters,
      };
    } else if (scatters >= 3) {
      bonus = {
        type: "freespins",
        awarded: 5,
        scatters,
      };
    }
  }

  payout = Math.floor(payout * freeSpinMult);
  const labels = grid.map((col) => col.map((s) => symbolLabel(game.theme, s)));
  const totalMultiplier = stake > 0 ? Number((payout / stake).toFixed(2)) : 0;

  return {
    gameId: game.id,
    gameName: game.name,
    theme: pack.id,
    lineMode: game.lines,
    mode: layout.mode,
    cols: layout.cols,
    rows: layout.rows,
    grid,
    labels,
    lineWins,
    waysWon,
    totalMultiplier,
    payout,
    win: payout > 0,
    winTier: winTierFor(stake, payout),
    isFreeSpin,
    freeSpinMult,
    bonus,
    stickyWilds: nextSticky,
  };
}

/** Dev/test helper */
export { ALL_SLOT_SYMBOLS };
