import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CREDIT_POLICY } from "@/lib/credits";
import {
  CASINO_COUNTS,
  getFeaturedSlots,
  INSTANT_GAMES,
  LIVE_DEALER_CATALOG,
  TABLE_CATALOG,
} from "@/lib/casino/catalog";

export const dynamic = "force-dynamic";

export default async function CasinoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/casino");

  const featured = getFeaturedSlots().slice(0, 10);
  const recentWins = await prisma.casinoGameSession.findMany({
    where: { status: "SETTLED", payout: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { user: { select: { username: true, displayName: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tide">Social casino</p>
        <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
          Betme Casino
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/65">
          {CASINO_COUNTS.slots} themed slots across{" "}
          <strong className="text-ink">15 / 20 / 100 lines</strong> and{" "}
          <strong className="text-ink">500 ways</strong> — Zeus, Athena, Medusa, Gone Fishing, Five
          Lions & more — plus tables, Plinko, Crash, and fake leverage crypto. All on{" "}
          <strong className="text-ink">Betme credits</strong>.
        </p>
        <p className="mt-2 text-sm text-ink/45">{CREDIT_POLICY}</p>
        <p className="mt-1 text-xs text-ink/40">
          Social entertainment titles inspired by popular themes — not licensed third-party casino
          software.
        </p>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-ink">Featured slots</h2>
          <Link href="/casino/slots" className="text-sm font-semibold text-tide hover:underline">
            Browse all {CASINO_COUNTS.slots} →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {featured.map((s) => (
            <Link
              key={s.id}
              href={`/casino/slots/${s.id}`}
              className="overflow-hidden rounded-2xl border border-[var(--line)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="flex h-24 items-end p-3"
                style={{ background: `linear-gradient(145deg,#071a14,${s.accent})` }}
              >
                <p className="font-display text-base font-bold leading-tight text-lime">{s.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Instant games</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {INSTANT_GAMES.map((g) => (
            <Link
              key={g.id}
              href={g.href}
              className="rounded-2xl border border-[var(--line)] bg-white/65 p-5 transition hover:shadow-md"
            >
              <span
                className="rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-white"
                style={{ background: g.accent }}
              >
                {g.badge}
              </span>
              <h3 className="mt-2 font-display text-xl font-bold text-ink">{g.name}</h3>
              <p className="mt-1 text-sm text-ink/55">{g.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Table games</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TABLE_CATALOG.map((t) =>
            t.availability === "live" && t.href ? (
              <Link
                key={t.id}
                href={t.href}
                className="rounded-xl border border-[var(--line)] bg-white/60 p-4 hover:border-tide/40"
              >
                <p className="font-semibold text-ink">{t.name}</p>
                <p className="mt-1 text-xs text-ink/50">{t.tagline}</p>
              </Link>
            ) : (
              <div
                key={t.id}
                className="rounded-xl border border-dashed border-[var(--line)] bg-mist/40 p-4 opacity-80"
              >
                <p className="font-semibold text-ink/70">{t.name}</p>
                <p className="mt-1 text-xs text-ink/45">Coming soon</p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Live dealer</h2>
        <p className="mt-1 text-sm text-ink/55">HD studios with Betme credit seats — coming soon.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LIVE_DEALER_CATALOG.map((l) => (
            <div
              key={l.id}
              className="relative overflow-hidden rounded-xl border border-[var(--line)] p-4"
              style={{ background: `linear-gradient(135deg, #071a1488, ${l.accent}44)` }}
            >
              <span className="absolute right-3 top-3 rounded bg-white/90 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-ink">
                Soon
              </span>
              <p className="pr-12 font-semibold text-ink">{l.name}</p>
              <p className="mt-1 text-xs text-ink/55">{l.studio}</p>
              <p className="mt-2 text-xs text-ink/45">{l.tagline}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-ink">Floor chatter</h2>
        <ul className="mt-4 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white/50">
          {recentWins.length === 0 && (
            <li className="px-5 py-6 text-sm text-ink/50">No wins yet — spin Zeus or drop Plinko.</li>
          )}
          {recentWins.map((w) => {
            let title = w.gameType;
            try {
              const r = w.resultJson ? JSON.parse(w.resultJson) : {};
              if (r.gameName) title = r.gameName;
            } catch {
              /* ignore */
            }
            return (
              <li key={w.id} className="flex justify-between gap-3 px-5 py-3">
                <div>
                  <Link href={`/u/${w.user.username}`} className="font-semibold hover:text-tide">
                    {w.user.displayName}
                  </Link>
                  <p className="text-xs text-ink/45">{title}</p>
                </div>
                <p className="font-display font-bold text-tide">+{w.payout} cr</p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
