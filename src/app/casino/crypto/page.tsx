import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CryptoLeverageGame } from "@/components/CryptoLeverageGame";

export const dynamic = "force-dynamic";

export default async function CryptoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/casino/crypto");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Link href="/casino" className="text-sm font-medium text-tide hover:underline">
        ← Casino floor
      </Link>
      <div className="mt-6">
        <CryptoLeverageGame initialCredits={user.credits} />
      </div>
    </div>
  );
}
