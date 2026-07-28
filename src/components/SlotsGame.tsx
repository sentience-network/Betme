"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";
import type { SlotCatalogItem } from "@/lib/casino/catalog";
import { lineModeLabel } from "@/lib/casino/lines";
import {
  ALL_SLOT_SYMBOLS,
  SLOT_SYMBOL_LABEL,
  SLOT_SYMBOL_TINT,
  type SlotSymbol,
} from "@/lib/casino/symbols";

type LineWin = {
  lineIndex: number;
  symbol: SlotSymbol;
  count: number;
  cells: Array<{ col: number; row: number }>;
  payout: number;
};

type WinTier = "none" | "nice" | "big" | "mega" | "epic";

type SpinResponse = {
  grid: SlotSymbol[][];
  lineMode: 15 | 20 | 100 | 500;
  mode: "lines" | "ways";
  lineWins: LineWin[];
  waysWon: number;
  totalMultiplier: number;
  payout: number;
  win: boolean;
  winTier: WinTier;
  credits: number;
  bonus?: { type: string; awarded: number; scatters: number };
  bonusId?: string;
  bonusRemaining?: number;
  bonusActive?: boolean;
  bonusTotalWin?: number;
  freeSpinMult?: number;
  stickyWilds?: Array<{ col: number; row: number }>;
  isFreeSpin?: boolean;
  error?: string;
};

function emptyGrid(cols: number, rows: number): SlotSymbol[][] {
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => ALL_SLOT_SYMBOLS[(c + r) % 6]!)
  );
}

function ReelColumn({
  symbols,
  spinning,
  stopDelayMs,
  highlightRows,
  stickyRows,
  accent,
}: {
  symbols: SlotSymbol[];
  spinning: boolean;
  stopDelayMs: number;
  highlightRows: Set<number>;
  stickyRows: Set<number>;
  accent: string;
}) {
  const [blur, setBlur] = useState(false);
  const [show, setShow] = useState(symbols);

  useEffect(() => {
    if (!spinning) {
      setBlur(false);
      setShow(symbols);
      return;
    }
    setBlur(true);
    const iv = setInterval(() => {
      setShow(
        Array.from(
          { length: symbols.length },
          () => ALL_SLOT_SYMBOLS[Math.floor(Math.random() * ALL_SLOT_SYMBOLS.length)]!
        )
      );
    }, 55);
    const stop = setTimeout(() => {
      clearInterval(iv);
      setShow(symbols);
      setBlur(false);
    }, stopDelayMs);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
    };
  }, [spinning, symbols, stopDelayMs]);

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      {show.map((sym, row) => {
        const hot = highlightRows.has(row);
        const sticky = stickyRows.has(row);
        return (
          <div
            key={`${row}-${spinning}-${sym}`}
            className={`slot-cell relative flex aspect-square items-center justify-center rounded-xl border text-2xl font-black md:text-3xl ${
              blur ? "slot-reel-blur" : hot ? "slot-win-pulse" : "slot-cell-settle"
            }`}
            style={{
              borderColor: sticky ? "#c8f560" : hot ? accent : "rgba(200,245,96,0.18)",
              background: sticky
                ? "linear-gradient(160deg,#1f7a63,#071a14)"
                : hot
                  ? `${accent}55`
                  : "rgba(0,0,0,0.35)",
              color: SLOT_SYMBOL_TINT[sym],
              boxShadow: hot || sticky ? `0 0 22px ${accent}aa` : undefined,
            }}
          >
            {SLOT_SYMBOL_LABEL[sym]}
            {sticky && (
              <span className="absolute bottom-0.5 right-1 text-[0.55rem] font-bold text-lime">
                STICKY
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const TIER_COPY: Record<WinTier, string> = {
  none: "",
  nice: "NICE WIN",
  big: "BIG WIN",
  mega: "MEGA WIN",
  epic: "EPIC WIN",
};

export function SlotsGame({
  initialCredits,
  game,
}: {
  initialCredits: number;
  game: SlotCatalogItem;
}) {
  const router = useRouter();
  const rows = game.lines === 100 || game.lines === 500 ? 4 : 3;
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [credits, setCredits] = useState(initialCredits);
  const [grid, setGrid] = useState<SlotSymbol[][]>(() => emptyGrid(5, rows));
  const [spinning, setSpinning] = useState(false);
  const [wins, setWins] = useState<LineWin[]>([]);
  const [waysWon, setWaysWon] = useState(0);
  const [message, setMessage] = useState(
    `${game.name} · ${lineModeLabel(game.lines)} · 3★ triggers Free Spins`
  );
  const [lastPayout, setLastPayout] = useState(0);
  const [tier, setTier] = useState<WinTier>("none");
  const [showTier, setShowTier] = useState(false);
  const [bonusId, setBonusId] = useState<string | null>(null);
  const [bonusLeft, setBonusLeft] = useState(0);
  const [bonusTotal, setBonusTotal] = useState(0);
  const [freeMult, setFreeMult] = useState(2);
  const [sticky, setSticky] = useState<Array<{ col: number; row: number }>>([]);
  const [autoplay, setAutoplay] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [bonusIntro, setBonusIntro] = useState<string | null>(null);
  const lock = useRef(false);
  const autoRef = useRef(false);

  useEffect(() => {
    autoRef.current = autoplay;
  }, [autoplay]);

  const highlight = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (let c = 0; c < 5; c++) map.set(c, new Set());
    for (const w of wins) for (const cell of w.cells) map.get(cell.col)?.add(cell.row);
    return map;
  }, [wins]);

  const stickyByCol = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (let c = 0; c < 5; c++) map.set(c, new Set());
    for (const s of sticky) map.get(s.col)?.add(s.row);
    return map;
  }, [sticky]);

  async function runSpin(opts?: { free?: boolean }) {
    if (lock.current) return;
    lock.current = true;
    setSpinning(true);
    setWins([]);
    setWaysWon(0);
    setShowTier(false);
    setTier("none");
    setMessage(opts?.free ? `Free spin · ${freeMult}× multiplier` : "Reels spinning…");

    try {
      const res = await fetch("/api/casino/slots/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          opts?.free && bonusId
            ? { action: "freespin", bonusId, gameId: game.id }
            : { action: "spin", stake, gameId: game.id }
        ),
      });
      const data = (await res.json()) as SpinResponse;
      if (!res.ok) throw new Error(data.error || "Spin failed");

      setGrid(data.grid);
      await new Promise((r) => setTimeout(r, 2600));

      setCredits(data.credits);
      setWins(data.lineWins || []);
      setWaysWon(data.waysWon || 0);
      setLastPayout(data.payout);
      setSticky(data.stickyWilds || []);
      setSpinning(false);

      if (data.winTier && data.winTier !== "none") {
        setTier(data.winTier);
        setShowTier(true);
        setTimeout(() => setShowTier(false), data.winTier === "epic" ? 3200 : 1800);
      }

      if (data.bonusActive && data.bonusId) {
        setBonusId(data.bonusId);
        setBonusLeft(data.bonusRemaining || 0);
        setBonusTotal(data.bonusTotalWin || 0);
        if (data.freeSpinMult) setFreeMult(data.freeSpinMult);
        if (data.bonus?.awarded && !opts?.free) {
          setBonusIntro(`${data.bonus.awarded} FREE SPINS · ${data.freeSpinMult || 2}×`);
          setTimeout(() => setBonusIntro(null), 2200);
        }
      } else if (opts?.free) {
        setBonusLeft(data.bonusRemaining || 0);
        setBonusTotal(data.bonusTotalWin || 0);
        if (!data.bonusActive) {
          setBonusId(null);
          setSticky([]);
          setMessage(`Bonus complete · +${data.bonusTotalWin || 0} Betme credits total`);
          setAutoplay(false);
        }
      }

      if (data.payout > 0) {
        setMessage(
          data.mode === "ways"
            ? `+${data.payout} cr · ${data.waysWon} ways · ${data.totalMultiplier}×`
            : `+${data.payout} cr · ${data.lineWins.length} paying line(s)`
        );
      } else if (!data.bonusActive) {
        setMessage("No paying lines — spin again.");
      }

      if (data.bonus?.awarded && opts?.free) {
        setMessage(`Retrigger! +${data.bonus.awarded} free spins`);
      }

      router.refresh();

      const stillBonus = !!data.bonusActive && (data.bonusRemaining || 0) > 0;
      lock.current = false;
      if (stillBonus) {
        setTimeout(() => void runSpin({ free: true }), 850);
        return;
      }
      if (autoRef.current) {
        setTimeout(() => {
          if (autoRef.current) void runSpin();
        }, 650);
      }
    } catch (err) {
      setSpinning(false);
      setAutoplay(false);
      setMessage(err instanceof Error ? err.message : "Spin failed");
      lock.current = false;
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: game.accent }}>
            {game.theme} · {lineModeLabel(game.lines)} · {game.volatility} vol
          </p>
          <h1 className="font-display text-4xl font-extrabold text-ink md:text-5xl">{game.name}</h1>
          <p className="mt-2 max-w-md text-sm text-ink/60">{game.tagline}</p>
        </div>
        <div className="rounded-xl bg-ink px-4 py-3 text-right text-lime">
          <p className="text-[0.65rem] uppercase tracking-widest text-lime/70">Betme balance</p>
          <p className="font-display text-2xl font-bold">{credits} cr</p>
        </div>
      </div>

      {bonusLeft > 0 && (
        <div className="rounded-xl border border-lime/40 bg-ink px-4 py-3 text-lime">
          <p className="font-display text-lg font-bold">
            FREE SPINS · {bonusLeft} left · {freeMult}× · bonus bank {bonusTotal} cr
          </p>
          <p className="text-xs text-lime/70">Sticky wilds stay locked for the feature</p>
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-3xl border border-[var(--line)] p-3 shadow-[0_24px_70px_rgba(7,26,20,0.35)] md:p-5 ${
          showTier ? "slot-cabinet-win" : ""
        }`}
        style={{ background: `linear-gradient(165deg, #050f0c 0%, ${game.accent}66 55%, #071a14 100%)` }}
      >
        <div className="mb-3 flex items-center justify-between px-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-lime/70">
          <span>{lineModeLabel(game.lines)}</span>
          <span>Wilds · Scatters · Free Spins</span>
        </div>

        <div className="flex gap-1.5 md:gap-2">
          {grid.map((col, c) => (
            <ReelColumn
              key={c}
              symbols={col}
              spinning={spinning}
              stopDelayMs={650 + c * 400}
              highlightRows={highlight.get(c) ?? new Set()}
              stickyRows={stickyByCol.get(c) ?? new Set()}
              accent={game.accent}
            />
          ))}
        </div>

        {showTier && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center slot-tier-overlay">
            <div className="rounded-2xl bg-ink/85 px-8 py-5 text-center shadow-2xl">
              <p className="font-display text-4xl font-extrabold text-lime md:text-5xl">
                {TIER_COPY[tier]}
              </p>
              <p className="mt-1 font-display text-2xl text-foam">+{lastPayout} cr</p>
            </div>
          </div>
        )}

        {bonusIntro && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center slot-tier-overlay">
            <div className="rounded-2xl border border-lime bg-ink px-8 py-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime/70">Bonus unlocked</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-lime">{bonusIntro}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CASINO.stakes.map((s) => (
          <button
            key={s}
            type="button"
            disabled={spinning || bonusLeft > 0}
            onClick={() => setStake(s)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              stake === s ? "bg-ink text-lime" : "bg-mist text-ink hover:bg-mist/80"
            }`}
          >
            {s} cr
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={spinning || credits < stake || bonusLeft > 0}
          onClick={() => void runSpin()}
          className="rounded-xl bg-lime px-8 py-3.5 font-display text-lg font-bold text-ink transition hover:bg-lime-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {spinning ? "Spinning…" : `SPIN · ${stake} cr`}
        </button>
        <button
          type="button"
          disabled={spinning || bonusLeft > 0}
          onClick={() => setAutoplay((v) => !v)}
          className={`rounded-xl px-4 py-3 text-sm font-bold ${
            autoplay ? "bg-ember text-white" : "border border-ink text-ink"
          }`}
        >
          {autoplay ? "Stop Auto" : "Autoplay"}
        </button>
        <button
          type="button"
          onClick={() => setShowPaytable((v) => !v)}
          className="rounded-xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-ink/70"
        >
          Paytable
        </button>
        {lastPayout > 0 && (
          <span className="font-display text-xl font-bold text-tide">+{lastPayout} cr</span>
        )}
      </div>

      <p className="text-sm text-ink/65">{message}</p>

      {showPaytable && (
        <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4 text-sm text-ink/70">
          <p className="font-semibold text-ink">Pays (× stake / line share)</p>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {(Object.keys(SLOT_SYMBOL_LABEL) as SlotSymbol[]).map((s) => (
              <div key={s} className="rounded-lg bg-mist/60 px-2 py-1.5">
                <span style={{ color: SLOT_SYMBOL_TINT[s] }}>{SLOT_SYMBOL_LABEL[s]}</span>{" "}
                {s === "scatter" ? "3★ = Free Spins" : "3 / 4 / 5 match"}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink/50">
            Free Spins: sticky wilds + {game.volatility === "high" ? "3×" : "2×"} win multiplier.
            Retrigger with 3★ during the feature. Betme credits only.
          </p>
        </div>
      )}

      {wins.length > 0 && (
        <ul className="max-h-36 space-y-1 overflow-auto rounded-xl border border-[var(--line)] bg-white/50 p-3 text-xs text-ink/70">
          {wins.slice(0, 14).map((w, i) => (
            <li key={i}>
              {w.lineIndex === -2
                ? `Scatter ×${w.count}`
                : w.lineIndex < 0
                  ? `Ways · ${SLOT_SYMBOL_LABEL[w.symbol]} ×${w.count}`
                  : `Line ${w.lineIndex + 1} · ${SLOT_SYMBOL_LABEL[w.symbol]} ×${w.count}`}{" "}
              · +{w.payout} cr
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
