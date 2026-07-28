/** Abstract reel icons — visuals/names come from theme packs. */
export type SlotSymbol =
  | "low1"
  | "low2"
  | "low3"
  | "mid1"
  | "mid2"
  | "high"
  | "wild"
  | "scatter";

export const ALL_SLOT_SYMBOLS: SlotSymbol[] = [
  "low1",
  "low2",
  "low3",
  "mid1",
  "mid2",
  "high",
  "wild",
  "scatter",
];

/** Paying symbols that wilds can substitute for (not scatter). */
export const PAY_SYMBOLS: SlotSymbol[] = ["low1", "low2", "low3", "mid1", "mid2", "high"];

export type ThemeSymbolDef = {
  name: string;
  short: string;
  tint: string;
  /** Art key rendered by SlotSymbolArt */
  art:
    | "amphora"
    | "lyre"
    | "owl"
    | "helmet"
    | "medusa"
    | "zeus"
    | "bolt"
    | "temple"
    | "bait"
    | "fish"
    | "crab"
    | "tuna"
    | "marlin"
    | "shark"
    | "hook"
    | "boat"
    | "coin"
    | "fan"
    | "lantern"
    | "ingot"
    | "tiger"
    | "dragon"
    | "jade"
    | "fortune"
    | "candy"
    | "lolli"
    | "gummy"
    | "cupcake"
    | "bomb"
    | "jar"
    | "star"
    | "ankh"
    | "scarab"
    | "scroll"
    | "pharaoh"
    | "book"
    | "tomb"
    | "cherry"
    | "lemon"
    | "bell"
    | "bar"
    | "seven"
    | "diamond"
    | "neon"
    | "wolf"
    | "buffalo"
    | "horse"
    | "moon"
    | "paw"
    | "wave"
    | "fin"
    | "pearl"
    | "anchor"
    | "spur"
    | "hat"
    | "revolver"
    | "badge"
    | "train"
    | "rose"
    | "bat"
    | "chalice"
    | "castle"
    | "orb"
    | "alien"
    | "plasma"
    | "chip"
    | "portal"
    | "link"
    | "gem"
    | "default-wild"
    | "default-scatter";
};

export type ThemePack = {
  id: string;
  wildName: string;
  scatterName: string;
  symbols: Record<SlotSymbol, ThemeSymbolDef>;
};

const CLASSIC: ThemePack = {
  id: "Classic",
  wildName: "Wild",
  scatterName: "Scatter",
  symbols: {
    low1: { name: "Cherry", short: "Cherry", tint: "#ff6b6b", art: "cherry" },
    low2: { name: "Lemon", short: "Lemon", tint: "#ffd93d", art: "lemon" },
    low3: { name: "Bell", short: "Bell", tint: "#ffe66d", art: "bell" },
    mid1: { name: "BAR", short: "BAR", tint: "#c8f560", art: "bar" },
    mid2: { name: "Seven", short: "7", tint: "#ff8fab", art: "seven" },
    high: { name: "Diamond", short: "Diamond", tint: "#74c0fc", art: "diamond" },
    wild: { name: "Wild", short: "WILD", tint: "#c8f560", art: "neon" },
    scatter: { name: "Scatter", short: "★", tint: "#ffa94d", art: "star" },
  },
};

const MYTHOLOGY: ThemePack = {
  id: "Mythology",
  wildName: "Thunder Wild",
  scatterName: "Temple",
  symbols: {
    low1: { name: "Amphora", short: "Jar", tint: "#d4a373", art: "amphora" },
    low2: { name: "Lyre", short: "Lyre", tint: "#f4d35e", art: "lyre" },
    low3: { name: "Athena Owl", short: "Owl", tint: "#c0c0ff", art: "owl" },
    mid1: { name: "Ares Helm", short: "Helm", tint: "#a8dadc", art: "helmet" },
    mid2: { name: "Medusa", short: "Medusa", tint: "#52b788", art: "medusa" },
    high: { name: "Zeus", short: "Zeus", tint: "#ffd60a", art: "zeus" },
    wild: { name: "Thunder Wild", short: "WILD", tint: "#7bdff2", art: "bolt" },
    scatter: { name: "Temple", short: "Temple", tint: "#e9c46a", art: "temple" },
  },
};

const FISHING: ThemePack = {
  id: "Fishing",
  wildName: "Hook Wild",
  scatterName: "Boat",
  symbols: {
    low1: { name: "Bait", short: "Bait", tint: "#ff922b", art: "bait" },
    low2: { name: "Bluegill", short: "Fish", tint: "#74c0fc", art: "fish" },
    low3: { name: "Crab", short: "Crab", tint: "#ff6b6b", art: "crab" },
    mid1: { name: "Tuna", short: "Tuna", tint: "#4dabf7", art: "tuna" },
    mid2: { name: "Marlin", short: "Marlin", tint: "#22b8cf", art: "marlin" },
    high: { name: "Shark", short: "Shark", tint: "#868e96", art: "shark" },
    wild: { name: "Hook Wild", short: "HOOK", tint: "#c8f560", art: "hook" },
    scatter: { name: "Fishing Boat", short: "Boat", tint: "#ffa94d", art: "boat" },
  },
};

const FORTUNE: ThemePack = {
  id: "Fortune",
  wildName: "Jade Wild",
  scatterName: "Fortune",
  symbols: {
    low1: { name: "Coin", short: "Coin", tint: "#ffd43b", art: "coin" },
    low2: { name: "Fan", short: "Fan", tint: "#ff8787", art: "fan" },
    low3: { name: "Lantern", short: "Lamp", tint: "#ffa94d", art: "lantern" },
    mid1: { name: "Gold Ingot", short: "Gold", tint: "#fcc419", art: "ingot" },
    mid2: { name: "Tiger", short: "Tiger", tint: "#fd7e14", art: "tiger" },
    high: { name: "Dragon", short: "Dragon", tint: "#e03131", art: "dragon" },
    wild: { name: "Jade Wild", short: "JADE", tint: "#51cf66", art: "jade" },
    scatter: { name: "Fortune Seal", short: "福", tint: "#ffd43b", art: "fortune" },
  },
};

const CANDY: ThemePack = {
  id: "Candy",
  wildName: "Jar Wild",
  scatterName: "Bomb",
  symbols: {
    low1: { name: "Candy", short: "Candy", tint: "#f783ac", art: "candy" },
    low2: { name: "Lollipop", short: "Lolli", tint: "#da77f2", art: "lolli" },
    low3: { name: "Gummy", short: "Gummy", tint: "#69db7c", art: "gummy" },
    mid1: { name: "Cupcake", short: "Cake", tint: "#ffc9c9", art: "cupcake" },
    mid2: { name: "Star Drop", short: "Star", tint: "#ffe066", art: "star" },
    high: { name: "Rainbow Jar", short: "Jar", tint: "#845ef7", art: "jar" },
    wild: { name: "Wild Jam", short: "WILD", tint: "#c8f560", art: "jar" },
    scatter: { name: "Sugar Bomb", short: "Bomb", tint: "#ff6b6b", art: "bomb" },
  },
};

const ADVENTURE: ThemePack = {
  id: "Adventure",
  wildName: "Book Wild",
  scatterName: "Tomb",
  symbols: {
    low1: { name: "Ankh", short: "Ankh", tint: "#fcc419", art: "ankh" },
    low2: { name: "Scarab", short: "Scarab", tint: "#51cf66", art: "scarab" },
    low3: { name: "Scroll", short: "Scroll", tint: "#e9ecef", art: "scroll" },
    mid1: { name: "Pharaoh", short: "Pharaoh", tint: "#ffd43b", art: "pharaoh" },
    mid2: { name: "Explorer", short: "Hat", tint: "#d9480f", art: "hat" },
    high: { name: "Sacred Book", short: "Book", tint: "#f08c00", art: "book" },
    wild: { name: "Book Wild", short: "WILD", tint: "#ffe066", art: "book" },
    scatter: { name: "Tomb Door", short: "Tomb", tint: "#fab005", art: "tomb" },
  },
};

const NATURE: ThemePack = {
  id: "Nature",
  wildName: "Moon Wild",
  scatterName: "Paw",
  symbols: {
    low1: { name: "Track", short: "Paw", tint: "#adb5bd", art: "paw" },
    low2: { name: "Wolf", short: "Wolf", tint: "#ced4da", art: "wolf" },
    low3: { name: "Horse", short: "Horse", tint: "#e8590c", art: "horse" },
    mid1: { name: "Rhino", short: "Rhino", tint: "#868e96", art: "buffalo" },
    mid2: { name: "Buffalo", short: "Buffalo", tint: "#d9480f", art: "buffalo" },
    high: { name: "Alpha Wolf", short: "Alpha", tint: "#f8f9fa", art: "wolf" },
    wild: { name: "Moon Wild", short: "MOON", tint: "#e9ecef", art: "moon" },
    scatter: { name: "Howl Mark", short: "Howl", tint: "#ffd43b", art: "paw" },
  },
};

const OCEAN: ThemePack = {
  id: "Ocean",
  wildName: "Pearl Wild",
  scatterName: "Anchor",
  symbols: {
    low1: { name: "Wave", short: "Wave", tint: "#66d9e8", art: "wave" },
    low2: { name: "Pearl", short: "Pearl", tint: "#f8f9fa", art: "pearl" },
    low3: { name: "Fin", short: "Fin", tint: "#15aabf", art: "fin" },
    mid1: { name: "Reef Fish", short: "Fish", tint: "#339af0", art: "fish" },
    mid2: { name: "Marlin", short: "Marlin", tint: "#22b8cf", art: "marlin" },
    high: { name: "Razor Shark", short: "Shark", tint: "#495057", art: "shark" },
    wild: { name: "Pearl Wild", short: "PEARL", tint: "#e7f5ff", art: "pearl" },
    scatter: { name: "Anchor", short: "Anchor", tint: "#ffd43b", art: "anchor" },
  },
};

const WESTERN: ThemePack = {
  id: "Western",
  wildName: "Wanted Wild",
  scatterName: "Train",
  symbols: {
    low1: { name: "Spur", short: "Spur", tint: "#fab005", art: "spur" },
    low2: { name: "Hat", short: "Hat", tint: "#d9480f", art: "hat" },
    low3: { name: "Badge", short: "Badge", tint: "#ffd43b", art: "badge" },
    mid1: { name: "Revolver", short: "Gun", tint: "#868e96", art: "revolver" },
    mid2: { name: "Outlaw", short: "Mask", tint: "#e03131", art: "hat" },
    high: { name: "Wanted", short: "Wanted", tint: "#fa5252", art: "badge" },
    wild: { name: "Wanted Wild", short: "WILD", tint: "#c8f560", art: "badge" },
    scatter: { name: "Money Train", short: "Train", tint: "#ff922b", art: "train" },
  },
};

const GOTHIC: ThemePack = {
  id: "Gothic",
  wildName: "Orb Wild",
  scatterName: "Castle",
  symbols: {
    low1: { name: "Rose", short: "Rose", tint: "#e64980", art: "rose" },
    low2: { name: "Bat", short: "Bat", tint: "#845ef7", art: "bat" },
    low3: { name: "Chalice", short: "Cup", tint: "#cc5de8", art: "chalice" },
    mid1: { name: "Orb", short: "Orb", tint: "#da77f2", art: "orb" },
    mid2: { name: "Vampire", short: "Fang", tint: "#f06595", art: "rose" },
    high: { name: "Immortal", short: "Heart", tint: "#ff6b6b", art: "orb" },
    wild: { name: "Orb Wild", short: "ORB", tint: "#d0bfff", art: "orb" },
    scatter: { name: "Castle", short: "Castle", tint: "#b197fc", art: "castle" },
  },
};

const SCIFI: ThemePack = {
  id: "Sci-Fi",
  wildName: "Portal Wild",
  scatterName: "Portal",
  symbols: {
    low1: { name: "Chip", short: "Chip", tint: "#69db7c", art: "chip" },
    low2: { name: "Plasma", short: "Plasma", tint: "#3bc9db", art: "plasma" },
    low3: { name: "Alien", short: "Alien", tint: "#8ce99a", art: "alien" },
    mid1: { name: "Drone", short: "Drone", tint: "#66d9e8", art: "chip" },
    mid2: { name: "Reactor", short: "Core", tint: "#20c997", art: "plasma" },
    high: { name: "Queen Alien", short: "Queen", tint: "#38d9a9", art: "alien" },
    wild: { name: "Portal Wild", short: "WILD", tint: "#c8f560", art: "portal" },
    scatter: { name: "Warp Gate", short: "Gate", tint: "#63e6be", art: "portal" },
  },
};

const LINK: ThemePack = {
  id: "Link",
  wildName: "Link Wild",
  scatterName: "Gem",
  symbols: {
    low1: { name: "Chip", short: "Chip", tint: "#ffd43b", art: "coin" },
    low2: { name: "Ring", short: "Ring", tint: "#51cf66", art: "jade" },
    low3: { name: "Bar", short: "Bar", tint: "#fcc419", art: "ingot" },
    mid1: { name: "Jewel", short: "Jewel", tint: "#ff6b6b", art: "gem" },
    mid2: { name: "Crown", short: "Crown", tint: "#ffd43b", art: "fortune" },
    high: { name: "Jackpot Gem", short: "Gem", tint: "#20c997", art: "gem" },
    wild: { name: "Link Wild", short: "LINK", tint: "#c8f560", art: "link" },
    scatter: { name: "Hold Gem", short: "Hold", tint: "#ffd43b", art: "gem" },
  },
};

const PACKS: Record<string, ThemePack> = {
  Mythology: MYTHOLOGY,
  Fishing: FISHING,
  Fortune: FORTUNE,
  Candy: CANDY,
  Adventure: ADVENTURE,
  Classic: CLASSIC,
  Nature: NATURE,
  Ocean: OCEAN,
  Western: WESTERN,
  Gothic: GOTHIC,
  "Sci-Fi": SCIFI,
  Link: LINK,
};

export function getThemePack(theme: string): ThemePack {
  return PACKS[theme] ?? CLASSIC;
}

export function symbolLabel(theme: string, symbol: SlotSymbol): string {
  return getThemePack(theme).symbols[symbol].short;
}

export function symbolTint(theme: string, symbol: SlotSymbol): string {
  return getThemePack(theme).symbols[symbol].tint;
}

export function symbolName(theme: string, symbol: SlotSymbol): string {
  return getThemePack(theme).symbols[symbol].name;
}

/** Legacy aliases used by older UI imports — Classic pack. */
export const SLOT_SYMBOL_LABEL: Record<SlotSymbol, string> = {
  low1: "🍒",
  low2: "🍋",
  low3: "🔔",
  mid1: "BAR",
  mid2: "7",
  high: "💎",
  wild: "W",
  scatter: "★",
};

export const SLOT_SYMBOL_TINT: Record<SlotSymbol, string> = {
  low1: "#ff6b6b",
  low2: "#ffd93d",
  low3: "#ffe66d",
  mid1: "#c8f560",
  mid2: "#ff8fab",
  high: "#74c0fc",
  wild: "#c8f560",
  scatter: "#ffa94d",
};
