import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "betme_uid";

/** Returns the currently logged-in user, or null. */
export async function getCurrentUser() {
  const store = await cookies();
  const uid = store.get(SESSION_COOKIE)?.value;
  if (!uid) return null;
  return prisma.user.findUnique({
    where: { id: uid },
    include: { badges: true },
  });
}

/** Returns the current user id, or null. */
export async function getCurrentUserId() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
