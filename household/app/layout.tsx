import type { Metadata } from "next";
import { fraunces, jetbrainsMono, generalSans } from "../lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rumah — Household Ledger",
  description: "Shared finance tracker for Daniel & Adel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrainsMono.variable} ${generalSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink font-body">
        {children}
      </body>
    </html>
  );
}
