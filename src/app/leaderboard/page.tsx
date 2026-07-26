"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";

interface Row {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  netEarnings: number;
  winRate: number;
  resolvedCount: number;
  adEarningsCents: number;
  followers: number;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setRows(d.leaderboard || []));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">Leaderboard</h1>
        <p className="text-sm text-slate-400">Ranked by Net earnings across resolved markets.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Predictor</th>
              <th className="px-4 py-3 text-right">Net earnings</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Win rate</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Ad earnings</th>
            </tr>
          </thead>
          <tbody data-testid="leaderboard-rows">
            {rows.map((r, i) => (
              <tr key={r.id} className="border-t border-slate-800 hover:bg-slate-800/40">
                <td className="px-4 py-3 font-bold text-slate-400">{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/u/${r.username}`} className="flex items-center gap-2 hover:underline">
                    <Avatar name={r.displayName} color={r.avatarColor} size={26} />
                    <span>
                      <span className="font-semibold">{r.displayName}</span>{" "}
                      <span className="text-slate-500">@{r.username}</span>
                    </span>
                  </Link>
                </td>
                <td
                  className={
                    "px-4 py-3 text-right font-bold " +
                    (r.netEarnings > 0
                      ? "text-emerald-400"
                      : r.netEarnings < 0
                        ? "text-rose-400"
                        : "text-slate-300")
                  }
                >
                  {r.netEarnings > 0 ? "+" : ""}
                  {r.netEarnings}
                </td>
                <td className="hidden px-4 py-3 text-right text-slate-300 sm:table-cell">
                  {r.resolvedCount > 0 ? `${r.winRate}%` : "—"}
                </td>
                <td className="hidden px-4 py-3 text-right text-slate-300 sm:table-cell">
                  ${(r.adEarningsCents / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
