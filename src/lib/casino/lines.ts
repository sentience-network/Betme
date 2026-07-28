/** Payline / ways configs for Betme social slots. */

export type LineMode = 15 | 20 | 100 | 500;

export type SlotLayout = {
  cols: 5;
  rows: number;
  mode: "lines" | "ways";
  lineCount: LineMode;
  /** Each line is row index per reel (length = cols) */
  lines: number[][];
};

/** Classic 5×3 twenty-line map (row per reel). */
const LINES_20: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1],
  [0, 0, 2, 0, 0],
  [2, 2, 0, 2, 2],
  [1, 0, 2, 0, 1],
  [1, 2, 0, 2, 1],
  [0, 2, 1, 2, 0],
];

const LINES_15 = LINES_20.slice(0, 15);

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate N unique-ish paylines across `rows` on 5 reels. */
function generateLines(count: number, rows: number, seed = 42): number[][] {
  const rand = mulberry32(seed);
  const lines: number[][] = [];
  const seen = new Set<string>();

  // Prefer classic shapes first when rows=3
  if (rows === 3) {
    for (const L of LINES_20) {
      const key = L.join(",");
      if (!seen.has(key)) {
        seen.add(key);
        lines.push([...L]);
      }
      if (lines.length >= count) return lines;
    }
  }

  while (lines.length < count) {
    const line: number[] = [];
    let row = Math.floor(rand() * rows);
    for (let c = 0; c < 5; c++) {
      if (c > 0) {
        const step = Math.floor(rand() * 3) - 1; // -1,0,1
        row = Math.max(0, Math.min(rows - 1, row + step));
      }
      line.push(row);
    }
    const key = line.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      lines.push(line);
    }
  }
  return lines;
}

export function getLayoutForLines(lineMode: LineMode): SlotLayout {
  switch (lineMode) {
    case 15:
      return { cols: 5, rows: 3, mode: "lines", lineCount: 15, lines: LINES_15 };
    case 20:
      return { cols: 5, rows: 3, mode: "lines", lineCount: 20, lines: LINES_20 };
    case 100:
      return {
        cols: 5,
        rows: 4,
        mode: "lines",
        lineCount: 100,
        lines: generateLines(100, 4, 100),
      };
    case 500:
      return {
        cols: 5,
        rows: 4,
        mode: "ways",
        lineCount: 500,
        lines: [], // ways evaluated dynamically
      };
  }
}

export function assignLineMode(index: number, name: string): LineMode {
  const n = name.toLowerCase();
  if (n.includes("five lions") || n.includes("megaways") || n.includes("infinity")) return 500;
  if (n.includes("medusa") || n.includes("100") || n.includes("power reels")) return 100;
  if (n.includes("athena") || n.includes("starburst") || n.includes("classic")) return 15;
  if (n.includes("zeus") || n.includes("fishing") || n.includes("bass")) return 20;
  const cycle: LineMode[] = [20, 15, 100, 500];
  return cycle[index % cycle.length]!;
}

export function lineModeLabel(mode: LineMode) {
  return mode === 500 ? "500 Ways" : `${mode} Lines`;
}
