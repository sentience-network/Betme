import { PrismaClient } from "@prisma/client";
import { computePayouts, type Side } from "../src/lib/payout";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (dev only).
  await prisma.userBadge.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.directMessage.deleteMany();
  await prisma.stake.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.user.deleteMany();

  const nova = await prisma.user.create({
    data: { username: "nova", displayName: "Nova Sharp", avatarColor: "#ec4899", bio: "Crypto degen with a crystal ball." },
  });
  const kai = await prisma.user.create({
    data: { username: "kai", displayName: "Kai Rivers", avatarColor: "#10b981", bio: "Sports & politics." },
  });
  const zoe = await prisma.user.create({
    data: { username: "zoe", displayName: "Zoe Park", avatarColor: "#f59e0b", bio: "Tech watcher." },
  });

  const p1 = await prisma.prediction.create({
    data: {
      title: "Will Bitcoin close above $150k by end of 2026?",
      description: "Spot BTC/USD on Dec 31, 2026.",
      category: "Crypto",
      creatorId: nova.id,
    },
  });
  const p2 = await prisma.prediction.create({
    data: {
      title: "Will an AI model win a Fields-Medal-level proof in 2026?",
      description: "A novel theorem accepted by a top journal.",
      category: "Tech",
      creatorId: zoe.id,
    },
  });

  // Stakes on the open market.
  await prisma.stake.createMany({
    data: [
      { predictionId: p1.id, userId: kai.id, side: "YES", amount: 120 },
      { predictionId: p1.id, userId: zoe.id, side: "NO", amount: 80 },
      { predictionId: p1.id, userId: nova.id, side: "YES", amount: 200 },
    ],
  });

  // A resolved market to show payouts + accuracy badges.
  const resolved = await prisma.prediction.create({
    data: {
      title: "Did the home team win the season opener?",
      category: "Sports",
      status: "RESOLVED",
      outcome: "YES",
      creatorId: kai.id,
    },
  });
  const rStakes = await Promise.all([
    prisma.stake.create({ data: { predictionId: resolved.id, userId: nova.id, side: "YES", amount: 100 } }),
    prisma.stake.create({ data: { predictionId: resolved.id, userId: zoe.id, side: "NO", amount: 100 } }),
  ]);
  const payouts = computePayouts(
    rStakes.map((s) => ({ id: s.id, userId: s.userId, side: s.side as Side, amount: s.amount })),
    "YES"
  );
  for (const p of payouts) {
    await prisma.stake.update({ where: { id: p.stakeId }, data: { payout: p.payout } });
    if (p.payout > 0) {
      await prisma.user.update({ where: { id: p.userId }, data: { balance: { increment: p.payout } } });
    }
  }

  // Chat on p1.
  await prisma.chatMessage.createMany({
    data: [
      { predictionId: p1.id, authorId: kai.id, body: "ETF inflows make YES look strong." },
      { predictionId: p1.id, authorId: zoe.id, body: "Macro headwinds though — I'm on NO." },
    ],
  });

  // Follows.
  await prisma.follow.createMany({
    data: [
      { followerId: kai.id, followingId: nova.id },
      { followerId: zoe.id, followingId: nova.id },
    ],
  });

  // Badges.
  await prisma.userBadge.createMany({
    data: [
      { userId: nova.id, slug: "first_prediction" },
      { userId: nova.id, slug: "first_stake" },
      { userId: nova.id, slug: "sharpshooter" },
      { userId: zoe.id, slug: "first_prediction" },
      { userId: kai.id, slug: "first_stake" },
    ],
  });

  // A direct message with a video message (uses the committed sample clip).
  await prisma.directMessage.create({
    data: { senderId: nova.id, recipientId: kai.id, body: "Welcome to Betme! Check this out 👇" },
  });
  await prisma.directMessage.create({
    data: { senderId: nova.id, recipientId: kai.id, videoUrl: "/samples/welcome.mp4" },
  });

  console.log("Seeded users:", [nova, kai, zoe].map((u) => u.username).join(", "));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
