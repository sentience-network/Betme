"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SlotCatalogItem } from "@/lib/casino/catalog";
import { lineModeLabel, type LineMode } from "@/lib/casino/lines";
import { getSlotVisual } from "@/lib/casino/themes";
import { ThemeMotifArt } from "@/components/casino/SlotSymbolArt";

export function SlotLobbyGrid({ slots }: { slots: SlotCatalogItem[] }) {
  const themes = useMemo(() => ["All", ...Array.from(new Set(slots.map((s) => s.theme)))], [slots]);
  const [theme, setTheme] = useState("All");
  const [lines, setLines] = useState<"All" | LineMode>("All");
  const [q, setQ] = useState("");

  const filtered = slots.filter((s) => {
    if (theme !== "All" && s.theme !== theme) return false;
    if (lines !== "All" && s.lines !== lines) return false;
    if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Zeus, Medusa, Gone Fishing, Five Lions…"
          className="w-full rounded-xl border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm outline-none ring-tide/30 focus:ring-2 md:max-w-md"
        />
        <p className="text-sm text-ink/50">{filtered.length} games · Betme credits</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {([15, 20, 100, 500] as LineMode[]).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setLines((cur) => (cur === n ? "All" : n))}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              lines === n ? "bg-lime text-ink" : "bg-ink text-lime"
            }`}
          >
            {lineModeLabel(n)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {themes.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              theme === t ? "bg-ink text-lime" : "bg-mist text-ink/70 hover:bg-mist/80"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((s) => {
          const v = getSlotVisual(s.theme);
          return (
            <Link
              key={s.id}
              href={`/casino/slots/${s.id}`}
              className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white/60 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="lobby-card-art relative flex h-36 items-end overflow-hidden p-4"
                style={{
                  background: `linear-gradient(135deg, ${v.sky} 0%, ${v.mid} 48%, ${s.accent} 100%)`,
                }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-50 transition duration-500 group-hover:scale-110 group-hover:opacity-70">
                  <ThemeMotifArt
                    motif={v.motif}
                    color={v.glow}
                    className="absolute -right-2 top-2 h-28 w-40 opacity-80"
                  />
                  <ThemeMotifArt
                    motif={v.motif}
                    color={v.particle}
                    className="absolute -left-6 bottom-0 h-20 w-28 opacity-40"
                  />
                </div>
                <div className="relative z-10">
                  <span className="mb-1 inline-block rounded bg-black/45 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-lime">
                    {lineModeLabel(s.lines)}
                  </span>
                  {s.featured && (
                    <span className="mb-1 ml-1 inline-block rounded bg-lime px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink">
                      Featured
                    </span>
                  )}
                  <p className="font-display text-lg font-bold leading-tight text-white drop-shadow">
                    {s.name}
                  </p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-ink/50">
                  {s.theme} · {v.label} · {s.volatility} vol
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-ink/65">{s.tagline}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
