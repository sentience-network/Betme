export type SlotSymbol =
  | "cherry"
  | "lemon"
  | "bell"
  | "bar"
  | "seven"
  | "diamond"
  | "wild"
  | "scatter";

export const SLOT_SYMBOL_LABEL: Record<SlotSymbol, string> = {
  cherry: "🍒",
  lemon: "🍋",
  bell: "🔔",
  bar: "BAR",
  seven: "7",
  diamond: "💎",
  wild: "W",
  scatter: "★",
};

export const SLOT_SYMBOL_TINT: Record<SlotSymbol, string> = {
  cherry: "#ff6b6b",
  lemon: "#ffd93d",
  bell: "#ffe66d",
  bar: "#c8f560",
  seven: "#ff8fab",
  diamond: "#74c0fc",
  wild: "#c8f560",
  scatter: "#ffa94d",
};

export const ALL_SLOT_SYMBOLS: SlotSymbol[] = [
  "cherry",
  "lemon",
  "bell",
  "bar",
  "seven",
  "diamond",
  "wild",
  "scatter",
];
