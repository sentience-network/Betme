import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BlackjackTable } from "@/components/BlackjackTable";

export const dynamic = "force-dynamic";

export default async function CasinoBlackjackPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/casino/blackjack");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Link href="/casino" className="text-sm font-medium text-tide hover:underline">
        ← Casino floor
      </Link>
      <div className="mt-6">
        <BlackjackTable initialCredits={user.credits} />
      </div>
    </div>
  );
}
