"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { Avatar } from "@/components/Avatar";
import { VideoRecorder } from "@/components/VideoRecorder";

interface DM {
  id: string;
  body: string;
  videoUrl: string | null;
  createdAt: string;
  senderId: string;
  sender: { username: string; displayName: string; avatarColor: string };
}

interface Partner {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
}

export default function ConversationPage() {
  const { username } = useParams<{ username: string }>();
  const { user, loading } = useUser();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<DM[]>([]);
  const [body, setBody] = useState("");
  const [showRecorder, setShowRecorder] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/messages/${username}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setPartner(data.partner);
    setMessages(data.messages);
  }, [username]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function send(payload: { body?: string; videoUrl?: string }) {
    setError("");
    const res = await fetch(`/api/messages/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to send");
      return;
    }
    setBody("");
    setShowRecorder(false);
    await load();
  }

  if (loading) return null;
  if (!user) return <p className="text-slate-400">Sign in to view this conversation.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/messages" className="text-sm text-brand-400 hover:underline">
        ← All messages
      </Link>

      {partner && (
        <div className="flex items-center gap-3">
          <Avatar name={partner.displayName} color={partner.avatarColor} size={40} />
          <div>
            <p className="font-bold">{partner.displayName}</p>
            <p className="text-sm text-slate-400">@{partner.username}</p>
          </div>
        </div>
      )}

      <ul className="card min-h-64 space-y-3 p-4" data-testid="dm-list">
        {messages.length === 0 && (
          <li className="text-sm text-slate-500">No messages yet. Say hello!</li>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <li key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  mine
                    ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2"
                    : "max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-800 px-3 py-2"
                }
              >
                {m.body && <p className="text-sm">{m.body}</p>}
                {m.videoUrl && (
                  <video
                    src={m.videoUrl}
                    controls
                    className="mt-1 max-h-64 rounded-lg"
                    data-testid="dm-video"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {showRecorder && <VideoRecorder onUploaded={(url) => send({ videoUrl: url })} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) send({ body });
        }}
        className="flex gap-2"
      >
        <button
          type="button"
          onClick={() => setShowRecorder((s) => !s)}
          className="btn-ghost"
          data-testid="toggle-recorder"
          title="Video message"
        >
          📹
        </button>
        <input
          className="input"
          placeholder="Type a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          data-testid="dm-input"
        />
        <button className="btn-primary" data-testid="dm-send">
          Send
        </button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
