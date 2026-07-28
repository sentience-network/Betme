"use client";

import type { SlotSymbol } from "@/lib/casino/symbols";

/** Casino-style SVG symbols — readable at small sizes, themed by tint. */
export function SlotSymbolArt({
  symbol,
  tint,
  size = "md",
  hot,
}: {
  symbol: SlotSymbol;
  tint: string;
  size?: "sm" | "md" | "lg";
  hot?: boolean;
}) {
  const dim = size === "lg" ? 56 : size === "sm" ? 28 : 40;
  const common = {
    width: dim,
    height: dim,
    viewBox: "0 0 64 64",
    className: hot ? "slot-symbol-hot" : undefined,
    "aria-hidden": true as const,
  };

  switch (symbol) {
    case "cherry":
      return (
        <svg {...common}>
          <path d="M28 28c-6 10-14 18-10 24 3 4 10 2 14-4" fill={tint} opacity="0.95" />
          <path d="M36 28c6 10 14 18 10 24-3 4-10 2-14-4" fill={tint} />
          <path d="M32 8c2 8 4 14 0 20" stroke="#2d6a4f" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="38" cy="12" rx="8" ry="4" fill="#52b788" transform="rotate(20 38 12)" />
        </svg>
      );
    case "lemon":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="20" ry="16" fill={tint} />
          <ellipse cx="32" cy="34" rx="14" ry="10" fill="#fff6" />
          <path d="M32 14c4 2 6 6 4 10" stroke="#2d6a4f" strokeWidth="2.5" fill="none" />
          <ellipse cx="36" cy="14" rx="5" ry="3" fill="#74c69d" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path
            d="M18 28c0-10 6-18 14-18s14 8 14 18v8c0 4 2 8 6 10H12c4-2 6-6 6-10v-8z"
            fill={tint}
          />
          <rect x="26" y="8" width="12" height="6" rx="2" fill="#f8f9fa" />
          <circle cx="32" cy="50" r="5" fill="#ffd43b" />
          <path d="M20 36h24" stroke="#fff8" strokeWidth="2" />
        </svg>
      );
    case "bar":
      return (
        <svg {...common}>
          <rect x="8" y="20" width="48" height="24" rx="4" fill={tint} />
          <text
            x="32"
            y="38"
            textAnchor="middle"
            fontSize="16"
            fontWeight="900"
            fill="#071a14"
            fontFamily="system-ui,sans-serif"
          >
            BAR
          </text>
        </svg>
      );
    case "seven":
      return (
        <svg {...common}>
          <text
            x="32"
            y="48"
            textAnchor="middle"
            fontSize="44"
            fontWeight="900"
            fill={tint}
            fontFamily="system-ui,sans-serif"
            style={{ filter: "drop-shadow(0 2px 0 #0006) drop-shadow(0 0 6px #ff8fab88)" }}
          >
            7
          </text>
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <polygon points="32,6 54,28 32,58 10,28" fill={tint} />
          <polygon points="32,6 54,28 32,34" fill="#fff6" />
          <polygon points="32,34 54,28 32,58" fill="#0003" />
          <line x1="10" y1="28" x2="54" y2="28" stroke="#fff8" strokeWidth="1.5" />
        </svg>
      );
    case "wild":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="26" fill="#071a14" stroke={tint} strokeWidth="3" />
          <circle cx="32" cy="32" r="20" fill={tint} opacity="0.2" />
          <text
            x="32"
            y="28"
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fill={tint}
            fontFamily="system-ui,sans-serif"
            letterSpacing="1"
          >
            WILD
          </text>
          <path d="M22 36l5 8 5-12 5 12 5-8" stroke={tint} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "scatter":
      return (
        <svg {...common}>
          <polygon
            points="32,4 38,24 58,24 42,36 48,56 32,44 16,56 22,36 6,24 26,24"
            fill={tint}
            stroke="#fff8"
            strokeWidth="1"
          />
          <circle cx="32" cy="32" r="6" fill="#fff9" />
        </svg>
      );
    default:
      return null;
  }
}

export function ThemeMotifArt({
  motif,
  color,
  className,
}: {
  motif: string;
  color: string;
  className?: string;
}) {
  const props = {
    viewBox: "0 0 120 80",
    className,
    "aria-hidden": true as const,
  };
  switch (motif) {
    case "bolt":
      return (
        <svg {...props}>
          <path d="M58 8 L40 42 H56 L48 72 L82 34 H64 Z" fill={color} opacity="0.85" />
        </svg>
      );
    case "fish":
      return (
        <svg {...props}>
          <ellipse cx="58" cy="40" rx="28" ry="16" fill={color} opacity="0.8" />
          <polygon points="30,40 12,28 12,52" fill={color} opacity="0.8" />
          <circle cx="72" cy="36" r="3" fill="#071a14" />
        </svg>
      );
    case "lion":
      return (
        <svg {...props}>
          <circle cx="60" cy="38" r="18" fill={color} opacity="0.85" />
          <circle cx="60" cy="38" r="26" fill="none" stroke={color} strokeWidth="6" opacity="0.35" />
          <circle cx="53" cy="34" r="2.5" fill="#071a14" />
          <circle cx="67" cy="34" r="2.5" fill="#071a14" />
        </svg>
      );
    case "candy":
      return (
        <svg {...props}>
          <rect x="40" y="28" width="40" height="24" rx="12" fill={color} opacity="0.9" />
          <polygon points="40,40 22,28 22,52" fill={color} opacity="0.55" />
          <polygon points="80,40 98,28 98,52" fill={color} opacity="0.55" />
        </svg>
      );
    case "tomb":
      return (
        <svg {...props}>
          <path d="M40 70 V30 Q40 12 60 12 Q80 12 80 30 V70 Z" fill={color} opacity="0.75" />
          <rect x="52" y="38" width="16" height="20" rx="2" fill="#071a1488" />
        </svg>
      );
    case "neon":
      return (
        <svg {...props}>
          <circle cx="60" cy="40" r="22" fill="none" stroke={color} strokeWidth="4" opacity="0.9" />
          <circle cx="60" cy="40" r="12" fill={color} opacity="0.35" />
        </svg>
      );
    case "wolf":
      return (
        <svg {...props}>
          <polygon points="60,14 78,34 72,70 48,70 42,34" fill={color} opacity="0.8" />
          <polygon points="48,28 42,12 54,24" fill={color} />
          <polygon points="72,28 78,12 66,24" fill={color} />
        </svg>
      );
    case "wave":
      return (
        <svg {...props}>
          <path
            d="M10 50 Q30 30 50 50 T90 50 T120 50"
            fill="none"
            stroke={color}
            strokeWidth="5"
            opacity="0.8"
          />
          <path
            d="M10 62 Q30 46 50 62 T90 62 T120 62"
            fill="none"
            stroke={color}
            strokeWidth="3"
            opacity="0.45"
          />
        </svg>
      );
    case "spur":
      return (
        <svg {...props}>
          <circle cx="60" cy="40" r="16" fill="none" stroke={color} strokeWidth="4" />
          <circle cx="60" cy="40" r="4" fill={color} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={60 + Math.cos(r) * 16}
                y1={40 + Math.sin(r) * 16}
                x2={60 + Math.cos(r) * 26}
                y2={40 + Math.sin(r) * 26}
                stroke={color}
                strokeWidth="3"
              />
            );
          })}
        </svg>
      );
    case "orb":
      return (
        <svg {...props}>
          <circle cx="60" cy="40" r="20" fill={color} opacity="0.35" />
          <circle cx="60" cy="40" r="12" fill={color} opacity="0.7" />
          <circle cx="54" cy="34" r="4" fill="#fff8" />
        </svg>
      );
    case "jade":
      return (
        <svg {...props}>
          <rect x="35" y="22" width="50" height="36" rx="6" fill={color} opacity="0.75" />
          <rect x="45" y="30" width="30" height="20" rx="3" fill="#071a1466" />
        </svg>
      );
    case "alien":
      return (
        <svg {...props}>
          <ellipse cx="60" cy="40" rx="22" ry="18" fill={color} opacity="0.75" />
          <ellipse cx="50" cy="38" rx="6" ry="8" fill="#071a14" />
          <ellipse cx="70" cy="38" rx="6" ry="8" fill="#071a14" />
        </svg>
      );
    case "trident":
    default:
      return (
        <svg {...props}>
          <path d="M60 10 V70 M48 22 L60 10 L72 22 M40 28 L60 16 L80 28" stroke={color} strokeWidth="4" fill="none" />
        </svg>
      );
  }
}
