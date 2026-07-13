// Mirrors tailwind.config.ts colors. Needed because chart libraries
// (Recharts) take raw hex/CSS values, not Tailwind class names.
// Keep these two files in sync manually — Tailwind config is the
// source of truth if they ever drift.

export const tokens = {
  color: {
    ivory: "#F7F3EA",
    ink: "#1F3B2C",
    inkSoft: "#3E5949",
    gray: "#8A8578",
    grayLine: "#E2DDCF",
    gold: "#C9A227",
    goldBg: "#F3E9C9",
    terracotta: "#C1633D",
    terracottaBg: "#F3DDCF",
    daniel: "#0F6E56",
    danielBg: "#DCEEE8",
    adel: "#B4637A",
    adelBg: "#F3E0E5",
    card: "#FFFFFF",
  },
  font: {
    display: "var(--font-fraunces)",
    body: "var(--font-general-sans)",
    mono: "var(--font-jetbrains-mono)",
  },
} as const;

export type PersonKey = "daniel" | "adel";

export const personColor: Record<PersonKey, string> = {
  daniel: tokens.color.daniel,
  adel: tokens.color.adel,
};
