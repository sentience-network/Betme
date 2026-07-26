import { prisma } from "@/lib/prisma";
import { BADGES, type BadgeSlug } from "@/lib/badges";

/** Idempotently award a badge to a user. Returns true if newly awarded. */
export async function awardBadge(userId: string, slug: BadgeSlug) {
  if (!BADGES[slug]) return false;
  const existing = await prisma.userBadge.findUnique({
    where: { userId_slug: { userId, slug } },
  });
  if (existing) return false;
  await prisma.userBadge.create({ data: { userId, slug } });
  return true;
}

/** Re-evaluate follower-count based badges for a user. */
export async function evaluatePopularBadge(userId: string) {
  const followers = await prisma.follow.count({ where: { followingId: userId } });
  if (followers >= 3) {
    await awardBadge(userId, "popular");
  }
}
