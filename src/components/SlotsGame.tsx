"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";
import type { SlotCatalogItem } from "@/lib/casino/catalog";
import { lineModeLabel } from "@/lib/casino/lines";
import {
  ALL_SLOT_SYMBOLS,
  getThemePack,
  type SlotSymbol,
} from "@/lib/casino/symbols";
import { getSlotVisual } from "@/lib/casino/themes";
import { SlotSymbolArt } from "@/components/casino/SlotSymbolArt";
import { SlotThemeBackdrop } from "@/components/casino/SlotThemeBackdrop";
import { WinFx } from "@/components/casino/WinFx";

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

function buildStrip(len: number, seed: number): SlotSymbol[] {
  return Array.from({ length: len }, (_, i) => {
    const idx = (seed * 17 + i * 3 + Math.floor(i * 1.7)) % ALL_SLOT_SYMBOLS.length;
    return ALL_SLOT_SYMBOLS[idx]!;
  });
}

function ReelColumn({
  symbols,
  spinning,
  stopDelayMs,
  highlightRows,
  stickyRows,
  accent,
  anticipation,
  colIndex,
  theme,
}: {
  symbols: SlotSymbol[];
  spinning: boolean;
  stopDelayMs: number;
  highlightRows: Set<number>;
  stickyRows: Set<number>;
  accent: string;
  anticipation: boolean;
  colIndex: number;
  theme: string;
}) {
  const [phase, setPhase] = useState<"idle" | "spin" | "land">("idle");
  const [show, setShow] = useState(symbols);
  const strip = useMemo(() => {
    void spinning;
    return buildStrip(18, colIndex + Math.floor(stopDelayMs / 100) + (spinning ? 1 : 0));
  }, [colIndex, stopDelayMs, spinning]);

  useEffect(() => {
    if (!spinning) {
      setShow(symbols);
      setPhase("land");
      const t = setTimeout(() => setPhase("idle"), 420);
      return () => clearTimeout(t);
    }
    setPhase("spin");
    const stop = setTimeout(() => {
      setShow(symbols);
      setPhase("land");
    }, stopDelayMs);
    return () => clearTimeout(stop);
  }, [spinning, symbols, stopDelayMs]);

  const cellH =
    symbols.length >= 4 ? "min-h-[4.25rem] md:min-h-[5rem]" : "min-h-[5rem] md:min-h-[5.75rem]";

  if (phase === "spin") {
    return (
      <div
        className={`slot-reel-window relative flex-1 overflow-hidden rounded-xl border ${
          anticipation ? "slot-reel-anticipate" : ""
        }`}
        style={{
          borderColor: `${accent}66`,
          minHeight: symbols.length >= 4 ? "17.5rem" : "16rem",
        }}
      >
        <div
          className={`slot-strip ${anticipation ? "slot-strip-slow" : "slot-strip-fast"}`}
          style={{ animationDuration: anticipation ? "0.14s" : `${0.055 + colIndex * 0.008}s` }}
        >
          {[...strip, ...strip].map((sym, i) => (
            <div
              key={i}
              className={`flex ${cellH} items-center justify-center border-b border-white/5 bg-black/40`}
            >
              <SlotSymbolArt symbol={sym} theme={theme} size="md" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      {show.map((sym, row) => {
        const hot = highlightRows.has(row);
        const sticky = stickyRows.has(row);
        return (
          <div
            key={`${row}-${sym}-${phase}`}
            className={`relative flex ${cellH} items-center justify-center rounded-xl border ${
              hot ? "slot-win-pulse" : phase === "land" ? "slot-cell-settle" : ""
            } ${sticky ? "slot-sticky-glow" : ""}`}
            style={{
              borderColor: sticky ? "#c8f560" : hot ? accent : "rgba(255,255,255,0.12)",
              background: sticky
                ? "linear-gradient(160deg,#1f7a63,#071a14)"
                : hot
                  ? `linear-gradient(160deg, ${accent}88, #071a14)`
                  : "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(0,0,0,0.45))",
              boxShadow:
                hot || sticky ? `0 0 28px ${accent}99, inset 0 0 20px ${accent}33` : "inset 0 1px 0 #fff2",
            }}
          >
            <SlotSymbolArt symbol={sym} theme={theme} size="lg" hot={hot} />
            {sticky && (
              <span className="absolute bottom-1 right-1 rounded bg-lime/90 px-1 text-[0.55rem] font-black text-ink">
                LOCK
              </span>
            )}
            {hot && <span className="slot-cell-shine absolute inset-0 rounded-xl" />}
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
  const visual = getSlotVisual(game.theme);
  const pack = getThemePack(game.theme);
  const rows = game.lines === 100 || game.lines === 500 ? 4 : 3;
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [credits, setCredits] = useState(initialCredits);
  const [grid, setGrid] = useState<SlotSymbol[][]>(() => emptyGrid(5, rows));
  const [spinning, setSpinning] = useState(false);
  const [wins, setWins] = useState<LineWin[]>([]);
  const [message, setMessage] = useState(
    `${game.name} · ${lineModeLabel(game.lines)} · 3 ${pack.scatterName}s unlock Free Spins`
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
  const [spinToken, setSpinToken] = useState(0);
  const lock = useRef(false);
  const autoRef = useRef(false);
  const bonusIdRef = useRef<string | null>(null);

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

  async function runSpin(opts?: { free?: boolean; bonusSessionId?: string }) {
    if (lock.current) return;
    lock.current = true;
    setSpinning(true);
    setSpinToken((t) => t + 1);
    setWins([]);
    setShowTier(false);
    setTier("none");

    const activeBonusId = opts?.bonusSessionId ?? bonusIdRef.current;
    const isFree = !!(opts?.free && activeBonusId);
    setMessage(isFree ? `Free spin · ${freeMult}× multiplier` : "Reels spinning…");

    try {
      const res = await fetch("/api/casino/slots/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isFree
            ? { action: "freespin", bonusId: activeBonusId, gameId: game.id }
            : { action: "spin", stake, gameId: game.id }
        ),
      });
      const data = (await res.json()) as SpinResponse;
      if (!res.ok) throw new Error(data.error || "Spin failed");

      setGrid(data.grid);
      await new Promise((r) => setTimeout(r, 3200));

      setCredits(data.credits);
      setWins(data.lineWins || []);
      setLastPayout(data.payout);
      setSticky(data.stickyWilds || []);
      setSpinning(false);

      if (data.winTier && data.winTier !== "none") {
        setTier(data.winTier);
        setShowTier(true);
        setTimeout(() => setShowTier(false), data.winTier === "epic" ? 3400 : 2000);
      }

      if (data.bonusId) {
        bonusIdRef.current = data.bonusId;
        setBonusId(data.bonusId);
      }

      if (data.bonusActive) {
        setBonusLeft(data.bonusRemaining || 0);
        setBonusTotal(data.bonusTotalWin || 0);
        if (data.freeSpinMult) setFreeMult(data.freeSpinMult);
        if (data.bonus?.awarded && !isFree) {
          setBonusIntro(`${data.bonus.awarded} FREE SPINS · ${data.freeSpinMult || 2}×`);
          setTimeout(() => setBonusIntro(null), 2400);
        }
      } else if (isFree) {
        setBonusLeft(0);
        setBonusTotal(data.bonusTotalWin || 0);
        bonusIdRef.current = null;
        setBonusId(null);
        setSticky([]);
        setMessage(`Bonus complete · +${data.bonusTotalWin || 0} Betme credits total`);
        setAutoplay(false);
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

      if (data.bonus?.awarded && isFree) {
        setMessage(`Retrigger! +${data.bonus.awarded} free spins`);
        setBonusLeft(data.bonusRemaining || 0);
      }

      router.refresh();

      const nextBonusId = data.bonusId ?? activeBonusId;
      const stillBonus = !!data.bonusActive && (data.bonusRemaining || 0) > 0 && !!nextBonusId;
      lock.current = false;
      if (stillBonus) {
        // First trigger: wait for intro; continuing spins: shorter gap
        const delay = isFree ? 850 : 2600;
        setTimeout(() => void runSpin({ free: true, bonusSessionId: nextBonusId! }), delay);
        return;
      }
      if (autoRef.current) {
        setTimeout(() => {
          if (autoRef.current) void runSpin();
        }, 700);
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
            {visual.label} · {lineModeLabel(game.lines)} · {game.volatility} vol
          </p>
          <h1 className="font-display text-4xl font-extrabold text-ink md:text-5xl">{game.name}</h1>
          <p className="mt-2 max-w-md text-sm text-ink/60">{game.tagline}</p>
        </div>
        <div className="rounded-xl bg-ink px-4 py-3 text-right text-lime shadow-[0_0_24px_rgba(200,245,96,0.2)]">
          <p className="text-[0.65rem] uppercase tracking-widest text-lime/70">Betme balance</p>
          <p className="font-display text-2xl font-bold">{credits} cr</p>
        </div>
      </div>

      {bonusLeft > 0 && (
        <div className="slot-bonus-banner rounded-xl border border-lime/50 bg-ink px-4 py-3 text-lime">
          <p className="font-display text-lg font-bold">
            FREE SPINS · {bonusLeft} left · {freeMult}× · bank {bonusTotal} cr
          </p>
          <p className="text-xs text-lime/70">
            {pack.wildName}s stick · feature multiplier active
          </p>
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-[1.75rem] border-2 p-2 shadow-[0_28px_80px_rgba(0,0,0,0.45)] md:p-4 ${
          showTier ? "slot-cabinet-win" : ""
        }`}
        style={{
          borderColor: `${visual.glow}66`,
          background: `linear-gradient(165deg, ${visual.sky}, #050505)`,
        }}
      >
        <SlotThemeBackdrop visual={visual} accent={game.accent} win={showTier} />

        <div className="relative z-10 mb-3 flex items-center justify-between px-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/55">
          <span>{lineModeLabel(game.lines)}</span>
          <span className="text-white/40">{visual.label} floor</span>
          <span>
            {pack.wildName} · {pack.scatterName}
          </span>
        </div>

        <div
          key={spinToken}
          className="relative z-10 rounded-2xl border border-white/10 bg-black/35 p-2 backdrop-blur-[2px] md:p-3"
          style={{ boxShadow: `inset 0 0 40px ${visual.glow}22, 0 0 0 1px ${game.accent}33` }}
        >
          <div className="flex gap-1.5 md:gap-2" style={{ minHeight: rows === 4 ? "18rem" : "16rem" }}>
            {grid.map((col, c) => (
              <ReelColumn
                key={c}
                symbols={col}
                spinning={spinning}
                stopDelayMs={700 + c * 420 + (c === 4 ? 380 : 0)}
                highlightRows={highlight.get(c) ?? new Set()}
                stickyRows={stickyByCol.get(c) ?? new Set()}
                accent={game.accent}
                anticipation={spinning && c === 4}
                colIndex={c}
                theme={game.theme}
              />
            ))}
          </div>
        </div>

        <WinFx active={showTier} tier={tier} color={visual.particle} />

        {showTier && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center slot-tier-overlay">
            <div className="rounded-2xl border border-lime/40 bg-ink/90 px-8 py-5 text-center shadow-2xl">
              <p
                className="font-display text-4xl font-extrabold md:text-5xl"
                style={{ color: visual.glow, textShadow: `0 0 24px ${visual.glow}` }}
              >
                {TIER_COPY[tier]}
              </p>
              <p className="mt-1 font-display text-2xl text-foam">+{lastPayout} cr</p>
            </div>
          </div>
        )}

        {bonusIntro && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center slot-tier-overlay">
            <div className="rounded-2xl border-2 border-lime bg-ink px-8 py-6 text-center slot-bonus-pop">
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
              stake === s
                ? "bg-ink text-lime shadow-[0_0_16px_rgba(200,245,96,0.35)]"
                : "bg-mist text-ink hover:bg-mist/80"
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
          className={`slot-spin-btn rounded-xl bg-lime px-8 py-3.5 font-display text-lg font-bold text-ink transition hover:bg-lime-deep disabled:cursor-not-allowed disabled:opacity-50 ${
            !spinning && bonusLeft === 0 ? "slot-spin-idle" : ""
          }`}
        >
          {spinning ? "Spinning…" : `SPIN · ${stake} cr`}
        </button>
        {bonusLeft > 0 && !spinning && (
          <button
            type="button"
            onClick={() => void runSpin({ free: true, bonusSessionId: bonusId ?? undefined })}
            className="rounded-xl border border-lime bg-ink px-5 py-3 text-sm font-bold text-lime"
          >
            Play free spin
          </button>
        )}
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
          <p className="font-semibold text-ink">{game.theme} symbols</p>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(Object.keys(pack.symbols) as SlotSymbol[]).map((s) => (
              <div key={s} className="flex items-center gap-2 rounded-xl bg-mist/60 px-2 py-2">
                <SlotSymbolArt symbol={s} theme={game.theme} size="sm" />
                <span className="text-xs">
                  {pack.symbols[s].name}
                  {s === "scatter" ? " · 3 = Free Spins" : " · 3/4/5"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink/50">
            Free Spins: sticky {pack.wildName.toLowerCase()}s +{" "}
            {game.volatility === "high" ? "3×" : "2×"} win multiplier. Retrigger with 3{" "}
            {pack.scatterName.toLowerCase()}s. Betme credits only.
          </p>
        </div>
      )}

      {wins.length > 0 && (
        <ul className="max-h-36 space-y-1 overflow-auto rounded-xl border border-[var(--line)] bg-white/50 p-3 text-xs text-ink/70">
          {wins.slice(0, 14).map((w, i) => (
            <li key={i} className="flex items-center gap-2">
              <SlotSymbolArt symbol={w.symbol} theme={game.theme} size="sm" />
              <span>
                {w.lineIndex === -2
                  ? `${pack.scatterName} ×${w.count}`
                  : w.lineIndex < 0
                    ? `Ways · ${pack.symbols[w.symbol].name} ×${w.count}`
                    : `Line ${w.lineIndex + 1} · ${pack.symbols[w.symbol].name} ×${w.count}`}{" "}
                · +{w.payout} cr
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
