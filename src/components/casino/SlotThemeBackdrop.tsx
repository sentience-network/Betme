"use client";

import type { SlotVisualTheme } from "@/lib/casino/themes";
import { ThemeMotifArt } from "./SlotSymbolArt";

/** Animated themed backdrop behind the reel window (parallax / atmosphere). */
export function SlotThemeBackdrop({
  visual,
  accent,
  win,
}: {
  visual: SlotVisualTheme;
  accent: string;
  win?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 20%, ${visual.mid}aa 0%, transparent 55%),
            linear-gradient(180deg, ${visual.sky} 0%, ${visual.mid}88 45%, ${visual.sky} 100%)`,
        }}
      />
      <div
        className={`absolute -left-10 top-6 opacity-40 ${win ? "slot-bg-pulse" : "slot-bg-drift"}`}
        style={{ color: visual.glow }}
      >
        <ThemeMotifArt motif={visual.motif} color="currentColor" className="h-24 w-36" />
      </div>
      <div
        className={`absolute -right-8 bottom-10 opacity-30 ${win ? "slot-bg-pulse" : "slot-bg-drift-rev"}`}
        style={{ color: accent }}
      >
        <ThemeMotifArt motif={visual.motif} color="currentColor" className="h-28 w-40" />
      </div>
      <div className="slot-rays absolute inset-0 opacity-30" style={{ ["--slot-glow" as string]: visual.glow }} />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 opacity-40"
        style={{
          background: `linear-gradient(0deg, ${visual.ground}55, transparent)`,
        }}
      />
      {visual.id === "mythology" && <div className="slot-lightning absolute inset-0" />}
      {visual.id === "fishing" || visual.id === "ocean" ? (
        <div className="slot-water absolute inset-x-0 bottom-0 h-2/5" />
      ) : null}
      {visual.id === "candy" && <div className="slot-bubbles absolute inset-0" />}
    </div>
  );
}
