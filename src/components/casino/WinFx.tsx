"use client";

import { useMemo } from "react";

/** Coin shower + radial burst for win tiers (inspired by modern video-slot celebrations). */
export function WinFx({
  active,
  tier,
  color,
}: {
  active: boolean;
  tier: "none" | "nice" | "big" | "mega" | "epic";
  color: string;
}) {
  const coins = useMemo(
    () =>
      Array.from({ length: tier === "epic" ? 28 : tier === "mega" ? 20 : 14 }, (_, i) => ({
        id: i,
        left: 4 + ((i * 37) % 92),
        delay: (i % 8) * 0.07,
        dur: 1.1 + (i % 5) * 0.15,
        size: 10 + (i % 4) * 4,
      })),
    [tier]
  );

  if (!active || tier === "none") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      <div
        className="slot-win-burst absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}99 0%, transparent 70%)` }}
      />
      {coins.map((c) => (
        <span
          key={c.id}
          className="slot-coin absolute top-[-12%] rounded-full"
          style={{
            left: `${c.left}%`,
            width: c.size,
            height: c.size,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.dur}s`,
            background: `radial-gradient(circle at 30% 30%, #fff8e7, ${color} 45%, #a67c00)`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}
      {(tier === "mega" || tier === "epic") && (
        <div className="slot-sparks absolute inset-0" style={{ ["--slot-glow" as string]: color }} />
      )}
    </div>
  );
}
