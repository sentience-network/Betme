"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/components/UserContext";
import { useToast } from "@/components/Toast";
import { Avatar } from "@/components/Avatar";
import { AdSlot } from "@/components/AdSlot";
import { timeLeft, isClosed } from "@/lib/time";

interface Detail {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  outcome: string | null;
  closesAt: string | null;
  yesProbability: number;
  pool: number;
  creator: { id: string; username: string; displayName: string; avatarColor: string };
  stakes: {
    id: string;
    side: string;
    amount: number;
    payout: number | null;
    user: { username: string; displayName: string; avatarColor: string };
  }[];
}

interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  author: { username: string; displayName: string; avatarColor: string };
}

export default function PredictionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, refresh } = useUser();
  const { toast } = useToast();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState(50);
  const [chatBody, setChatBody] = useState("");

  const load = useCallback(async () => {
    const [d, c] = await Promise.all([
      fetch(`/api/predictions/${id}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/predictions/${id}/chat`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    setDetail(d.prediction);
    setMessages(c.messages);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const closed = detail ? detail.status !== "OPEN" || isClosed(detail.closesAt) : false;

  async function placeStake(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/predictions/${id}/stakes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ side, amount }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error || "Failed to place stake", "error");
      return;
    }
    toast(`Staked ${amount} on ${side}`, "success");
    await Promise.all([load(), refresh()]);
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatBody.trim()) return;
    const res = await fetch(`/api/predictions/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: chatBody }),
    });
    if (res.ok) {
      setChatBody("");
      await load();
    } else {
      toast("Failed to send message", "error");
    }
  }

  async function resolve(outcome: "YES" | "NO") {
    const res = await fetch(`/api/predictions/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome }),
    });
    if (res.ok) {
      toast(`Market resolved: ${outcome}`, "success");
      await Promise.all([load(), refresh()]);
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Failed to resolve", "error");
    }
  }

  async function remove() {
    if (!confirm("Delete this prediction? Open stakes will be refunded.")) return;
    const res = await fetch(`/api/predictions/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Prediction deleted", "success");
      router.push("/");
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Failed to delete", "error");
    }
  }

  if (!detail) return <p className="text-slate-400">Loading…</p>;

  const isCreator = user?.id === detail.creator.id;
  const maxStake = user?.balance ?? 0;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <Link href="/" className="text-sm text-brand-400 hover:underline">
          ← Back to markets
        </Link>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="badge-chip">{detail.category}</span>
            {detail.closesAt && detail.status === "OPEN" && (
              <span className="text-xs font-semibold text-amber-400">{timeLeft(detail.closesAt)}</span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-black">{detail.title}</h1>
          {detail.description && <p className="mt-2 text-slate-300">{detail.description}</p>}

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-semibold text-emerald-400">YES {detail.yesProbability}%</span>
              <span className="font-semibold text-rose-400">NO {100 - detail.yesProbability}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-rose-500/40">
              <div className="h-full bg-emerald-500" style={{ width: `${detail.yesProbability}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-400">Total pool: 💰 {detail.pool} credits</p>
          </div>

          {detail.status === "RESOLVED" && (
            <p className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-sm">
              Resolved: <span className="font-bold">{detail.outcome}</span>
            </p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-lg font-bold">💬 Prediction chat</h2>
          <ul className="mb-3 max-h-72 space-y-3 overflow-y-auto" data-testid="chat-list">
            {messages.length === 0 && (
              <li className="text-sm text-slate-500">No messages yet. Start the discussion!</li>
            )}
            {messages.map((m) => (
              <li key={m.id} className="flex gap-2">
                <Avatar name={m.author.displayName} color={m.author.avatarColor} size={28} />
                <div>
                  <p className="text-xs text-slate-400">@{m.author.username}</p>
                  <p className="text-sm text-slate-100">{m.body}</p>
                </div>
              </li>
            ))}
          </ul>
          {user ? (
            <form onSubmit={sendChat} className="flex gap-2">
              <input
                className="input"
                placeholder="Share your take…"
                value={chatBody}
                onChange={(e) => setChatBody(e.target.value)}
                data-testid="chat-input"
              />
              <button className="btn-primary" data-testid="chat-send">Send</button>
            </form>
          ) : (
            <p className="text-sm text-slate-400">Sign in to join the chat.</p>
          )}
        </div>

        <AdSlot predictionId={detail.id} />
      </section>

      <aside className="space-y-4">
        <div className="card sticky top-20 space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Place your stake</h2>
            {user && <span className="text-xs text-slate-400">Balance: {user.balance} cr</span>}
          </div>
          {closed ? (
            <p className="text-sm text-slate-400">This market is closed for staking.</p>
          ) : user ? (
            <form onSubmit={placeStake} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setSide("YES")} className={side === "YES" ? "btn bg-emerald-600 text-white" : "btn-ghost"} data-testid="side-yes">
                  YES
                </button>
                <button type="button" onClick={() => setSide("NO")} className={side === "NO" ? "btn bg-rose-600 text-white" : "btn-ghost"} data-testid="side-no">
                  NO
                </button>
              </div>
              <input
                type="number"
                min={1}
                max={maxStake}
                className="input"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Math.min(maxStake, Number(e.target.value))))}
                data-testid="stake-amount"
              />
              <div className="flex gap-2">
                {[10, 50, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="btn-ghost flex-1 py-1 text-xs"
                    onClick={() => setAmount(Math.min(maxStake, v))}
                  >
                    +{v}
                  </button>
                ))}
                <button type="button" className="btn-ghost flex-1 py-1 text-xs" onClick={() => setAmount(maxStake)} data-testid="stake-max">
                  Max
                </button>
              </div>
              <button className="btn-primary w-full" disabled={amount < 1 || amount > maxStake} data-testid="stake-submit">
                {amount > maxStake ? "Insufficient balance" : `Stake ${amount} on ${side}`}
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-400">Sign in to stake.</p>
          )}

          {isCreator && detail.status === "OPEN" && (
            <div className="border-t border-slate-800 pt-3">
              <p className="mb-2 text-sm font-semibold">Resolve this market</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => resolve("YES")} className="btn bg-emerald-600 text-white" data-testid="resolve-yes">
                  YES won
                </button>
                <button onClick={() => resolve("NO")} className="btn bg-rose-600 text-white">
                  NO won
                </button>
              </div>
            </div>
          )}

          {isCreator && (
            <button onClick={remove} className="btn-ghost w-full border-rose-800 text-rose-300 hover:bg-rose-950" data-testid="delete-prediction">
              Delete prediction
            </button>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-2 text-sm font-bold uppercase text-slate-400">Participants</h3>
          <ul className="space-y-2" data-testid="stake-list">
            {detail.stakes.length === 0 && <li className="text-sm text-slate-500">No stakes yet.</li>}
            {detail.stakes.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Avatar name={s.user.displayName} color={s.user.avatarColor} size={22} />
                  @{s.user.username}
                </span>
                <span className={s.side === "YES" ? "text-emerald-400" : "text-rose-400"}>
                  {s.side} {s.amount}
                  {s.payout != null && <span className="ml-1 text-slate-400">→ {s.payout}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
