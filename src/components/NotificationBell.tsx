"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserContext";

interface Notification {
  id: string;
  type: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { user } = useUser();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const res = await fetch("/api/notifications", { cache: "no-store" });
    const data = await res.json();
    setItems(data.notifications || []);
    setUnread(data.unread || 0);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [user, load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await fetch("/api/notifications", { method: "POST" });
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="btn-ghost relative"
        aria-label="Notifications"
        data-testid="notif-bell"
      >
        🔔
        {unread > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white"
            data-testid="notif-badge"
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 px-4 py-2 text-sm font-semibold">Notifications</div>
          <ul className="max-h-96 overflow-y-auto" data-testid="notif-list">
            {items.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-500">You&apos;re all caught up.</li>
            )}
            {items.map((n) => (
              <li key={n.id} className="border-b border-slate-800 last:border-0">
                <Link
                  href={n.link}
                  onClick={() => setOpen(false)}
                  className={
                    "block px-4 py-3 text-sm hover:bg-slate-800 " +
                    (n.read ? "text-slate-400" : "text-slate-100")
                  }
                >
                  {n.body}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
