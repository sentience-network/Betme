"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";

export function RouletteGame({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [bet, setBet] = useState<"red" | "black" | "green">("red");
  const [credits, setCredits] = useState(initialCredits);
  const [msg, setMsg] = useState("Pick a color · Betme credits");
  const [loading, setLoading] = useState(false);

  async function spin() {
    setLoading(true);
    try {
      const res = await fetch("/api/casino/roulette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake, bet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Spin failed");
      setCredits(data.credits);
      setMsg(
        data.payout > 0
          ? `${data.number} ${data.color} · +${data.payout} Betme credits`
          : `${data.number} ${data.color} · lost stake`
      );
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Spin failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold">European Roulette</h1>
          <p className="text-sm text-ink/60">Betme credits · red/black 2× · zero 14×</p>
        </div>
        <div className="rounded-xl bg-ink px-4 py-3 text-lime">
          <p className="font-display text-2xl font-bold">{credits} cr</p>
        </div>
      </div>
      <div className="flex gap-2">
        {(["red", "black", "green"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setBet(c)}
            className={`flex-1 rounded-xl py-3 font-bold capitalize ${
              bet === c ? "bg-ink text-lime" : "bg-mist"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {CASINO.stakes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStake(s)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              stake === s ? "bg-ink text-lime" : "bg-mist"
            }`}
          >
            {s} cr
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={loading || credits < stake}
        onClick={spin}
        className="rounded-xl bg-lime px-6 py-3 font-display text-lg font-bold text-ink disabled:opacity-50"
      >
        {loading ? "Spinning…" : `Spin · ${stake} cr`}
      </button>
      <p className="text-sm text-ink/65">{msg}</p>
    </div>
  );
}
