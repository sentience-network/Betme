"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";

export function BaccaratGame({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [side, setSide] = useState<"player" | "banker" | "tie">("player");
  const [credits, setCredits] = useState(initialCredits);
  const [msg, setMsg] = useState("Player · Banker · Tie — Betme credits");
  const [loading, setLoading] = useState(false);

  async function deal() {
    setLoading(true);
    try {
      const res = await fetch("/api/casino/baccarat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake, side }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deal failed");
      setCredits(data.credits);
      setMsg(
        `P${data.playerValue} vs B${data.bankerValue} · ${data.winner} wins` +
          (data.payout > 0 ? ` · +${data.payout} cr` : " · lost stake")
      );
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Deal failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold">Punto Banco</h1>
          <p className="text-sm text-ink/60">Simplified baccarat · Betme credits</p>
        </div>
        <div className="rounded-xl bg-ink px-4 py-3 text-lime">
          <p className="font-display text-2xl font-bold">{credits} cr</p>
        </div>
      </div>
      <div className="flex gap-2">
        {(["player", "banker", "tie"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={`flex-1 rounded-xl py-3 font-bold capitalize ${
              side === s ? "bg-ink text-lime" : "bg-mist"
            }`}
          >
            {s}
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
        onClick={deal}
        className="rounded-xl bg-lime px-6 py-3 font-display text-lg font-bold text-ink disabled:opacity-50"
      >
        {loading ? "Dealing…" : `Deal · ${stake} cr`}
      </button>
      <p className="text-sm text-ink/65">{msg}</p>
    </div>
  );
}
