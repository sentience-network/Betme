import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CrashGame } from "@/components/CrashGame";

export const dynamic = "force-dynamic";

export default async function CrashPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/casino/crash");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Link href="/casino" className="text-sm font-medium text-tide hover:underline">
        ← Casino floor
      </Link>
      <div className="mt-6">
        <CrashGame initialCredits={user.credits} />
      </div>
    </div>
  );
}
