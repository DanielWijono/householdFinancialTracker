import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F3EA",
        ink: {
          DEFAULT: "#1F3B2C",
          soft: "#3E5949",
        },
        gray: {
          DEFAULT: "#8A8578",
          line: "#E2DDCF",
        },
        gold: {
          DEFAULT: "#C9A227",
          bg: "#F3E9C9",
          text: "#8A6A0F",
        },
        terracotta: {
          DEFAULT: "#C1633D",
          bg: "#F3DDCF",
        },
        // Person-coding — never reassigned elsewhere in the UI.
        daniel: {
          DEFAULT: "#0F6E56",
          bg: "#DCEEE8",
        },
        adel: {
          DEFAULT: "#B4637A",
          bg: "#F3E0E5",
        },
        card: "#FFFFFF",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-general-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        sheet: "24px",
        card: "16px",
        chip: "14px",
      },
      boxShadow: {
        sheet: "0 -12px 40px rgba(0,0,0,0.2)",
        fab: "0 8px 24px rgba(31,59,44,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
