import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PlinkoGame } from "@/components/PlinkoGame";

export const dynamic = "force-dynamic";

export default async function PlinkoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/casino/plinko");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Link href="/casino" className="text-sm font-medium text-tide hover:underline">
        ← Casino floor
      </Link>
      <div className="mt-6">
        <PlinkoGame initialCredits={user.credits} />
      </div>
    </div>
  );
}
