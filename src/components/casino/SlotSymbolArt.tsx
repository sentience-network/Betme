"use client";

import type { SlotSymbol } from "@/lib/casino/symbols";
import { getThemePack, type ThemeSymbolDef } from "@/lib/casino/symbols";

function Art({
  art,
  tint,
  size,
  hot,
}: {
  art: ThemeSymbolDef["art"];
  tint: string;
  size: number;
  hot?: boolean;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    className: hot ? "slot-symbol-hot" : undefined,
    "aria-hidden": true as const,
  };

  switch (art) {
    case "zeus":
      return (
        <svg {...common}>
          <circle cx="32" cy="28" r="14" fill="#f8e3b0" />
          <path d="M18 42c4-6 10-8 14-8s10 2 14 8v10H18V42z" fill="#e8d4a8" />
          <path d="M22 18c2-8 8-12 10-12 4 0 6 4 8 8" fill="#f5f5f5" />
          <path d="M36 34l8 4-6 2 4 8-10-6 2-4z" fill={tint} />
          <path d="M40 36l14 18-4 2-12-16z" fill={tint} opacity="0.85" />
        </svg>
      );
    case "medusa":
      return (
        <svg {...common}>
          <circle cx="32" cy="30" r="12" fill="#d8f3dc" />
          <path d="M20 22c-4-6 2-12 6-8M44 22c4-6-2-12-6-8M16 30c-6-2-8 6-4 8M48 30c6-2 8 6 4 8M22 40c-4 4 0 10 4 6M42 40c4 4 0 10-4 6" stroke={tint} strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="27" cy="28" r="2" fill="#071a14" />
          <circle cx="37" cy="28" r="2" fill="#071a14" />
          <path d="M28 36c2 2 6 2 8 0" stroke="#071a14" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "owl":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="16" ry="18" fill={tint} />
          <circle cx="24" cy="30" r="7" fill="#fff" />
          <circle cx="40" cy="30" r="7" fill="#fff" />
          <circle cx="24" cy="30" r="3" fill="#071a14" />
          <circle cx="40" cy="30" r="3" fill="#071a14" />
          <polygon points="32,34 28,40 36,40" fill="#ffd43b" />
        </svg>
      );
    case "helmet":
      return (
        <svg {...common}>
          <path d="M14 36c0-14 8-24 18-24s18 10 18 24v8H14v-8z" fill={tint} />
          <rect x="28" y="8" width="8" height="14" fill="#e03131" />
          <path d="M18 40h28v6H18z" fill="#adb5bd" />
        </svg>
      );
    case "lyre":
      return (
        <svg {...common}>
          <path d="M18 16c0 20 4 32 14 32s14-12 14-32" stroke={tint} strokeWidth="4" fill="none" />
          <path d="M22 20h20M22 28h20M22 36h20" stroke="#fff8" strokeWidth="1.5" />
          <rect x="28" y="44" width="8" height="12" rx="2" fill={tint} />
        </svg>
      );
    case "amphora":
      return (
        <svg {...common}>
          <path d="M24 14h16l2 8H22z" fill={tint} />
          <path d="M22 22h20c2 8-2 28-10 28S20 30 22 22z" fill={tint} opacity="0.9" />
          <path d="M16 26c-4 2-4 8 0 10M48 26c4 2 4 8 0 10" stroke={tint} strokeWidth="3" fill="none" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="26" fill="#071a14" stroke={tint} strokeWidth="3" />
          <path d="M34 10L22 34h10L28 54l18-28H36z" fill={tint} />
        </svg>
      );
    case "temple":
      return (
        <svg {...common}>
          <polygon points="32,8 54,24 10,24" fill={tint} />
          <rect x="14" y="24" width="8" height="26" fill="#fff8" />
          <rect x="28" y="24" width="8" height="26" fill="#fff8" />
          <rect x="42" y="24" width="8" height="26" fill="#fff8" />
          <rect x="10" y="50" width="44" height="6" fill={tint} />
        </svg>
      );
    case "shark":
      return (
        <svg {...common}>
          <ellipse cx="34" cy="34" rx="22" ry="12" fill={tint} />
          <polygon points="12,34 2,26 2,42" fill={tint} />
          <polygon points="40,22 46,10 50,24" fill={tint} />
          <circle cx="48" cy="32" r="2.5" fill="#071a14" />
          <path d="M28 40c4 4 12 4 16 0" stroke="#fff6" strokeWidth="2" fill="none" />
        </svg>
      );
    case "marlin":
      return (
        <svg {...common}>
          <ellipse cx="36" cy="36" rx="18" ry="10" fill={tint} />
          <polygon points="18,36 4,28 8,36 4,44" fill={tint} />
          <path d="M48 28 L60 16" stroke={tint} strokeWidth="3" strokeLinecap="round" />
          <circle cx="46" cy="34" r="2" fill="#071a14" />
        </svg>
      );
    case "tuna":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="20" ry="12" fill={tint} />
          <polygon points="12,34 2,26 2,42" fill={tint} />
          <polygon points="36,22 40,14 44,24" fill="#fff5" />
          <circle cx="44" cy="32" r="2" fill="#071a14" />
        </svg>
      );
    case "fish":
      return (
        <svg {...common}>
          <ellipse cx="34" cy="32" rx="16" ry="10" fill={tint} />
          <polygon points="18,32 6,24 6,40" fill={tint} />
          <circle cx="42" cy="30" r="2" fill="#071a14" />
          <path d="M28 28c4 0 6 2 6 4" stroke="#fff6" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "crab":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="36" rx="14" ry="10" fill={tint} />
          <circle cx="26" cy="32" r="3" fill="#071a14" />
          <circle cx="38" cy="32" r="3" fill="#071a14" />
          <path d="M18 28c-6-8 2-14 6-8M46 28c6-8-2-14-6-8" stroke={tint} strokeWidth="3" fill="none" />
          <path d="M20 44l-6 8M44 44l6 8M26 46v8M38 46v8" stroke={tint} strokeWidth="2" />
        </svg>
      );
    case "bait":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="38" rx="10" ry="14" fill={tint} />
          <path d="M32 10v16" stroke="#adb5bd" strokeWidth="2" />
          <circle cx="32" cy="10" r="3" fill="#ffd43b" />
          <path d="M26 30c4 2 8 2 12 0" stroke="#fff6" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "hook":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="26" fill="#071a14" stroke={tint} strokeWidth="3" />
          <path d="M28 14v22c0 8 6 12 12 8" stroke={tint} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="14" r="3" fill={tint} />
        </svg>
      );
    case "boat":
      return (
        <svg {...common}>
          <path d="M10 40h44l-6 12H16z" fill={tint} />
          <path d="M32 12v28" stroke="#fff" strokeWidth="2" />
          <path d="M32 14l16 18H32z" fill="#fff8" />
          <rect x="26" y="34" width="12" height="6" fill="#071a14" opacity="0.35" />
        </svg>
      );
    case "dragon":
      return (
        <svg {...common}>
          <path d="M8 40c8-16 20-24 28-20 6 3 8 10 6 16" fill={tint} />
          <path d="M42 28c8-4 14 2 16 10" stroke={tint} strokeWidth="4" fill="none" />
          <circle cx="48" cy="30" r="3" fill="#ffd43b" />
          <path d="M20 24l-4-10 8 6M28 20l2-10 6 8" fill={tint} opacity="0.8" />
        </svg>
      );
    case "tiger":
      return (
        <svg {...common}>
          <circle cx="32" cy="34" r="16" fill={tint} />
          <path d="M20 22l-6-8M44 22l6-8" stroke={tint} strokeWidth="4" />
          <circle cx="26" cy="32" r="2.5" fill="#071a14" />
          <circle cx="38" cy="32" r="2.5" fill="#071a14" />
          <path d="M28 40c2 2 6 2 8 0" stroke="#071a14" strokeWidth="2" fill="none" />
          <path d="M24 28h4M36 28h4M30 36v4" stroke="#071a14" strokeWidth="2" />
        </svg>
      );
    case "coin":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" fill={tint} stroke="#fff8" strokeWidth="2" />
          <circle cx="32" cy="32" r="14" fill="none" stroke="#071a1466" strokeWidth="2" />
          <text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="900" fill="#071a14">
            $
          </text>
        </svg>
      );
    case "fan":
      return (
        <svg {...common}>
          <path d="M32 48 L10 20 Q32 8 54 20 Z" fill={tint} opacity="0.9" />
          <path d="M32 48 L20 22M32 48 L32 16M32 48 L44 22" stroke="#fff6" strokeWidth="1.5" />
        </svg>
      );
    case "lantern":
      return (
        <svg {...common}>
          <rect x="22" y="18" width="20" height="28" rx="6" fill={tint} />
          <rect x="26" y="12" width="12" height="6" fill="#fff8" />
          <path d="M28 26h8M28 34h8" stroke="#fff6" strokeWidth="2" />
          <path d="M24 46h16v4H24z" fill="#071a14" opacity="0.3" />
        </svg>
      );
    case "ingot":
      return (
        <svg {...common}>
          <path d="M12 40 L20 20h24l8 20z" fill={tint} />
          <path d="M20 20h24l-4 8H24z" fill="#fff6" />
        </svg>
      );
    case "jade":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="26" fill="#071a14" stroke={tint} strokeWidth="3" />
          <circle cx="32" cy="32" r="14" fill={tint} />
          <circle cx="28" cy="28" r="4" fill="#fff6" />
        </svg>
      );
    case "fortune":
      return (
        <svg {...common}>
          <rect x="12" y="12" width="40" height="40" rx="8" fill={tint} />
          <text x="32" y="40" textAnchor="middle" fontSize="22" fontWeight="900" fill="#e03131">
            福
          </text>
        </svg>
      );
    case "candy":
      return (
        <svg {...common}>
          <rect x="22" y="26" width="20" height="14" rx="7" fill={tint} />
          <polygon points="22,33 10,24 10,42" fill={tint} opacity="0.7" />
          <polygon points="42,33 54,24 54,42" fill={tint} opacity="0.7" />
        </svg>
      );
    case "lolli":
      return (
        <svg {...common}>
          <circle cx="32" cy="24" r="14" fill={tint} />
          <circle cx="32" cy="24" r="8" fill="#fff6" />
          <rect x="30" y="36" width="4" height="18" fill="#e9ecef" />
        </svg>
      );
    case "gummy":
      return (
        <svg {...common}>
          <path d="M20 44c0-16 6-28 12-28s12 12 12 28" fill={tint} />
          <circle cx="26" cy="28" r="2" fill="#071a14" />
          <circle cx="38" cy="28" r="2" fill="#071a14" />
        </svg>
      );
    case "cupcake":
      return (
        <svg {...common}>
          <path d="M18 32h28l-4 20H22z" fill="#ffd6a5" />
          <ellipse cx="32" cy="30" rx="16" ry="10" fill={tint} />
          <circle cx="32" cy="18" r="4" fill="#ff6b6b" />
        </svg>
      );
    case "jar":
      return (
        <svg {...common}>
          <rect x="20" y="18" width="24" height="34" rx="6" fill={tint} />
          <rect x="24" y="12" width="16" height="8" rx="2" fill="#fff8" />
          <circle cx="28" cy="32" r="3" fill="#ff6b6b" />
          <circle cx="36" cy="40" r="3" fill="#ffd43b" />
        </svg>
      );
    case "bomb":
      return (
        <svg {...common}>
          <circle cx="32" cy="36" r="16" fill={tint} />
          <rect x="28" y="16" width="8" height="8" fill="#adb5bd" />
          <path d="M36 16c6-6 10-2 8 4" stroke="#ffa94d" strokeWidth="3" fill="none" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <polygon
            points="32,6 38,24 56,24 42,36 48,54 32,42 16,54 22,36 8,24 26,24"
            fill={tint}
          />
        </svg>
      );
    case "ankh":
      return (
        <svg {...common}>
          <circle cx="32" cy="18" r="8" fill="none" stroke={tint} strokeWidth="4" />
          <path d="M32 26v28M20 36h24" stroke={tint} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "scarab":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="14" ry="16" fill={tint} />
          <path d="M18 24c-6-4-8 2-4 6M46 24c6-4 8 2 4 6M18 44c-4 4 0 8 4 4M46 44c4 4 0 8-4 4" stroke={tint} strokeWidth="2" fill="none" />
          <circle cx="26" cy="30" r="2" fill="#071a14" />
          <circle cx="38" cy="30" r="2" fill="#071a14" />
        </svg>
      );
    case "scroll":
      return (
        <svg {...common}>
          <rect x="16" y="14" width="32" height="36" rx="4" fill={tint} />
          <path d="M22 24h20M22 32h16M22 40h18" stroke="#071a1466" strokeWidth="2" />
        </svg>
      );
    case "pharaoh":
      return (
        <svg {...common}>
          <path d="M16 48c4-20 10-28 16-28s12 8 16 28" fill={tint} />
          <circle cx="32" cy="28" r="10" fill="#f8e3b0" />
          <rect x="22" y="16" width="20" height="8" fill="#e03131" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M12 16h18v36H16a4 4 0 01-4-4V16z" fill={tint} />
          <path d="M52 16H34v36h14a4 4 0 004-4V16z" fill={tint} opacity="0.85" />
          <path d="M32 16v36" stroke="#fff8" strokeWidth="2" />
        </svg>
      );
    case "tomb":
      return (
        <svg {...common}>
          <path d="M18 54V28c0-10 6-18 14-18s14 8 14 18v26z" fill={tint} />
          <rect x="28" y="34" width="8" height="14" fill="#071a1466" />
        </svg>
      );
    case "cherry":
      return (
        <svg {...common}>
          <path d="M28 28c-6 10-14 18-10 24 3 4 10 2 14-4" fill={tint} />
          <path d="M36 28c6 10 14 18 10 24-3 4-10 2-14-4" fill={tint} />
          <path d="M32 8c2 8 4 14 0 20" stroke="#2d6a4f" strokeWidth="3" fill="none" />
        </svg>
      );
    case "lemon":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="20" ry="16" fill={tint} />
          <ellipse cx="32" cy="34" rx="12" ry="8" fill="#fff6" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 28c0-10 6-18 14-18s14 8 14 18v8c0 4 2 8 6 10H12c4-2 6-6 6-10v-8z" fill={tint} />
          <circle cx="32" cy="50" r="4" fill="#ffd43b" />
        </svg>
      );
    case "bar":
      return (
        <svg {...common}>
          <rect x="8" y="22" width="48" height="22" rx="4" fill={tint} />
          <text x="32" y="38" textAnchor="middle" fontSize="14" fontWeight="900" fill="#071a14">
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
            style={{ filter: "drop-shadow(0 0 6px #ff8fab88)" }}
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
        </svg>
      );
    case "neon":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="26" fill="#071a14" stroke={tint} strokeWidth="3" />
          <text x="32" y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill={tint}>
            WILD
          </text>
        </svg>
      );
    case "wolf":
      return (
        <svg {...common}>
          <polygon points="32,12 48,28 44,52 20,52 16,28" fill={tint} />
          <polygon points="20,24 14,10 26,20" fill={tint} />
          <polygon points="44,24 50,10 38,20" fill={tint} />
          <circle cx="26" cy="32" r="2" fill="#071a14" />
          <circle cx="38" cy="32" r="2" fill="#071a14" />
        </svg>
      );
    case "buffalo":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="36" rx="18" ry="14" fill={tint} />
          <path d="M14 28c-8-4-10 4-4 8M50 28c8-4 10 4 4 8" stroke={tint} strokeWidth="4" fill="none" />
          <circle cx="26" cy="34" r="2" fill="#071a14" />
          <circle cx="38" cy="34" r="2" fill="#071a14" />
        </svg>
      );
    case "horse":
      return (
        <svg {...common}>
          <path d="M18 44c4-16 10-24 20-22 6 1 10 8 10 14" fill={tint} />
          <path d="M40 24c8-2 14 4 12 12" fill={tint} />
          <circle cx="48" cy="30" r="2" fill="#071a14" />
          <path d="M22 20c0-8 6-12 10-8" fill={tint} opacity="0.8" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="18" fill={tint} />
          <circle cx="40" cy="28" r="14" fill="#071a14" />
        </svg>
      );
    case "paw":
      return (
        <svg {...common}>
          <circle cx="32" cy="40" r="10" fill={tint} />
          <circle cx="18" cy="28" r="5" fill={tint} />
          <circle cx="28" cy="22" r="5" fill={tint} />
          <circle cx="40" cy="22" r="5" fill={tint} />
          <circle cx="48" cy="28" r="5" fill={tint} />
        </svg>
      );
    case "wave":
      return (
        <svg {...common}>
          <path d="M8 36c8-12 16-12 24 0s16 12 24 0" stroke={tint} strokeWidth="5" fill="none" />
          <path d="M8 46c8-10 16-10 24 0s16 10 24 0" stroke={tint} strokeWidth="3" fill="none" opacity="0.6" />
        </svg>
      );
    case "fin":
      return (
        <svg {...common}>
          <path d="M12 44 L32 12 L52 44 Z" fill={tint} />
          <path d="M32 12 L32 44" stroke="#fff5" strokeWidth="2" />
        </svg>
      );
    case "pearl":
      return (
        <svg {...common}>
          <circle cx="32" cy="34" r="16" fill={tint} />
          <circle cx="26" cy="28" r="5" fill="#fff8" />
          <path d="M16 44c8 8 24 8 32 0" stroke="#74c0fc" strokeWidth="3" fill="none" />
        </svg>
      );
    case "anchor":
      return (
        <svg {...common}>
          <circle cx="32" cy="14" r="6" fill="none" stroke={tint} strokeWidth="3" />
          <path d="M32 20v28M18 36c0 12 28 12 28 0M20 48h24" stroke={tint} strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "spur":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="12" fill="none" stroke={tint} strokeWidth="4" />
          <circle cx="32" cy="32" r="4" fill={tint} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={32 + Math.cos(r) * 12}
                y1={32 + Math.sin(r) * 12}
                x2={32 + Math.cos(r) * 22}
                y2={32 + Math.sin(r) * 22}
                stroke={tint}
                strokeWidth="3"
              />
            );
          })}
        </svg>
      );
    case "hat":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="44" rx="24" ry="6" fill={tint} />
          <path d="M20 44c0-16 6-24 12-24s12 8 12 24" fill={tint} />
          <rect x="18" y="36" width="28" height="6" fill="#071a1466" />
        </svg>
      );
    case "revolver":
      return (
        <svg {...common}>
          <rect x="10" y="28" width="36" height="10" rx="2" fill={tint} />
          <path d="M40 28h12v14c-4 4-8 2-8-2v-4h-4z" fill={tint} />
          <circle cx="22" cy="33" r="3" fill="#071a14" />
        </svg>
      );
    case "badge":
      return (
        <svg {...common}>
          <polygon points="32,8 40,20 54,22 44,34 48,48 32,40 16,48 20,34 10,22 24,20" fill={tint} />
          <circle cx="32" cy="30" r="6" fill="#071a14" />
        </svg>
      );
    case "train":
      return (
        <svg {...common}>
          <rect x="10" y="24" width="44" height="22" rx="4" fill={tint} />
          <rect x="16" y="28" width="10" height="8" fill="#fff6" />
          <circle cx="20" cy="50" r="5" fill="#071a14" />
          <circle cx="44" cy="50" r="5" fill="#071a14" />
          <path d="M54 30h6v10" stroke={tint} strokeWidth="3" fill="none" />
        </svg>
      );
    case "rose":
      return (
        <svg {...common}>
          <circle cx="32" cy="28" r="14" fill={tint} />
          <circle cx="32" cy="28" r="7" fill="#fff4" />
          <path d="M32 42v12" stroke="#2d6a4f" strokeWidth="3" />
          <path d="M32 48c-6 0-8 4-4 4M32 50c6 0 8 4 4 4" fill="#2d6a4f" />
        </svg>
      );
    case "bat":
      return (
        <svg {...common}>
          <path d="M32 36c-8-4-20-16-24-8 8 2 12 8 12 8H8c8 6 16 8 24 4 8 4 16 2 24-4H44s4-6 12-8c-4-8-16 4-24 8z" fill={tint} />
          <circle cx="28" cy="34" r="2" fill="#071a14" />
          <circle cx="36" cy="34" r="2" fill="#071a14" />
        </svg>
      );
    case "chalice":
      return (
        <svg {...common}>
          <path d="M20 14h24v8c0 12-8 18-12 18S20 34 20 22v-8z" fill={tint} />
          <rect x="30" y="40" width="4" height="10" fill={tint} />
          <rect x="22" y="50" width="20" height="4" fill={tint} />
        </svg>
      );
    case "castle":
      return (
        <svg {...common}>
          <path d="M10 54V28h10v-8h8v8h8v-8h8v8h10v26z" fill={tint} />
          <rect x="28" y="38" width="8" height="16" fill="#071a1466" />
        </svg>
      );
    case "orb":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" fill={tint} opacity="0.85" />
          <circle cx="26" cy="26" r="6" fill="#fff8" />
        </svg>
      );
    case "alien":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="34" rx="18" ry="16" fill={tint} />
          <ellipse cx="24" cy="32" rx="5" ry="7" fill="#071a14" />
          <ellipse cx="40" cy="32" rx="5" ry="7" fill="#071a14" />
        </svg>
      );
    case "plasma":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="18" fill={tint} opacity="0.4" />
          <circle cx="32" cy="32" r="10" fill={tint} />
          <circle cx="32" cy="32" r="4" fill="#fff" />
        </svg>
      );
    case "chip":
      return (
        <svg {...common}>
          <rect x="14" y="18" width="36" height="28" rx="4" fill={tint} />
          <rect x="20" y="24" width="10" height="6" fill="#071a14" opacity="0.4" />
          <rect x="34" y="24" width="10" height="6" fill="#071a14" opacity="0.4" />
          <rect x="20" y="34" width="24" height="4" fill="#071a14" opacity="0.3" />
        </svg>
      );
    case "portal":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="32" rx="18" ry="24" fill="none" stroke={tint} strokeWidth="4" />
          <ellipse cx="32" cy="32" rx="10" ry="14" fill={tint} opacity="0.35" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <rect x="12" y="24" width="18" height="16" rx="8" fill="none" stroke={tint} strokeWidth="4" />
          <rect x="34" y="24" width="18" height="16" rx="8" fill="none" stroke={tint} strokeWidth="4" />
        </svg>
      );
    case "gem":
      return (
        <svg {...common}>
          <polygon points="32,8 52,24 40,52 24,52 12,24" fill={tint} />
          <polygon points="32,8 52,24 32,28" fill="#fff6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" fill={tint} />
        </svg>
      );
  }
}

export function SlotSymbolArt({
  symbol,
  theme,
  size = "md",
  hot,
}: {
  symbol: SlotSymbol;
  theme: string;
  size?: "sm" | "md" | "lg";
  hot?: boolean;
}) {
  const def = getThemePack(theme).symbols[symbol];
  const dim = size === "lg" ? 56 : size === "sm" ? 28 : 40;
  return <Art art={def.art} tint={def.tint} size={dim} hot={hot} />;
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
        </svg>
      );
    case "candy":
      return (
        <svg {...props}>
          <rect x="40" y="28" width="40" height="24" rx="12" fill={color} opacity="0.9" />
        </svg>
      );
    case "tomb":
      return (
        <svg {...props}>
          <path d="M40 70 V30 Q40 12 60 12 Q80 12 80 30 V70 Z" fill={color} opacity="0.75" />
        </svg>
      );
    case "neon":
      return (
        <svg {...props}>
          <circle cx="60" cy="40" r="22" fill="none" stroke={color} strokeWidth="4" />
        </svg>
      );
    case "wolf":
      return (
        <svg {...props}>
          <polygon points="60,14 78,34 72,70 48,70 42,34" fill={color} opacity="0.8" />
        </svg>
      );
    case "wave":
      return (
        <svg {...props}>
          <path d="M10 50 Q30 30 50 50 T90 50 T120 50" fill="none" stroke={color} strokeWidth="5" />
        </svg>
      );
    case "spur":
      return (
        <svg {...props}>
          <circle cx="60" cy="40" r="16" fill="none" stroke={color} strokeWidth="4" />
          <circle cx="60" cy="40" r="4" fill={color} />
        </svg>
      );
    case "orb":
      return (
        <svg {...props}>
          <circle cx="60" cy="40" r="20" fill={color} opacity="0.35" />
          <circle cx="60" cy="40" r="12" fill={color} opacity="0.7" />
        </svg>
      );
    case "jade":
      return (
        <svg {...props}>
          <rect x="35" y="22" width="50" height="36" rx="6" fill={color} opacity="0.75" />
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
    default:
      return (
        <svg {...props}>
          <path d="M60 10 V70 M48 22 L60 10 L72 22" stroke={color} strokeWidth="4" fill="none" />
        </svg>
      );
  }
}
