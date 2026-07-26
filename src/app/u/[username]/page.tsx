"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { Avatar } from "@/components/Avatar";
import { BADGES } from "@/lib/badges";

interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  bio: string;
  balance: number;
  badges: { slug: string }[];
  predictions: {
    id: string;
    title: string;
    status: string;
    outcome: string | null;
    _count: { stakes: number };
  }[];
  _count: { followers: number; following: number };
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/users/${username}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setProfile(data.user);
    setIsFollowing(data.isFollowing);
    setIsSelf(data.isSelf);
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleFollow() {
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setIsFollowing(data.following);
      await load();
    }
  }

  if (!profile) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={profile.displayName} color={profile.avatarColor} size={64} />
            <div>
              <h1 className="text-2xl font-black">{profile.displayName}</h1>
              <p className="text-slate-400">@{profile.username}</p>
              <p className="mt-1 text-sm text-slate-400">
                {profile._count.followers} followers · {profile._count.following} following
              </p>
            </div>
          </div>
          {user && !isSelf && (
            <div className="flex gap-2">
              <button
                onClick={toggleFollow}
                className={isFollowing ? "btn-ghost" : "btn-primary"}
                data-testid="follow-btn"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                onClick={() => router.push(`/messages/${profile.username}`)}
                className="btn-ghost"
                data-testid="message-btn"
              >
                Message
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h2 className="mb-2 text-sm font-bold uppercase text-slate-400">Badges</h2>
          {profile.badges.length === 0 ? (
            <p className="text-sm text-slate-500">No badges yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2" data-testid="badge-list">
              {profile.badges.map((b) => (
                <span key={b.slug} className="badge-chip" title={BADGES[b.slug]?.description}>
                  {BADGES[b.slug]?.emoji} {BADGES[b.slug]?.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">Predictions</h2>
        <ul className="space-y-2">
          {profile.predictions.length === 0 && (
            <li className="text-sm text-slate-500">No predictions yet.</li>
          )}
          {profile.predictions.map((p) => (
            <li key={p.id}>
              <Link href={`/predictions/${p.id}`} className="card block p-4 hover:border-brand-600">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.title}</span>
                  <span className="text-xs text-slate-400">
                    {p.status === "OPEN" ? "OPEN" : `RESOLVED · ${p.outcome}`}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
