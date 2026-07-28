"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SlotCatalogItem } from "@/lib/casino/catalog";
import { lineModeLabel, type LineMode } from "@/lib/casino/lines";

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
        {filtered.map((s) => (
          <Link
            key={s.id}
            href={`/casino/slots/${s.id}`}
            className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white/60 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div
              className="flex h-28 items-end p-4"
              style={{
                background: `linear-gradient(145deg, #071a14 0%, ${s.accent} 120%)`,
              }}
            >
              <div>
                <span className="mb-1 inline-block rounded bg-black/40 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-lime">
                  {lineModeLabel(s.lines)}
                </span>
                {s.featured && (
                  <span className="mb-1 ml-1 inline-block rounded bg-lime px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink">
                    Featured
                  </span>
                )}
                <p className="font-display text-lg font-bold leading-tight text-lime">{s.name}</p>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-ink/50">
                {s.theme} · {s.volatility} vol
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-ink/65">{s.tagline}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
