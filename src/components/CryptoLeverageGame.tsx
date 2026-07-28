"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";
import { CRYPTO_PAIRS, LEVERAGES } from "@/lib/casino/public";

export function CryptoLeverageGame({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [pair, setPair] = useState<(typeof CRYPTO_PAIRS)[number]>("BTC-USD");
  const [side, setSide] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(10);
  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>(
    "Fake markets · fake leverage · real Betme credits only."
  );

  async function trade() {
    setLoading(true);
    try {
      const res = await fetch("/api/casino/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake, pair, side, leverage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Trade failed");
      setCredits(data.credits);
      setResult(
        data.liquidated
          ? `${data.pair} ${side} ${leverage}× LIQUIDATED · entry ${data.entry} → ${data.exit}`
          : `${data.pair} ${side} ${leverage}× · ${data.pnlPct}% · entry ${data.entry} → ${data.exit} · +${data.payout} cr`
      );
      router.refresh();
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Trade failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tide">Simulator</p>
          <h1 className="font-display text-4xl font-extrabold text-ink">Leverage Lab</h1>
          <p className="mt-2 max-w-md text-sm text-ink/60">
            Simulated crypto candles with fake leverage. Stakes and payouts are Betme credits —
            never real crypto, never cash.
          </p>
        </div>
        <div className="rounded-xl bg-ink px-4 py-3 text-right text-lime">
          <p className="text-[0.65rem] uppercase tracking-widest text-lime/70">Betme balance</p>
          <p className="font-display text-2xl font-bold">{credits} cr</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-ink/70">
          Pair
          <select
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            value={pair}
            onChange={(e) => setPair(e.target.value as (typeof CRYPTO_PAIRS)[number])}
          >
            {CRYPTO_PAIRS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ink/70">
          Leverage
          <select
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
          >
            {LEVERAGES.map((l) => (
              <option key={l} value={l}>
                {l}×
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSide("long")}
          className={`flex-1 rounded-xl py-3 font-bold ${
            side === "long" ? "bg-tide text-white" : "bg-mist text-ink"
          }`}
        >
          Long
        </button>
        <button
          type="button"
          onClick={() => setSide("short")}
          className={`flex-1 rounded-xl py-3 font-bold ${
            side === "short" ? "bg-ember text-white" : "bg-mist text-ink"
          }`}
        >
          Short
        </button>
      </div>

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
        onClick={trade}
        className="rounded-xl bg-ink px-6 py-3 font-display text-lg font-bold text-lime disabled:opacity-50"
      >
        {loading ? "Opening…" : `Open ${side} · ${stake} cr`}
      </button>
      <p className="text-sm text-ink/65">{result}</p>
    </div>
  );
}
