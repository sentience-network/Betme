import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      badges: true,
      _count: { select: { followers: true, following: true, predictions: true } },
    },
  });
  return NextResponse.json({ users });
}
