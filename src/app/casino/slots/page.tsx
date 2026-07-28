import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SLOT_CATALOG, CASINO_COUNTS } from "@/lib/casino/catalog";
import { SlotLobbyGrid } from "@/components/SlotLobbyGrid";

export const dynamic = "force-dynamic";

export default async function CasinoSlotsLobbyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/casino/slots");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <Link href="/casino" className="text-sm font-medium text-tide hover:underline">
        ← Casino floor
      </Link>
      <h1 className="mt-4 font-display text-4xl font-extrabold text-ink md:text-5xl">
        {CASINO_COUNTS.slots} slots
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Zeus, Athena, Medusa, Gone Fishing, Five Lions, and the full Betme social catalog — all
        stake Betme credits.
      </p>
      <div className="mt-8">
        <SlotLobbyGrid slots={SLOT_CATALOG} />
      </div>
    </div>
  );
}
