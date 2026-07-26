import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

// Returns the list of conversations (one entry per partner) for the current user.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const messages = await prisma.directMessage.findMany({
    where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    orderBy: { createdAt: "desc" },
    include: { sender: true, recipient: true },
  });

  const byPartner = new Map<
    string,
    { partner: (typeof messages)[number]["sender"]; lastMessage: (typeof messages)[number] }
  >();

  for (const m of messages) {
    const partner = m.senderId === userId ? m.recipient : m.sender;
    if (!byPartner.has(partner.id)) {
      byPartner.set(partner.id, { partner, lastMessage: m });
    }
  }

  return NextResponse.json({ conversations: Array.from(byPartner.values()) });
}
