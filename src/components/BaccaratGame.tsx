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
  const [board, setBoard] = useState<{
    playerValue: number;
    bankerValue: number;
    winner: string;
  } | null>(null);

  async function deal() {
    setLoading(true);
    setBoard(null);
    try {
      const res = await fetch("/api/casino/baccarat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake, side }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deal failed");
      await new Promise((r) => setTimeout(r, 400));
      setBoard({
        playerValue: data.playerValue,
        bankerValue: data.bankerValue,
        winner: data.winner,
      });
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

      <div className="relative overflow-hidden rounded-3xl border-2 border-[#c9a227]/35 bg-gradient-to-b from-[#1a0a28] via-[#2d1b4e] to-[#0a0612] p-8 text-center text-foam">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="slot-rays absolute inset-0" style={{ ["--slot-glow" as string]: "#d4a0ff" }} />
        </div>
        <div className="relative grid gap-6 sm:grid-cols-2">
          <div
            className={`rounded-2xl border p-6 transition ${
              board?.winner === "player" ? "border-lime bg-lime/10 shadow-[0_0_24px_rgba(200,245,96,0.35)]" : "border-white/15 bg-black/30"
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-white/50">Player</p>
            <p className="mt-2 font-display text-5xl font-extrabold">{board?.playerValue ?? "—"}</p>
          </div>
          <div
            className={`rounded-2xl border p-6 transition ${
              board?.winner === "banker" ? "border-lime bg-lime/10 shadow-[0_0_24px_rgba(200,245,96,0.35)]" : "border-white/15 bg-black/30"
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-white/50">Banker</p>
            <p className="mt-2 font-display text-5xl font-extrabold">{board?.bankerValue ?? "—"}</p>
          </div>
        </div>
        {board?.winner === "tie" && (
          <p className="relative mt-4 font-display text-2xl font-bold text-lime">TIE</p>
        )}
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
