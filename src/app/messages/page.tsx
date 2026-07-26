"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { Avatar } from "@/components/Avatar";

interface Conversation {
  partner: { username: string; displayName: string; avatarColor: string };
  lastMessage: { body: string; videoUrl: string | null; createdAt: string };
}

export default function MessagesPage() {
  const { user, loading } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/messages", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []));
  }, [user]);

  if (loading) return null;
  if (!user) {
    return <p className="text-slate-400">Sign in to view your messages.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Messages</h1>
        <Link href="/people" className="btn-ghost">
          New message
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="card p-6 text-center text-slate-400">
          No conversations yet. Visit{" "}
          <Link href="/people" className="text-brand-400 hover:underline">
            People
          </Link>{" "}
          to start one.
        </div>
      ) : (
        <ul className="space-y-2" data-testid="conversation-list">
          {conversations.map((c) => (
            <li key={c.partner.username}>
              <Link
                href={`/messages/${c.partner.username}`}
                className="card flex items-center gap-3 p-4 hover:border-brand-600"
              >
                <Avatar name={c.partner.displayName} color={c.partner.avatarColor} size={40} />
                <div className="min-w-0">
                  <p className="font-semibold">{c.partner.displayName}</p>
                  <p className="truncate text-sm text-slate-400">
                    {c.lastMessage.videoUrl ? "📹 Video message" : c.lastMessage.body}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
