"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserContext";

interface Bet {
  id: string;
  side: string;
  amount: number;
  payout: number | null;
  prediction: { id: string; title: string; status: string; outcome: string | null };
}

interface Stats {
  netEarnings: number;
  totalStaked: number;
  resolvedCount: number;
  wins: number;
  winRate: number;
}

export default function BetsPage() {
  const { user, loading } = useUser();
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/me/bets", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setBets(d.stakes || []);
        setStats(d.stats || null);
      });
  }, [user]);

  if (loading) return null;
  if (!user) return <p className="text-slate-400">Sign in to view your bets.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">My bets</h1>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card p-4">
            <p className="text-xs uppercase text-slate-400">Net earnings</p>
            <p
              className={
                "text-xl font-black " +
                (stats.netEarnings > 0
                  ? "text-emerald-400"
                  : stats.netEarnings < 0
                    ? "text-rose-400"
                    : "text-slate-200")
              }
              data-testid="stats-net-earnings"
            >
              {stats.netEarnings > 0 ? "+" : ""}
              {stats.netEarnings}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase text-slate-400">Win rate</p>
            <p className="text-xl font-black">{stats.resolvedCount > 0 ? `${stats.winRate}%` : "—"}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase text-slate-400">Total staked</p>
            <p className="text-xl font-black">{stats.totalStaked}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase text-slate-400">Resolved</p>
            <p className="text-xl font-black">{stats.resolvedCount}</p>
          </div>
        </div>
      )}

      <ul className="space-y-2" data-testid="bets-list">
        {bets.length === 0 && <li className="text-sm text-slate-500">No bets yet.</li>}
        {bets.map((b) => {
          const net = b.payout != null ? b.payout - b.amount : null;
          return (
            <li key={b.id}>
              <Link href={`/predictions/${b.prediction.id}`} className="card flex items-center justify-between p-4 hover:border-brand-600">
                <div>
                  <p className="font-semibold">{b.prediction.title}</p>
                  <p className="text-xs text-slate-400">
                    <span className={b.side === "YES" ? "text-emerald-400" : "text-rose-400"}>{b.side}</span>{" "}
                    · staked {b.amount}
                    {b.prediction.status === "RESOLVED" && ` · resolved ${b.prediction.outcome}`}
                  </p>
                </div>
                <div className="text-right">
                  {net == null ? (
                    <span className="text-xs text-amber-400">Pending</span>
                  ) : (
                    <span className={net >= 0 ? "font-bold text-emerald-400" : "font-bold text-rose-400"}>
                      {net >= 0 ? "+" : ""}
                      {net}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
