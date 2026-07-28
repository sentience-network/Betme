export type CasinoAvailability = "live" | "soon";

export type SlotCatalogItem = {
  id: string;
  name: string;
  theme: string;
  provider: string;
  volatility: "low" | "medium" | "high";
  /** 15 / 20 / 100 fixed lines, or 500 ways */
  lines: 15 | 20 | 100 | 500;
  accent: string;
  tagline: string;
  availability: CasinoAvailability;
  featured?: boolean;
};

export type TableCatalogItem = {
  id: string;
  name: string;
  family: "blackjack" | "roulette" | "baccarat" | "poker" | "dice" | "other";
  seats: number;
  tagline: string;
  accent: string;
  availability: CasinoAvailability;
  href?: string;
};

export type LiveDealerItem = {
  id: string;
  name: string;
  studio: string;
  tagline: string;
  accent: string;
  availability: "soon";
};

export type InstantGameItem = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  href: string;
  badge?: string;
};

import { assignLineMode, lineModeLabel, type LineMode } from "./lines";

const ACCENTS = [
  "#1f7a63",
  "#0B3D4A",
  "#C45C26",
  "#2F5D3A",
  "#1A6B5A",
  "#5B2C6F",
  "#1F618D",
  "#922B21",
  "#117A65",
  "#6C3483",
  "#B7950B",
  "#1B4F72",
];

/** Flagship / recognizable social-slot themes (Betme credits — not licensed casino software). */
const FEATURED_SLOTS: Array<
  Omit<SlotCatalogItem, "id" | "accent" | "availability" | "provider" | "lines"> & { lines?: LineMode }
> = [
  { name: "Zeus Thunder", theme: "Mythology", volatility: "high", lines: 20, tagline: "20 lines · Olympus wilds", featured: true },
  { name: "Athena Crown", theme: "Mythology", volatility: "medium", lines: 15, tagline: "15 lines · shield scatters", featured: true },
  { name: "Medusa Gaze", theme: "Mythology", volatility: "high", lines: 100, tagline: "100 lines · stone-cold pays", featured: true },
  { name: "Gone Fishing", theme: "Fishing", volatility: "medium", lines: 20, tagline: "20 lines · hook the bass", featured: true },
  { name: "Five Lions", theme: "Fortune", volatility: "high", lines: 500, tagline: "500 ways · roaring cascades", featured: true },
  { name: "Poseidon Depths", theme: "Mythology", volatility: "high", lines: 100, tagline: "100 lines · tidal cascades", featured: true },
  { name: "Hades Underworld", theme: "Mythology", volatility: "high", lines: 500, tagline: "500 ways · dark free games", featured: true },
  { name: "Apollo Sunspin", theme: "Mythology", volatility: "medium", lines: 15, tagline: "15 lines · solar wilds", featured: true },
  { name: "Big Bass Night", theme: "Fishing", volatility: "medium", lines: 20, tagline: "20 lines · night bite", featured: true },
  { name: "Fishin' Frenzy Social", theme: "Fishing", volatility: "low", lines: 15, tagline: "15 lines · classic boat", featured: true },
  { name: "Lucky Fishing Trip", theme: "Fishing", volatility: "medium", lines: 20, tagline: "20 lines · collectors", featured: true },
  { name: "Five Tiger Gold", theme: "Fortune", volatility: "high", lines: 500, tagline: "500 ways · tiger gold", featured: true },
  { name: "Dragon's Lucky 8", theme: "Fortune", volatility: "high", lines: 100, tagline: "100 lines · fireball pays", featured: true },
  { name: "Lucky Fortune Cat", theme: "Fortune", volatility: "low", lines: 15, tagline: "15 lines · maneki wilds", featured: true },
  { name: "Sweet Candy Rush", theme: "Candy", volatility: "high", lines: 500, tagline: "500 ways · tumble candy", featured: true },
  { name: "Sugar Bomb", theme: "Candy", volatility: "high", lines: 100, tagline: "100 lines · bomb multipliers", featured: true },
  { name: "Fruit Party Social", theme: "Candy", volatility: "medium", lines: 20, tagline: "20 lines · juicy cascades", featured: true },
  { name: "Book of Ra Social", theme: "Adventure", volatility: "high", lines: 15, tagline: "15 lines · expanding symbols", featured: true },
  { name: "Legacy of Dead Social", theme: "Adventure", volatility: "high", lines: 20, tagline: "20 lines · tomb free spins", featured: true },
  { name: "Starburst Social", theme: "Classic", volatility: "low", lines: 15, tagline: "15 lines · neon wilds", featured: true },
  { name: "Gonzo Quest Social", theme: "Adventure", volatility: "medium", lines: 20, tagline: "20 lines · avalanche falls", featured: true },
  { name: "Mega Joker Social", theme: "Classic", volatility: "high", lines: 15, tagline: "15 lines · retro fruit", featured: true },
  { name: "Wolf Gold Social", theme: "Nature", volatility: "medium", lines: 20, tagline: "20 lines · moon money", featured: true },
  { name: "Buffalo King Social", theme: "Nature", volatility: "high", lines: 500, tagline: "500 ways · stampede", featured: true },
  { name: "Mustang Gold Social", theme: "Nature", volatility: "medium", lines: 100, tagline: "100 lines · trail money", featured: true },
  { name: "Great Rhino Social", theme: "Nature", volatility: "medium", lines: 20, tagline: "20 lines · savanna wilds", featured: true },
  { name: "Fire Joker Social", theme: "Classic", volatility: "medium", lines: 15, tagline: "15 lines · joker wheel", featured: true },
  { name: "Reactoonz Social", theme: "Sci-Fi", volatility: "high", lines: 500, tagline: "500 ways · cluster aliens", featured: true },
  { name: "Jammin Jars Social", theme: "Candy", volatility: "high", lines: 500, tagline: "500 ways · gravity jam", featured: true },
  { name: "Razor Shark Social", theme: "Ocean", volatility: "high", lines: 100, tagline: "100 lines · mystery stacks", featured: true },
  { name: "Money Train Social", theme: "Western", volatility: "high", lines: 500, tagline: "500 ways · bonus train", featured: true },
  { name: "Wanted Dead or Wild", theme: "Western", volatility: "high", lines: 100, tagline: "100 lines · duel multipliers", featured: true },
  { name: "Dead or Alive Social", theme: "Western", volatility: "high", lines: 20, tagline: "20 lines · sticky shootout", featured: true },
  { name: "Immortal Romance Social", theme: "Gothic", volatility: "medium", lines: 20, tagline: "20 lines · chamber spawns", featured: true },
  { name: "Thunderstruck Social", theme: "Mythology", volatility: "medium", lines: 20, tagline: "20 lines · Norse storm", featured: true },
  { name: "Age of the Gods Social", theme: "Mythology", volatility: "medium", lines: 20, tagline: "20 lines · god lanes", featured: true },
  { name: "Cleopatra Social", theme: "Adventure", volatility: "medium", lines: 20, tagline: "20 lines · Nile free games", featured: true },
  { name: "Lightning Link Social", theme: "Link", volatility: "medium", lines: 100, tagline: "100 lines · hold & spin", featured: true },
  { name: "Dragon Link Social", theme: "Link", volatility: "medium", lines: 100, tagline: "100 lines · jade holds", featured: true },
  { name: "Cash Connection Social", theme: "Link", volatility: "medium", lines: 100, tagline: "100 lines · connected jackpots", featured: true },
];

const SERIES_TEMPLATES: Array<{
  prefix: string;
  theme: string;
  volatility: SlotCatalogItem["volatility"];
  tagline: string;
}> = [
  { prefix: "Zeus", theme: "Mythology", volatility: "high", tagline: "Olympus line · Betme credits" },
  { prefix: "Athena", theme: "Mythology", volatility: "medium", tagline: "Shield spins · Betme credits" },
  { prefix: "Medusa", theme: "Mythology", volatility: "high", tagline: "Stone wilds · Betme credits" },
  { prefix: "Poseidon", theme: "Mythology", volatility: "high", tagline: "Tide pays · Betme credits" },
  { prefix: "Hades", theme: "Mythology", volatility: "high", tagline: "Underworld free games" },
  { prefix: "Apollo", theme: "Mythology", volatility: "medium", tagline: "Sunburst wilds" },
  { prefix: "Artemis", theme: "Mythology", volatility: "medium", tagline: "Moon hunt scatters" },
  { prefix: "Ares", theme: "Mythology", volatility: "high", tagline: "War drum multipliers" },
  { prefix: "Hermes", theme: "Mythology", volatility: "low", tagline: "Quick-hit reels" },
  { prefix: "Hera", theme: "Mythology", volatility: "medium", tagline: "Royal peacock wilds" },
  { prefix: "Gone Fishing", theme: "Fishing", volatility: "medium", tagline: "Boat spins · Betme credits" },
  { prefix: "Big Bass", theme: "Fishing", volatility: "medium", tagline: "Collector fish symbols" },
  { prefix: "Fishin Frenzy", theme: "Fishing", volatility: "low", tagline: "Boat & fish classics" },
  { prefix: "Cash Splash", theme: "Fishing", volatility: "medium", tagline: "Waterfall money fish" },
  { prefix: "Five Lions", theme: "Fortune", volatility: "high", tagline: "Lion dance wilds" },
  { prefix: "Five Tigers", theme: "Fortune", volatility: "high", tagline: "Tiger gold lanes" },
  { prefix: "Lucky Koi", theme: "Fortune", volatility: "low", tagline: "Pond fortune" },
  { prefix: "Golden Ox", theme: "Fortune", volatility: "medium", tagline: "New year gold" },
  { prefix: "Dragon Hatch", theme: "Fortune", volatility: "high", tagline: "Egg multipliers" },
  { prefix: "Jade Emperor", theme: "Fortune", volatility: "high", tagline: "Palace free spins" },
  { prefix: "Sweet Rush", theme: "Candy", volatility: "high", tagline: "Tumble candy pays" },
  { prefix: "Bonanza Fruit", theme: "Candy", volatility: "high", tagline: "Cluster fruit storm" },
  { prefix: "Lollipop Land", theme: "Candy", volatility: "medium", tagline: "Sticky sugar wilds" },
  { prefix: "Book of", theme: "Adventure", volatility: "high", tagline: "Expanding book symbols" },
  { prefix: "Temple of", theme: "Adventure", volatility: "medium", tagline: "Ruins free spins" },
  { prefix: "Valley of", theme: "Adventure", volatility: "medium", tagline: "Explorer wilds" },
  { prefix: "Starburst", theme: "Classic", volatility: "low", tagline: "Neon both-ways" },
  { prefix: "Fire Joker", theme: "Classic", volatility: "medium", tagline: "Joker wheel" },
  { prefix: "Twin Spin", theme: "Classic", volatility: "low", tagline: "Synced reels" },
  { prefix: "Wolf Moon", theme: "Nature", volatility: "medium", tagline: "Pack money respins" },
  { prefix: "Buffalo Stampede", theme: "Nature", volatility: "high", tagline: "Megaways feel" },
  { prefix: "Safari King", theme: "Nature", volatility: "medium", tagline: "Savanna trails" },
  { prefix: "Shark Bite", theme: "Ocean", volatility: "high", tagline: "Ocean mystery stacks" },
  { prefix: "Pirate Gold", theme: "Ocean", volatility: "medium", tagline: "Chest hold & spin" },
  { prefix: "Mermaid Pearls", theme: "Ocean", volatility: "low", tagline: "Pearl cascades" },
  { prefix: "Space Launch", theme: "Sci-Fi", volatility: "high", tagline: "Orbit cluster pays" },
  { prefix: "Cyber Neon", theme: "Sci-Fi", volatility: "medium", tagline: "Grid wilds" },
  { prefix: "Alien Cluster", theme: "Sci-Fi", volatility: "high", tagline: "Quantum tumbles" },
  { prefix: "Deadwood", theme: "Western", volatility: "high", tagline: "Duel sticky wilds" },
  { prefix: "Outlaw Cash", theme: "Western", volatility: "high", tagline: "Train bonus feel" },
  { prefix: "Vampire Night", theme: "Gothic", volatility: "medium", tagline: "Blood moon free games" },
  { prefix: "Cursed Manor", theme: "Gothic", volatility: "medium", tagline: "Haunted scatters" },
  { prefix: "Link & Spin", theme: "Link", volatility: "medium", tagline: "Hold symbols · social jackpot feel" },
  { prefix: "Fortune Link", theme: "Link", volatility: "medium", tagline: "Connected respins" },
];

const SERIES_SUFFIXES = [
  "Deluxe",
  "Megaways",
  "Hold & Win",
  "Power Reels",
  "Max Win",
  "Jackpot King",
  "Hot Drop",
  "Infinity Reels",
  "Bonus Spins",
  "Gold Blitz",
  "Night Mode",
  "Christmas",
  "Summer",
  "Extreme",
  "Plus",
  "Ultra",
];

function buildSlotCatalog(target = 200): SlotCatalogItem[] {
  const items: SlotCatalogItem[] = [];
  const used = new Set<string>();

  const push = (
    partial: Omit<SlotCatalogItem, "id" | "accent" | "availability" | "provider" | "lines"> & {
      provider?: string;
      lines?: LineMode;
    }
  ) => {
    if (items.length >= target) return;
    const key = partial.name.toLowerCase();
    if (used.has(key)) return;
    used.add(key);
    const n = items.length + 1;
    const lines = partial.lines ?? assignLineMode(n - 1, partial.name);
    const label = lineModeLabel(lines);
    items.push({
      id: `slot-${String(n).padStart(3, "0")}`,
      name: partial.name,
      theme: partial.theme,
      provider: partial.provider ?? "Betme Originals",
      volatility: partial.volatility,
      lines,
      accent: ACCENTS[n % ACCENTS.length]!,
      tagline: partial.tagline.includes("line") || partial.tagline.includes("Ways")
        ? partial.tagline
        : `${label} · ${partial.tagline}`,
      availability: "live",
      featured: partial.featured,
    });
  };

  for (const f of FEATURED_SLOTS) push(f);

  for (const t of SERIES_TEMPLATES) {
    for (const suffix of SERIES_SUFFIXES) {
      push({
        name: `${t.prefix} ${suffix}`,
        theme: t.theme,
        volatility: t.volatility,
        tagline: t.tagline,
      });
      if (items.length >= target) break;
    }
    if (items.length >= target) break;
  }

  let filler = 1;
  while (items.length < target) {
    push({
      name: `Betme Reels ${filler}`,
      theme: "Betme",
      volatility: filler % 3 === 0 ? "high" : filler % 3 === 1 ? "medium" : "low",
      tagline: "Social slots · Betme credits only",
    });
    filler += 1;
  }

  return items.slice(0, target);
}

export const SLOT_CATALOG: SlotCatalogItem[] = buildSlotCatalog(200);

export const TABLE_CATALOG: TableCatalogItem[] = [
  { id: "bj-classic", name: "Classic Blackjack", family: "blackjack", seats: 5, tagline: "Hit · stand · 2.5× natural · Betme credits", accent: "#1f7a63", availability: "live", href: "/casino/blackjack" },
  { id: "bj-vegas", name: "Vegas Strip Blackjack", family: "blackjack", seats: 7, tagline: "Bright felt · same Betme credit stakes", accent: "#C45C26", availability: "live", href: "/casino/blackjack?table=bj-vegas" },
  { id: "bj-atlantic", name: "Atlantic Blackjack", family: "blackjack", seats: 5, tagline: "Social table · Betme credits", accent: "#0B3D4A", availability: "live", href: "/casino/blackjack?table=bj-atlantic" },
  { id: "bj-party", name: "Party Blackjack", family: "blackjack", seats: 7, tagline: "Side-bet energy · soon", accent: "#B7950B", availability: "soon" },
  { id: "roulette-eu", name: "European Roulette", family: "roulette", seats: 8, tagline: "Single zero · Betme credits", accent: "#922B21", availability: "live", href: "/casino/roulette" },
  { id: "roulette-fr", name: "French Roulette", family: "roulette", seats: 8, tagline: "La partage style · credits", accent: "#1F618D", availability: "live", href: "/casino/roulette?table=roulette-fr" },
  { id: "roulette-am", name: "American Roulette", family: "roulette", seats: 8, tagline: "Double zero · soon", accent: "#922B21", availability: "soon" },
  { id: "baccarat-punto", name: "Punto Banco", family: "baccarat", seats: 6, tagline: "Player · Banker · Tie", accent: "#5B2C6F", availability: "live", href: "/casino/baccarat" },
  { id: "baccarat-mini", name: "Mini Baccarat", family: "baccarat", seats: 4, tagline: "Fast banker battles", accent: "#6C3483", availability: "live", href: "/casino/baccarat?table=baccarat-mini" },
  { id: "baccarat-speed", name: "Speed Baccarat", family: "baccarat", seats: 5, tagline: "Lightning rounds · soon", accent: "#5B2C6F", availability: "soon" },
  { id: "craps-classic", name: "Street Craps", family: "dice", seats: 10, tagline: "Pass line · soon", accent: "#2F5D3A", availability: "soon" },
  { id: "sic-bo", name: "Sic Bo", family: "dice", seats: 8, tagline: "Triple dice · soon", accent: "#922B21", availability: "soon" },
  { id: "poker-texas", name: "Texas Hold'em Lounge", family: "poker", seats: 9, tagline: "Social ring · soon", accent: "#117A65", availability: "soon" },
  { id: "poker-omaha", name: "Omaha Hi", family: "poker", seats: 6, tagline: "Four-hole · soon", accent: "#1A6B5A", availability: "soon" },
  { id: "three-card", name: "Three Card Poker", family: "poker", seats: 5, tagline: "Ante + play · soon", accent: "#5B2C6F", availability: "soon" },
  { id: "caribbean", name: "Caribbean Stud", family: "poker", seats: 5, tagline: "Vs house · soon", accent: "#2F5D3A", availability: "soon" },
  { id: "let-it-ride", name: "Let It Ride", family: "poker", seats: 5, tagline: "Three-bet poker · soon", accent: "#117A65", availability: "soon" },
  { id: "pai-gow", name: "Pai Gow Poker", family: "poker", seats: 6, tagline: "House banker · soon", accent: "#C45C26", availability: "soon" },
  { id: "casino-war", name: "Casino War", family: "other", seats: 5, tagline: "High card duel · soon", accent: "#1F618D", availability: "soon" },
  { id: "andar-bahar", name: "Andar Bahar", family: "other", seats: 6, tagline: "Side vs side · soon", accent: "#6C3483", availability: "soon" },
];

export const LIVE_DEALER_CATALOG: LiveDealerItem[] = [
  { id: "live-bj-1", name: "Live Blackjack Emerald", studio: "Betme Studio A", tagline: "HD dealer · Betme credits · coming soon", accent: "#1f7a63", availability: "soon" },
  { id: "live-bj-2", name: "Live Blackjack VIP", studio: "Betme Studio A", tagline: "Higher seat stakes · soon", accent: "#117A65", availability: "soon" },
  { id: "live-roulette-1", name: "Live Roulette Sphere", studio: "Betme Studio B", tagline: "Real wheel feed · soon", accent: "#922B21", availability: "soon" },
  { id: "live-roulette-2", name: "Live Lightning Roulette", studio: "Betme Studio B", tagline: "Number multipliers · soon", accent: "#C45C26", availability: "soon" },
  { id: "live-baccarat-1", name: "Live Baccarat Velvet", studio: "Betme Studio C", tagline: "Hosted banker · soon", accent: "#5B2C6F", availability: "soon" },
  { id: "live-game-show", name: "Live Social Show", studio: "Betme Arena", tagline: "Hosted Plinko & Crash · soon", accent: "#C45C26", availability: "soon" },
  { id: "live-poker", name: "Live Casino Hold'em", studio: "Betme Studio D", tagline: "Dealer poker · soon", accent: "#0B3D4A", availability: "soon" },
  { id: "live-dice", name: "Live Sic Bo Pit", studio: "Betme Studio D", tagline: "Shaker cams · soon", accent: "#2F5D3A", availability: "soon" },
];

export const INSTANT_GAMES: InstantGameItem[] = [
  { id: "plinko", name: "Plinko Drop", tagline: "Pegs · paths · Betme credit multipliers", accent: "#1f7a63", href: "/casino/plinko", badge: "Hot" },
  { id: "crash", name: "Crash Rocket", tagline: "Cash out before it blows · Betme credits", accent: "#C45C26", href: "/casino/crash", badge: "Live" },
  { id: "crypto-lev", name: "Leverage Lab", tagline: "Fake crypto · fake leverage · Betme credits only", accent: "#0B3D4A", href: "/casino/crypto", badge: "Sim" },
];

export function getSlotById(id: string) {
  return SLOT_CATALOG.find((s) => s.id === id) ?? SLOT_CATALOG[0]!;
}

export function getFeaturedSlots() {
  return SLOT_CATALOG.filter((s) => s.featured);
}

export function getSlotsByTheme(theme: string) {
  return SLOT_CATALOG.filter((s) => s.theme === theme);
}

export function getSlotThemes() {
  return [...new Set(SLOT_CATALOG.map((s) => s.theme))];
}

export function getSlotsByLines(lines: LineMode) {
  return SLOT_CATALOG.filter((s) => s.lines === lines);
}

export function getTableById(id: string) {
  return TABLE_CATALOG.find((t) => t.id === id);
}

export const CASINO_COUNTS = {
  slots: SLOT_CATALOG.length,
  tables: TABLE_CATALOG.length,
  liveDealer: LIVE_DEALER_CATALOG.length,
  instant: INSTANT_GAMES.length,
  lines15: SLOT_CATALOG.filter((s) => s.lines === 15).length,
  lines20: SLOT_CATALOG.filter((s) => s.lines === 20).length,
  lines100: SLOT_CATALOG.filter((s) => s.lines === 100).length,
  ways500: SLOT_CATALOG.filter((s) => s.lines === 500).length,
} as const;
