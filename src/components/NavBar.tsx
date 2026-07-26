"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { Avatar } from "@/components/Avatar";
import { NotificationBell } from "@/components/NotificationBell";

export function NavBar() {
  const { user, loading, login, logout } = useUser();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await login(username);
      setUsername("");
      toast(`Welcome, @${u.username}!`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
          <span className="text-brand-400">📈 Betme</span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          <Link href="/" className="btn-ghost">
            Markets
          </Link>
          <Link href="/leaderboard" className="btn-ghost">
            Leaderboard
          </Link>
          <Link href="/people" className="btn-ghost">
            People
          </Link>
          {user && (
            <>
              <Link href="/bets" className="btn-ghost">
                My bets
              </Link>
              <Link href="/messages" className="btn-ghost">
                Messages
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <NotificationBell />
              <Link
                href={`/u/${user.username}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-800"
                title="Your profile"
              >
                <Avatar name={user.displayName} color={user.avatarColor} size={30} />
                <span className="hidden text-sm font-semibold sm:inline">
                  {user.balance} cr
                </span>
              </Link>
              <button onClick={logout} className="btn-ghost" data-testid="logout">
                Sign out
              </button>
            </>
          ) : (
            <form onSubmit={handleLogin} className="flex items-center gap-2">
              <input
                className="input w-36"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="login-username"
              />
              <button className="btn-primary" disabled={busy} data-testid="login-submit">
                {busy ? "…" : "Enter"}
              </button>
            </form>
          )}
        </div>
      </div>
      {error && <p className="px-4 pb-2 text-sm text-red-400">{error}</p>}
    </header>
  );
}
