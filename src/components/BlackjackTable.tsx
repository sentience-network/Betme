"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASINO } from "@/lib/constants";

type ApiCard = { rank: string; suit: string };

type HandResponse = {
  sessionId: string;
  stake: number;
  payout: number;
  credits: number;
  player: ApiCard[];
  dealer: ApiCard[];
  dealerHidden: boolean;
  status: string;
  outcome?: string;
  message?: string;
  playerValue?: number;
  dealerValue?: number;
  error?: string;
};

function CardFace({ card, delay = 0 }: { card: ApiCard; delay?: number }) {
  if (card.rank === "?") {
    return (
      <div
        className="card-deal-in flex h-24 w-16 items-center justify-center rounded-xl border border-lime/30 bg-gradient-to-br from-ink to-ink-soft text-lime shadow-lg md:h-28 md:w-20"
        style={{ animationDelay: `${delay}ms` }}
      >
        <span className="font-display text-xl">?</span>
      </div>
    );
  }
  const red = card.suit === "H" || card.suit === "D";
  const suit = { S: "♠", H: "♥", D: "♦", C: "♣" }[card.suit] || card.suit;
  return (
    <div
      className={`card-deal-in flex h-24 w-16 flex-col justify-between rounded-xl border border-white/80 bg-gradient-to-br from-white to-foam p-2 shadow-md md:h-28 md:w-20 ${
        red ? "text-ember" : "text-ink"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="font-display text-sm font-bold leading-none">{card.rank}</span>
      <span className="self-center text-2xl leading-none">{suit}</span>
      <span className="self-end font-display text-sm font-bold leading-none">{card.rank}</span>
    </div>
  );
}

export function BlackjackTable({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const [stake, setStake] = useState<number>(CASINO.defaultStake);
  const [credits, setCredits] = useState(initialCredits);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hand, setHand] = useState<HandResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inHand = hand?.status === "player_turn";

  async function call(body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/casino/blackjack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as HandResponse;
      if (!res.ok) throw new Error(data.error || "Action failed");
      setHand(data);
      setSessionId(data.sessionId);
      setCredits(data.credits);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tide">Cards</p>
          <h1 className="font-display text-4xl font-extrabold text-ink md:text-5xl">Blackjack</h1>
          <p className="mt-2 max-w-md text-sm text-ink/60">
            Hit 21 without busting. Blackjack pays 2.5×, wins 2×, push returns stake. Social credits
            only.
          </p>
        </div>
        <div className="rounded-xl bg-ink px-4 py-3 text-right text-lime">
          <p className="text-[0.65rem] uppercase tracking-widest text-lime/70">Balance</p>
          <p className="font-display text-2xl font-bold">{credits} cr</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-2 border-[#c9a227]/40 bg-gradient-to-b from-[#0d5c45] via-[#0a4a38] to-[#062e24] p-6 shadow-[inset_0_0_60px_rgba(0,0,0,0.35)] md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="slot-rays absolute inset-0" style={{ ["--slot-glow" as string]: "#c8f560" }} />
        </div>
        <div className="relative space-y-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-lime/70">
              Dealer {hand?.dealerValue != null ? `· ${hand.dealerValue}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {(hand?.dealer || [{ rank: "?", suit: "?" }, { rank: "?", suit: "?" }]).map((c, i) => (
                <CardFace key={`d-${i}-${c.rank}-${c.suit}`} card={c} delay={i * 80} />
              ))}
            </div>
          </div>
          <div className="mx-auto h-px max-w-xs bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-lime/70">
              You {hand?.playerValue != null ? `· ${hand.playerValue}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {(hand?.player || []).map((c, i) => (
                <CardFace key={`p-${i}-${c.rank}-${c.suit}`} card={c} delay={i * 90} />
              ))}
              {!hand && <p className="text-sm text-lime/50">Deal a hand to start.</p>}
            </div>
          </div>
        </div>
      </div>

      {!inHand && (
        <div className="flex flex-wrap gap-2">
          {CASINO.stakes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStake(s)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                stake === s ? "bg-ink text-lime" : "bg-mist text-ink hover:bg-mist/80"
              }`}
            >
              {s} cr
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!inHand ? (
          <button
            type="button"
            disabled={loading || credits < stake}
            onClick={() => call({ action: "deal", stake })}
            className="rounded-xl bg-lime px-6 py-3 font-display text-lg font-bold text-ink transition hover:bg-lime-deep disabled:opacity-50"
          >
            {loading ? "Dealing…" : `Deal · ${stake} cr`}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={() => call({ action: "hit", sessionId })}
              className="rounded-xl bg-ink px-5 py-3 font-semibold text-lime disabled:opacity-50"
            >
              Hit
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => call({ action: "stand", sessionId })}
              className="rounded-xl border border-ink px-5 py-3 font-semibold text-ink disabled:opacity-50"
            >
              Stand
            </button>
          </>
        )}
      </div>

      {hand?.message && (
        <p className="font-display text-xl font-bold text-ink">
          {hand.message}
          {hand.status === "settled" && hand.payout > 0 ? ` · +${hand.payout} cr` : ""}
        </p>
      )}
      {error && <p className="text-sm text-ember">{error}</p>}
    </div>
  );
}
