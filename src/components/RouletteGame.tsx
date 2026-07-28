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
  const [spinning, setSpinning] = useState(false);
  const [resultNum, setResultNum] = useState<number | null>(null);
  const [spinDeg, setSpinDeg] = useState(1440);

  async function spin() {
    setLoading(true);
    setSpinning(true);
    setResultNum(null);
    try {
      const res = await fetch("/api/casino/roulette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stake, bet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Spin failed");
      const deg = 1440 + (37 - (data.number % 37)) * (360 / 37);
      setSpinDeg(deg);
      await new Promise((r) => setTimeout(r, 2500));
      setResultNum(data.number);
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
      setSpinning(false);
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

      <div className="relative mx-auto flex max-w-sm flex-col items-center rounded-3xl bg-gradient-to-b from-[#0d3b2e] to-[#071a14] p-8 shadow-inner">
        <div className="absolute top-4 h-3 w-3 rounded-full bg-lime shadow-[0_0_12px_#c8f560]" />
        <div
          className={`relative h-52 w-52 rounded-full border-8 border-[#c9a227] shadow-[0_0_40px_rgba(201,162,39,0.35)] ${
            spinning ? "roulette-wheel-spin" : ""
          }`}
          style={{ ["--roulette-end" as string]: `${spinDeg}deg` }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {Array.from({ length: 37 }, (_, i) => {
              const a0 = (i * 360) / 37;
              const a1 = ((i + 1) * 360) / 37;
              const color = i === 0 ? "#1f7a63" : i % 2 === 0 ? "#c92a2a" : "#1a1b1e";
              const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
              const x0 = 50 + 48 * Math.cos(toRad(a0));
              const y0 = 50 + 48 * Math.sin(toRad(a0));
              const x1 = 50 + 48 * Math.cos(toRad(a1));
              const y1 = 50 + 48 * Math.sin(toRad(a1));
              return (
                <path
                  key={i}
                  d={`M50 50 L${x0} ${y0} A48 48 0 0 1 ${x1} ${y1} Z`}
                  fill={color}
                  stroke="#071a14"
                  strokeWidth="0.3"
                />
              );
            })}
            <circle cx="50" cy="50" r="14" fill="#071a14" stroke="#c9a227" strokeWidth="2" />
          </svg>
        </div>
        {resultNum != null && (
          <p className="mt-4 font-display text-3xl font-bold text-lime">{resultNum}</p>
        )}
      </div>

      <div className="flex gap-2">
        {(["red", "black", "green"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setBet(c)}
            className={`flex-1 rounded-xl py-3 font-bold capitalize ${
              bet === c
                ? c === "red"
                  ? "bg-ember text-white"
                  : c === "black"
                    ? "bg-ink text-lime"
                    : "bg-tide text-white"
                : "bg-mist"
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
