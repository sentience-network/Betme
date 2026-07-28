import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SLOT_CATALOG } from "@/lib/casino/catalog";
import { SlotsGame } from "@/components/SlotsGame";

export const dynamic = "force-dynamic";

export default async function CasinoSlotPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) redirect(`/login?next=/casino/slots/${id}`);

  const game = SLOT_CATALOG.find((s) => s.id === id);
  if (!game) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Link href="/casino/slots" className="text-sm font-medium text-tide hover:underline">
        ← All slots
      </Link>
      <div className="mt-6">
        <SlotsGame initialCredits={user.credits} game={game} />
      </div>
      <p className="mt-8 text-xs text-ink/40">
        Playing {game.name} on Betme credits. Social entertainment only.
      </p>
    </div>
  );
}
