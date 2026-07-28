/** Visual packs inspired by modern HTML5 slots (theme only — not licensed IP). */

export type SlotVisualTheme = {
  id: string;
  sky: string;
  mid: string;
  ground: string;
  glow: string;
  particle: string;
  motif: "bolt" | "trident" | "fish" | "lion" | "candy" | "tomb" | "neon" | "wolf" | "wave" | "spur" | "orb" | "jade" | "alien";
  label: string;
};

const PACKS: Record<string, SlotVisualTheme> = {
  Mythology: {
    id: "mythology",
    sky: "#0a1628",
    mid: "#1a3a6e",
    ground: "#c9a227",
    glow: "#f4d35e",
    particle: "#ffe566",
    motif: "bolt",
    label: "Olympus",
  },
  Fishing: {
    id: "fishing",
    sky: "#062a3a",
    mid: "#0d5c6e",
    ground: "#1a8a6a",
    glow: "#5ce1e6",
    particle: "#7ef0ff",
    motif: "fish",
    label: "Deep water",
  },
  Fortune: {
    id: "fortune",
    sky: "#2a0a0a",
    mid: "#8b1a1a",
    ground: "#d4a017",
    glow: "#ffd700",
    particle: "#ffb347",
    motif: "lion",
    label: "Fortune",
  },
  Candy: {
    id: "candy",
    sky: "#2d0a3a",
    mid: "#c44dff",
    ground: "#ff6bcb",
    glow: "#ff9ecd",
    particle: "#ffd6f0",
    motif: "candy",
    label: "Sugar",
  },
  Adventure: {
    id: "adventure",
    sky: "#1a1208",
    mid: "#8b5a2b",
    ground: "#d4a574",
    glow: "#e8c547",
    particle: "#f0d78c",
    motif: "tomb",
    label: "Tomb",
  },
  Classic: {
    id: "classic",
    sky: "#0a0a18",
    mid: "#1a1040",
    ground: "#ff2d95",
    glow: "#00f0ff",
    particle: "#b8f0ff",
    motif: "neon",
    label: "Neon",
  },
  Nature: {
    id: "nature",
    sky: "#0a1810",
    mid: "#1e4d2b",
    ground: "#c4a35a",
    glow: "#e8e0c8",
    particle: "#dce8d0",
    motif: "wolf",
    label: "Wilds",
  },
  Ocean: {
    id: "ocean",
    sky: "#021820",
    mid: "#0a4a62",
    ground: "#1a8a9a",
    glow: "#3ecfcf",
    particle: "#7ef0ff",
    motif: "wave",
    label: "Abyss",
  },
  Western: {
    id: "western",
    sky: "#1a0e08",
    mid: "#6b3a1f",
    ground: "#c45c26",
    glow: "#f0a060",
    particle: "#ffc080",
    motif: "spur",
    label: "Frontier",
  },
  Gothic: {
    id: "gothic",
    sky: "#120818",
    mid: "#4a1a5c",
    ground: "#8b2f6a",
    glow: "#d4a0ff",
    particle: "#e8c0ff",
    motif: "orb",
    label: "Night",
  },
  "Sci-Fi": {
    id: "scifi",
    sky: "#050818",
    mid: "#12305a",
    ground: "#2dff9a",
    glow: "#5cffb0",
    particle: "#a0ffe0",
    motif: "alien",
    label: "Orbit",
  },
  Link: {
    id: "link",
    sky: "#081510",
    mid: "#0d4a3a",
    ground: "#c9a227",
    glow: "#50c878",
    particle: "#a0ffc8",
    motif: "jade",
    label: "Jade link",
  },
};

const FALLBACK: SlotVisualTheme = {
  id: "default",
  sky: "#050f0c",
  mid: "#1f7a63",
  ground: "#c8f560",
  glow: "#c8f560",
  particle: "#e8ff9a",
  motif: "bolt",
  label: "Betme",
};

export function getSlotVisual(theme: string): SlotVisualTheme {
  return PACKS[theme] ?? FALLBACK;
}
