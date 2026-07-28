"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";
import { PLINKO_MULTIPLIERS } from "@/lib/casino/public";

export function PlinkoGame({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [credits, setCredits] = useState(initialCredits);
  const [bucket, setBucket] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [msg, setMsg] = useState("Drop the puck — wins pay in Betme credits.");
  const pegs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: row + 3 }, (_, i) => ({ row, i, key: `${row}-${i}` }))
      ),
    []
  );

  async function drop() {
    setLoading(true);
    setDropping(true);
    setBucket(null);
    try {
      const res = await fetch("/api/casino/plinko", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Drop failed");
      await new Promise((r) => setTimeout(r, 1200));
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
      setDropping(false);
    }
  }

  const puckX =
    bucket == null
      ? "-50%"
      : `calc(${((bucket + 0.5) / PLINKO_MULTIPLIERS.length) * 100}% - 50%)`;

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

      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-b from-[#062a3a] via-[#0d4a5c] to-[#071a14] p-4 shadow-inner">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="slot-water absolute inset-x-0 bottom-0 h-1/2" />
        </div>
        <div className="relative mx-auto max-w-lg space-y-3 py-4">
          {pegs.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-4 md:gap-6">
              {row.map((p) => (
                <span
                  key={p.key}
                  className="h-2.5 w-2.5 rounded-full bg-lime/80 shadow-[0_0_8px_rgba(200,245,96,0.6)] md:h-3 md:w-3"
                />
              ))}
            </div>
          ))}
          {dropping && (
            <span
              className="plinko-puck absolute left-1/2 top-2 z-10 h-5 w-5 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shadow-lg"
              style={{ ["--plinko-x" as string]: puckX }}
            />
          )}
        </div>

        <div className="relative mt-2 flex gap-1 overflow-x-auto">
          {PLINKO_MULTIPLIERS.map((m, i) => (
            <div
              key={i}
              className={`flex min-w-0 flex-1 flex-col items-center rounded-lg py-3 text-xs font-bold transition ${
                bucket === i
                  ? "scale-105 bg-lime text-ink shadow-[0_0_20px_rgba(200,245,96,0.5)]"
                  : "bg-white/10 text-lime"
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
