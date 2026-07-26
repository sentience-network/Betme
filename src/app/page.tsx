"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { Avatar } from "@/components/Avatar";
import { AdSlot } from "@/components/AdSlot";
import { timeLeft, isClosed } from "@/lib/time";

interface PredictionRow {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  outcome: string | null;
  closesAt: string | null;
  yesProbability: number;
  pool: number;
  creator: { username: string; displayName: string; avatarColor: string };
  _count: { chatMessages: number; stakes: number };
}

const CATEGORIES = ["Crypto", "Sports", "Politics", "Tech", "Culture", "General"];

export default function HomePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<PredictionRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Crypto");
  const [closesAt, setClosesAt] = useState("");
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [sort, setSort] = useState<"new" | "pool" | "closing">("new");

  const load = useCallback(async () => {
    const res = await fetch("/api/predictions", { cache: "no-store" });
    const data = await res.json();
    setPredictions(data.predictions);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    let list = predictions.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (filterCat !== "All") list = list.filter((p) => p.category === filterCat);
    if (sort === "pool") list.sort((a, b) => b.pool - a.pool);
    else if (sort === "closing") {
      list.sort((a, b) => {
        const at = a.closesAt ? new Date(a.closesAt).getTime() : Infinity;
        const bt = b.closesAt ? new Date(b.closesAt).getTime() : Infinity;
        return at - bt;
      });
    }
    return list;
  }, [predictions, query, filterCat, sort]);

  async function createPrediction(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, closesAt: closesAt || null }),
    });
    setBusy(false);
    if (res.ok) {
      setTitle("");
      setDescription("");
      setClosesAt("");
      toast("Prediction posted!", "success");
      await load();
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Failed to post prediction", "error");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-black">Prediction markets</h1>
          <p className="text-sm text-slate-400">
            Back the outcomes you believe in. Accurate predictors earn a bigger share of the pool.
          </p>
        </div>

        <div className="card flex flex-wrap items-center gap-2 p-3">
          <input
            className="input flex-1"
            placeholder="Search markets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="feed-search"
          />
          <select className="input w-auto" value={filterCat} onChange={(e) => setFilterCat(e.target.value)} data-testid="feed-category">
            <option>All</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} data-testid="feed-sort">
            <option value="new">Newest</option>
            <option value="pool">Biggest pool</option>
            <option value="closing">Closing soon</option>
          </select>
        </div>

        {visible.length === 0 && (
          <div className="card p-6 text-center text-slate-400">No markets match your filters.</div>
        )}

        <ul className="space-y-3">
          {visible.map((p, idx) => (
            <li key={p.id}>
              <Link href={`/predictions/${p.id}`} className="card block p-4 transition hover:border-brand-600">
                <div className="mb-2 flex items-center justify-between">
                  <span className="badge-chip">{p.category}</span>
                  <span
                    className={
                      p.status === "OPEN" && !isClosed(p.closesAt)
                        ? "text-xs font-semibold text-emerald-400"
                        : "text-xs font-semibold text-slate-400"
                    }
                  >
                    {p.status === "OPEN"
                      ? isClosed(p.closesAt)
                        ? "CLOSED"
                        : timeLeft(p.closesAt) ?? "OPEN"
                      : `RESOLVED · ${p.outcome}`}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{p.title}</h3>
                {p.description && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{p.description}</p>}

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span className="text-emerald-400">YES {p.yesProbability}%</span>
                    <span className="text-rose-400">NO {100 - p.yesProbability}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-rose-500/40">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.yesProbability}%` }} />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <Avatar name={p.creator.displayName} color={p.creator.avatarColor} size={22} />
                    @{p.creator.username}
                  </span>
                  <span>
                    💰 {p.pool} cr · 🎯 {p._count.stakes} · 💬 {p._count.chatMessages}
                  </span>
                </div>
              </Link>
              {idx === 1 && <div className="mt-3"><AdSlot /></div>}
            </li>
          ))}
        </ul>
      </section>

      <aside className="space-y-4">
        <div className="card sticky top-20 p-4">
          <h2 className="mb-3 text-lg font-bold">Post a prediction</h2>
          {user ? (
            <form onSubmit={createPrediction} className="space-y-3" noValidate>
              <input
                className="input"
                placeholder="Will BTC close above $150k in 2026?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="prediction-title"
              />
              <textarea
                className="input min-h-20"
                placeholder="Add context (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="prediction-description"
              />
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <label className="block text-xs text-slate-400">
                Closes at (optional)
                <input
                  type="datetime-local"
                  className="input mt-1"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  data-testid="prediction-closesat"
                />
              </label>
              <button className="btn-primary w-full" disabled={busy} data-testid="prediction-submit">
                {busy ? "Posting…" : "Post prediction"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-400">Enter a username in the top bar to start posting and staking.</p>
          )}
        </div>
        <AdSlot />
      </aside>
    </div>
  );
}
