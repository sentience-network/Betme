"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";
import { PLINKO_MULTIPLIERS } from "@/lib/casino/public";

export function PlinkoGame({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [credits, setCredits] = useState(initialCredits);
  const [bucket, setBucket] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("Drop the puck — wins pay in Betme credits.");

  async function drop() {
    setLoading(true);
    try {
      const res = await fetch("/api/casino/plinko", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Drop failed");
      setCredits(data.credits);
      setBucket(data.bucket);
      setMsg(
        data.payout > stake
          ? `BIG DROP ${data.multiplier}× · +${data.payout} Betme credits`
          : data.payout > 0
            ? `Landed ${data.multiplier}× · +${data.payout} Betme credits`
            : `Bucket ${data.multiplier}× · no payout`
      );
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Drop failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tide">Instant</p>
          <h1 className="font-display text-4xl font-extrabold text-ink">Plinko Drop</h1>
          <p className="mt-2 text-sm text-ink/60">Peg board · Betme credits only</p>
        </div>
        <div className="rounded-xl bg-ink px-4 py-3 text-right text-lime">
          <p className="text-[0.65rem] uppercase tracking-widest text-lime/70">Betme balance</p>
          <p className="font-display text-2xl font-bold">{credits} cr</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-ink p-4">
        <div className="flex min-w-[520px] gap-1">
          {PLINKO_MULTIPLIERS.map((m, i) => (
            <div
              key={i}
              className={`flex flex-1 flex-col items-center rounded-lg py-3 text-xs font-bold ${
                bucket === i ? "bg-lime text-ink" : "bg-white/10 text-lime"
              }`}
            >
              {m}×
            </div>
          ))}
        </div>
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
        onClick={drop}
        className="rounded-xl bg-lime px-6 py-3 font-display text-lg font-bold text-ink disabled:opacity-50"
      >
        {loading ? "Dropping…" : `Drop · ${stake} cr`}
      </button>
      <p className="text-sm text-ink/65">{msg}</p>
    </div>
  );
}
