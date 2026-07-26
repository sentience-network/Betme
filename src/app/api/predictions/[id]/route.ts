import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { impliedYesProbability, type Side } from "@/lib/payout";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prediction = await prisma.prediction.findUnique({
    where: { id },
    include: {
      creator: true,
      stakes: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!prediction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stakeInputs = prediction.stakes.map((s) => ({
    id: s.id,
    userId: s.userId,
    side: s.side as Side,
    amount: s.amount,
  }));

  return NextResponse.json({
    prediction: {
      ...prediction,
      yesProbability: impliedYesProbability(stakeInputs),
      pool: prediction.stakes.reduce((sum, s) => sum + s.amount, 0),
    },
  });
}
