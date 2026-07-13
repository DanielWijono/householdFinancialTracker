import { Fraunces, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

// Display — headers, page titles, big ledger numbers.
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

// Numerals only — transaction amounts, budget figures, settlement totals.
// Tabular figures via `font-variant-numeric: tabular-nums` in globals.css.
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Body/UI — General Sans is not on Google Fonts (it's Fontshare-hosted).
// Self-host for perf: download woff2 files from fontshare.com/fonts/general-sans
// into /public/fonts/general-sans/ and reference them below.
// Until those files are added, this will throw — swap to the Google Fonts
// stand-in (commented) to unblock local dev.
export const generalSans = localFont({
  src: [
    { path: "../public/fonts/general-sans/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/general-sans/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/general-sans/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

// Dev fallback if you don't want to pull the Fontshare files yet:
//
// import { Plus_Jakarta_Sans } from "next/font/google";
// export const generalSans = Plus_Jakarta_Sans({
//   subsets: ["latin"],
//   weight: ["400", "500", "600"],
//   variable: "--font-general-sans",
//   display: "swap",
// });
