import { prisma } from "@/lib/prisma";

// Revenue (in cents) attributed to a single ad impression on a prediction.
// In production this would be reconciled against the ad network's reported
// earnings; here we accrue a fixed micro-amount per served impression.
export const REVENUE_PER_IMPRESSION_CENTS = 2;

// Share of each impression's revenue that goes to the prediction's creator.
// The remainder is split among participants, weighted by stake — and, once a
// market is resolved, weighted toward the accurate (winning) side so that
// "accurate predictors earn more" of the ad share.
const CREATOR_SHARE = 0.4;

/**
 * Distribute the revenue from one ad impression on a prediction between the
 * creator and the participants, recording AdEarning rows and incrementing each
 * user's running ad-earnings total.
 */
export async function accrueImpressionRevenue(predictionId: string) {
  const prediction = await prisma.prediction.findUnique({
    where: { id: predictionId },
    include: { stakes: true },
  });
  if (!prediction) return { distributed: 0 };

  const total = REVENUE_PER_IMPRESSION_CENTS;
  const creatorCut = Math.round(total * CREATOR_SHARE);
  const participantPool = total - creatorCut;

  // Weight participants by stake; on resolved markets only the winning side
  // shares the participant pool (accuracy is rewarded).
  const eligible =
    prediction.status === "RESOLVED" && prediction.outcome
      ? prediction.stakes.filter((s) => s.side === prediction.outcome)
      : prediction.stakes;
  const weightTotal = eligible.reduce((sum, s) => sum + s.amount, 0);

  const accruals = new Map<string, number>();
  const add = (userId: string, cents: number) => {
    if (cents <= 0) return;
    accruals.set(userId, (accruals.get(userId) ?? 0) + cents);
  };

  add(prediction.creatorId, creatorCut);
  if (weightTotal > 0) {
    for (const s of eligible) {
      add(s.userId, Math.round((s.amount / weightTotal) * participantPool));
    }
  } else {
    // No participants yet — creator keeps the whole impression.
    add(prediction.creatorId, participantPool);
  }

  let distributed = 0;
  for (const [userId, cents] of accruals) {
    if (cents <= 0) continue;
    distributed += cents;
    await prisma.$transaction([
      prisma.adEarning.create({
        data: { userId, amountCents: cents, reason: "ad_impression", predictionId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { adEarningsCents: { increment: cents } },
      }),
    ]);
  }

  return { distributed };
}
