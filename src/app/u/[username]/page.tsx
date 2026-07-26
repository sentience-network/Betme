"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { Avatar } from "@/components/Avatar";
import { BADGES } from "@/lib/badges";

interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  bio: string;
  balance: number;
  adEarningsCents: number;
  badges: { slug: string }[];
  predictions: { id: string; title: string; status: string; outcome: string | null }[];
  _count: { followers: number; following: number };
}

interface Stats {
  netEarnings: number;
  totalStaked: number;
  resolvedCount: number;
  winRate: number;
}

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, refresh } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: "", bio: "", avatarColor: "#6366f1" });

  const load = useCallback(async () => {
    const res = await fetch(`/api/users/${username}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setProfile(data.user);
    setStats(data.stats);
    setIsFollowing(data.isFollowing);
    setIsSelf(data.isSelf);
    setForm({
      displayName: data.user.displayName,
      bio: data.user.bio,
      avatarColor: data.user.avatarColor,
    });
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleFollow() {
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setIsFollowing(data.following);
      toast(data.following ? "Followed" : "Unfollowed", "success");
      await load();
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/users/${username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setEditing(false);
      toast("Profile updated", "success");
      await Promise.all([load(), refresh()]);
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Failed to update", "error");
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
              {profile.bio && <p className="mt-1 max-w-md text-sm text-slate-300">{profile.bio}</p>}
              <p className="mt-1 text-sm text-slate-400">
                {profile._count.followers} followers · {profile._count.following} following
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isSelf ? (
              <button onClick={() => setEditing((s) => !s)} className="btn-ghost" data-testid="edit-profile">
                {editing ? "Cancel" : "Edit profile"}
              </button>
            ) : user ? (
              <>
                <button onClick={toggleFollow} className={isFollowing ? "btn-ghost" : "btn-primary"} data-testid="follow-btn">
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button onClick={() => router.push(`/messages/${profile.username}`)} className="btn-ghost" data-testid="message-btn">
                  Message
                </button>
              </>
            ) : null}
          </div>
        </div>

        {editing && (
          <form onSubmit={saveProfile} className="mt-4 space-y-3 border-t border-slate-800 pt-4" data-testid="edit-form">
            <input
              className="input"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Display name"
              data-testid="edit-displayname"
            />
            <textarea
              className="input min-h-16"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
              data-testid="edit-bio"
            />
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, avatarColor: c })}
                  className={"h-7 w-7 rounded-full " + (form.avatarColor === c ? "ring-2 ring-white" : "")}
                  style={{ backgroundColor: c }}
                  aria-label={`color ${c}`}
                />
              ))}
            </div>
            <button className="btn-primary" data-testid="edit-save">Save</button>
          </form>
        )}

        {stats && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-slate-400">Net earnings</p>
              <p
                className={
                  "text-lg font-black " +
                  (stats.netEarnings > 0 ? "text-emerald-400" : stats.netEarnings < 0 ? "text-rose-400" : "text-slate-200")
                }
                data-testid="profile-net-earnings"
              >
                {stats.netEarnings > 0 ? "+" : ""}
                {stats.netEarnings}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Win rate</p>
              <p className="text-lg font-black">{stats.resolvedCount > 0 ? `${stats.winRate}%` : "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Total staked</p>
              <p className="text-lg font-black">{stats.totalStaked}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Ad earnings</p>
              <p className="text-lg font-black text-brand-300">${(profile.adEarningsCents / 100).toFixed(2)}</p>
            </div>
          </div>
        )}

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
          {profile.predictions.length === 0 && <li className="text-sm text-slate-500">No predictions yet.</li>}
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
