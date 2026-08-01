import type { Metadata, Viewport } from "next";
import { fraunces, jetbrainsMono, generalSans } from "../lib/fonts";
import "./globals.css";
import NavBar from "./NavBar";

export const metadata: Metadata = {
  title: "Rumah — Household Ledger",
  description: "Shared finance tracker for Daniel & Adel",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <NavBar />
        {children}
      </body>
    </html>
  );
}
