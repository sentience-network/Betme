import { prisma } from "@/lib/prisma";

type NotificationType = "follow" | "chat" | "resolve" | "message";

/** Create a notification for a recipient. Never notifies the actor themselves. */
export async function notify(params: {
  userId: string;
  actorId?: string;
  type: NotificationType;
  body: string;
  link?: string;
}) {
  if (params.actorId && params.actorId === params.userId) return;
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      body: params.body,
      link: params.link ?? "/",
    },
  });
}

/** Notify many recipients at once (deduplicated), skipping the actor. */
export async function notifyMany(
  userIds: string[],
  params: { actorId?: string; type: NotificationType; body: string; link?: string }
) {
  const unique = Array.from(new Set(userIds)).filter(
    (id) => id !== params.actorId
  );
  if (unique.length === 0) return;
  await prisma.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      type: params.type,
      body: params.body,
      link: params.link ?? "/",
    })),
  });
}
