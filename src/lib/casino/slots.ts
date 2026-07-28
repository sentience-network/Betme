import { randomInt } from "crypto";
import type { SlotCatalogItem } from "./catalog";
import { getLayoutForLines, type LineMode } from "./lines";
import type { SlotSymbol } from "./symbols";
import { SLOT_SYMBOL_LABEL } from "./symbols";

export type { SlotSymbol } from "./symbols";
export { SLOT_SYMBOL_LABEL } from "./symbols";

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
  cherry: { 3: 0.4, 4: 1.2, 5: 4 },
  lemon: { 3: 0.5, 4: 1.5, 5: 5 },
  bell: { 3: 0.8, 4: 2.5, 5: 8 },
  bar: { 3: 1.2, 4: 4, 5: 12 },
  seven: { 3: 2, 4: 8, 5: 25 },
  diamond: { 3: 3, 4: 12, 5: 40 },
  wild: { 3: 2, 4: 8, 5: 30 },
  scatter: { 3: 1, 4: 3, 5: 10 },
};

const THEME_WEIGHTS: Record<string, Partial<Record<SlotSymbol, number>>> = {
  Mythology: { cherry: 18, lemon: 16, bell: 16, bar: 14, seven: 12, diamond: 10, wild: 8, scatter: 6 },
  Fishing: { cherry: 22, lemon: 20, bell: 16, bar: 12, seven: 10, diamond: 8, wild: 7, scatter: 5 },
  Fortune: { cherry: 16, lemon: 16, bell: 15, bar: 14, seven: 12, diamond: 12, wild: 9, scatter: 6 },
  Candy: { cherry: 20, lemon: 18, bell: 16, bar: 14, seven: 12, diamond: 8, wild: 7, scatter: 5 },
  Classic: { cherry: 24, lemon: 22, bell: 18, bar: 14, seven: 10, diamond: 6, wild: 4, scatter: 2 },
  default: { cherry: 20, lemon: 18, bell: 16, bar: 14, seven: 12, diamond: 10, wild: 6, scatter: 4 },
};

function pickSymbol(
  theme: string,
  volatility: SlotCatalogItem["volatility"],
  boostWild = false
): SlotSymbol {
  const base = THEME_WEIGHTS[theme] ?? THEME_WEIGHTS.default!;
  const weights: Record<SlotSymbol, number> = {
    cherry: base.cherry ?? 20,
    lemon: base.lemon ?? 18,
    bell: base.bell ?? 16,
    bar: base.bar ?? 14,
    seven: base.seven ?? 12,
    diamond: base.diamond ?? 10,
    wild: (base.wild ?? 6) * (volatility === "high" ? 1.2 : 1) * (boostWild ? 2.2 : 1),
    scatter: (base.scatter ?? 4) * (boostWild ? 0.5 : 1),
  };
  const entries = Object.entries(weights) as [SlotSymbol, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let roll = randomInt(Math.floor(total));
  for (const [sym, w] of entries) {
    roll -= w;
    if (roll < 0) return sym;
  }
  return "cherry";
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
    if (s === "wild") {
      (["cherry", "lemon", "bell", "bar", "seven", "diamond"] as SlotSymbol[]).forEach((x) =>
        candidates.add(x)
      );
    } else candidates.add(s);
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

  const grid: SlotSymbol[][] = [];
  for (let c = 0; c < layout.cols; c++) {
    const col: SlotSymbol[] = [];
    for (let r = 0; r < layout.rows; r++) {
      const stickyHit = sticky.some((w) => w.col === c && w.row === r);
      col.push(
        stickyHit ? "wild" : pickSymbol(game.theme, game.volatility, isFreeSpin)
      );
    }
    grid.push(col);
  }

  // During free spins, newly landed wilds become sticky
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
    } else {
      // Retrigger
      bonus = {
        type: "freespins",
        awarded: scatters >= 3 ? 5 : 0,
        scatters,
      };
      if (bonus.awarded === 0) bonus = undefined;
    }
  }

  payout = Math.floor(payout * freeSpinMult);
  const labels = grid.map((col) => col.map((s) => SLOT_SYMBOL_LABEL[s]));
  const totalMultiplier = stake > 0 ? Number((payout / stake).toFixed(2)) : 0;

  return {
    gameId: game.id,
    gameName: game.name,
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
