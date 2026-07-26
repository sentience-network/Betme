"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { BADGES } from "@/lib/badges";

interface PersonRow {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  bio: string;
  badges: { slug: string }[];
  _count: { followers: number; following: number; predictions: number };
}

export default function PeoplePage() {
  const [users, setUsers] = useState<PersonRow[]>([]);

  useEffect(() => {
    fetch("/api/users", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">People</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {users.map((u) => (
          <li key={u.id}>
            <Link href={`/u/${u.username}`} className="card block p-4 transition hover:border-brand-600">
              <div className="flex items-center gap-3">
                <Avatar name={u.displayName} color={u.avatarColor} size={44} />
                <div>
                  <p className="font-bold">{u.displayName}</p>
                  <p className="text-sm text-slate-400">@{u.username}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {u.badges.map((b) => (
                  <span key={b.slug} className="badge-chip" title={BADGES[b.slug]?.description}>
                    {BADGES[b.slug]?.emoji} {BADGES[b.slug]?.label}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {u._count.followers} followers · {u._count.predictions} predictions
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
