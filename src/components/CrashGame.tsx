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
  const [last, setLast] = useState<string>("Set auto-cashout and launch.");

  async function play() {
    setLoading(true);
    try {
      const res = await fetch("/api/casino/crash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake, cashoutAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Crash failed");
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

      <div className="rounded-3xl border border-[var(--line)] bg-gradient-to-br from-ink to-ink-soft p-8 text-center text-lime">
        <p className="font-display text-6xl font-extrabold">{cashoutAt.toFixed(2)}×</p>
        <p className="mt-2 text-sm text-lime/60">Target cashout</p>
      </div>

      <label className="block text-sm text-ink/70">
        Cashout at
        <input
          type="range"
          min={1.1}
          max={10}
          step={0.1}
          value={cashoutAt}
          onChange={(e) => setCashoutAt(Number(e.target.value))}
          className="mt-2 w-full"
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
