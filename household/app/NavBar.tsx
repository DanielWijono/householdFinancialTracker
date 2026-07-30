"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/goals", label: "Goals" },
  { href: "/joint", label: "Joint" },
] as const;

export default function NavBar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-40 border-b-[0.5px] border-gray-line bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[480px] items-center gap-1 overflow-x-auto px-4 py-2.5">
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-chip px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                active ? "bg-ink text-ivory" : "text-gray hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
