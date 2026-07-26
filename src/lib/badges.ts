// Client-safe badge definitions (no server/Prisma imports here so this can be
// imported from React client components). Server-side awarding logic lives in
// badges.server.ts.

export interface BadgeDef {
  slug: string;
  label: string;
  emoji: string;
  description: string;
}

export const BADGES: Record<string, BadgeDef> = {
  first_prediction: {
    slug: "first_prediction",
    label: "Pioneer",
    emoji: "🔮",
    description: "Posted your first prediction.",
  },
  first_stake: {
    slug: "first_stake",
    label: "Player",
    emoji: "🎯",
    description: "Placed your first stake on a prediction.",
  },
  sharpshooter: {
    slug: "sharpshooter",
    label: "Sharpshooter",
    emoji: "🏹",
    description: "Won a resolved prediction with an accurate call.",
  },
  popular: {
    slug: "popular",
    label: "Popular",
    emoji: "🌟",
    description: "Attracted 3 or more followers.",
  },
  conversationalist: {
    slug: "conversationalist",
    label: "Conversationalist",
    emoji: "💬",
    description: "Sent your first message.",
  },
};

export type BadgeSlug = keyof typeof BADGES;
