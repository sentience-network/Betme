"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";

export function CrashGame({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [cashoutAt, setCashoutAt] = useState(2);
  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(false);
  const [flying, setFlying] = useState(false);
  const [displayMult, setDisplayMult] = useState(1);
  const [crashed, setCrashed] = useState(false);
  const [survived, setSurvived] = useState<boolean | null>(null);
  const [last, setLast] = useState<string>("Set auto-cashout and launch.");

  async function play() {
    setLoading(true);
    setFlying(true);
    setCrashed(false);
    setSurvived(null);
    setDisplayMult(1);
    try {
      const res = await fetch("/api/casino/crash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake, cashoutAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Crash failed");

      const target = data.survived ? data.cashoutAt : data.crashAt;
      const steps = 24;
      for (let i = 1; i <= steps; i++) {
        await new Promise((r) => setTimeout(r, 45));
        setDisplayMult(1 + ((target - 1) * i) / steps);
      }
      setDisplayMult(target);
      setSurvived(!!data.survived);
      if (!data.survived) setCrashed(true);

      setCredits(data.credits);
      setLast(
        data.survived
          ? `Cashed ${data.cashoutAt}× before ${data.crashAt}× crash · +${data.payout} Betme credits`
          : `Crashed at ${data.crashAt}× before your ${data.cashoutAt}× · lost stake`
      );
      router.refresh();
    } catch (e) {
      setLast(e instanceof Error ? e.message : "Crash failed");
    } finally {
      setLoading(false);
      setTimeout(() => setFlying(false), 400);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Instant</p>
          <h1 className="font-display text-4xl font-extrabold text-ink">Crash Rocket</h1>
          <p className="mt-2 text-sm text-ink/60">Auto-cashout before the boom · Betme credits</p>
        </div>
        <div className="rounded-xl bg-ink px-4 py-3 text-right text-lime">
          <p className="text-[0.65rem] uppercase tracking-widest text-lime/70">Betme balance</p>
          <p className="font-display text-2xl font-bold">{credits} cr</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-b from-[#140818] via-[#1a0a28] to-ink p-8 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="slot-sparks absolute inset-0" style={{ ["--slot-glow" as string]: "#ff6b4a" }} />
        </div>
        <div
          className={`relative mx-auto mb-4 flex h-28 w-16 items-end justify-center ${
            flying ? "crash-rocket-fly" : ""
          }`}
          style={{
            ["--crash-end" as string]: survived === false ? "10%" : "-40%",
          }}
        >
          <svg viewBox="0 0 48 80" className="h-24 w-14 drop-shadow-[0_0_16px_rgba(255,100,60,0.6)]">
            <path d="M24 4 L36 36 L30 36 L30 64 L18 64 L18 36 L12 36 Z" fill="#e4572e" />
            <rect x="18" y="40" width="12" height="16" fill="#ffd93d" opacity="0.9" />
            <path d="M18 64 L14 76 L24 70 L34 76 L30 64 Z" fill="#ffa94d" className={flying ? "slot-bg-pulse" : ""} />
          </svg>
          {crashed && (
            <span className="crash-boom absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/80" />
          )}
        </div>
        <p
          className="relative font-display text-6xl font-extrabold"
          style={{
            color: survived === false ? "#e4572e" : survived ? "#c8f560" : "#eef6f1",
            textShadow: "0 0 24px rgba(228,87,46,0.45)",
          }}
        >
          {displayMult.toFixed(2)}×
        </p>
        <p className="relative mt-2 text-sm text-white/50">
          {flying ? "In flight…" : "Target cashout"}
        </p>
      </div>

      <label className="block text-sm text-ink/70">
        Cashout at {cashoutAt.toFixed(1)}×
        <input
          type="range"
          min={1.1}
          max={10}
          step={0.1}
          value={cashoutAt}
          onChange={(e) => setCashoutAt(Number(e.target.value))}
          className="mt-2 w-full"
          disabled={loading}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {CASINO.stakes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStake(s)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              stake === s ? "bg-ink text-lime" : "bg-mist text-ink"
            }`}
          >
            {s} cr
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={loading || credits < stake}
        onClick={play}
        className="rounded-xl bg-ember px-6 py-3 font-display text-lg font-bold text-white disabled:opacity-50"
      >
        {loading ? "Flying…" : `Launch · ${stake} cr`}
      </button>
      <p className="text-sm text-ink/65">{last}</p>
    </div>
  );
}
