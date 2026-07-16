"use client";

import { useMemo, useState } from "react";
import { categories } from "../../lib/categories";
import { transactions as allTransactions, type Transaction } from "../../lib/mock-data";

const PERSON_LABEL = { daniel: "Daniel", adel: "Adel" } as const;

type Filter = "all" | "shared" | "daniel" | "adel" | "wedding";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "shared", label: "Shared" },
  { id: "daniel", label: "Daniel" },
  { id: "adel", label: "Adel" },
  { id: "wedding", label: "Wedding" },
];

function categoryOf(id: string) {
  return categories.find((c) => c.id === id)!;
}

function dayLabel(iso: string, today: Date) {
  const d = new Date(iso);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (diffDays === 0) return `Today, ${dateStr}`;
  if (diffDays === 1) return `Yesterday, ${dateStr}`;
  return dateStr;
}

function matchesFilter(t: Transaction, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "wedding") return t.categoryId === "wedding";
  if (filter === "shared") return !categoryOf(t.categoryId).isPersonal;
  return t.paidBy === filter;
}

// Day totals computed client-side from the already-fetched page of
// transactions — fine at this volume; revisit if pagination goes cursor-based.
function groupByDay(txns: Transaction[], today: Date) {
  const groups = new Map<string, Transaction[]>();
  for (const t of txns) {
    const label = dayLabel(t.date, today);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(t);
  }
  return Array.from(groups.entries());
}

export default function TransactionsList() {
  const [filter, setFilter] = useState<Filter>("all");
  const today = useMemo(() => new Date("2026-07-16"), []);

  const filtered = useMemo(
    () => allTransactions.filter((t) => matchesFilter(t, filter)),
    [filter],
  );

  const totalSpent = filtered.reduce((sum, t) => sum + t.amount, 0);
  const paidDaniel = filtered.filter((t) => t.paidBy === "daniel").reduce((s, t) => s + t.amount, 0);
  const paidAdel = filtered.filter((t) => t.paidBy === "adel").reduce((s, t) => s + t.amount, 0);
  const groupedTxns = groupByDay(filtered, today);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-ivory pb-10">
      <header className="px-6 pb-4 pt-7">
        <div className="mb-1 font-display text-2xl font-medium text-ink">Transactions</div>
        <div className="text-[13px] text-gray">
          July 2026 · {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-5 pb-4">
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 whitespace-nowrap rounded-full border-[0.5px] px-3.5 py-2 text-[12.5px] font-medium ${
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-gray-line bg-card text-ink-soft"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mx-5 mb-5 flex divide-x-[0.5px] divide-gray-line rounded-card border-[0.5px] border-gray-line bg-card px-[18px] py-3.5">
        <SummaryItem label="Total spent" value={totalSpent} />
        <SummaryItem label="Paid by Daniel" value={paidDaniel} colorClass="text-daniel" />
        <SummaryItem label="Paid by Adel" value={paidAdel} colorClass="text-adel" />
      </div>

      <div className="px-5">
        {groupedTxns.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray">No transactions match this filter.</p>
        ) : (
          groupedTxns.map(([day, txns]) => {
            const dayTotal = txns.reduce((sum, t) => sum + t.amount, 0);
            return (
              <div
                key={day}
                className="mb-3.5 rounded-card border-[0.5px] border-gray-line bg-card px-[18px] py-1"
              >
                <div className="flex items-center justify-between py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray">
                  <span>{day}</span>
                  <span className="font-mono normal-case tracking-normal text-ink-soft">
                    {new Intl.NumberFormat("id-ID").format(dayTotal)}
                  </span>
                </div>
                {txns.map((t) => (
                  <TxnRow key={t.id} txn={t} />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass?: string;
}) {
  return (
    <div className="flex-1 px-1 text-center first:pl-0 last:pr-0">
      <div className={`font-mono text-[15px] font-semibold ${colorClass ?? "text-ink"}`}>
        {new Intl.NumberFormat("id-ID").format(value)}
      </div>
      <div className="mt-0.5 text-[10.5px] text-gray">{label}</div>
    </div>
  );
}

function TxnRow({ txn }: { txn: Transaction }) {
  const category = categoryOf(txn.categoryId);
  const isDaniel = txn.paidBy === "daniel";

  return (
    <div className="flex items-center gap-3 border-b-[0.5px] border-gray-line py-3 last:border-b-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-daniel-bg text-base">
        {category.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium text-ink">{txn.note}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-gray">
          <span
            className="flex h-[13px] w-[13px] items-center justify-center rounded-full text-[7px] font-semibold text-white"
            style={{ background: isDaniel ? "#0F6E56" : "#B4637A" }}
          >
            {isDaniel ? "D" : "A"}
          </span>
          {PERSON_LABEL[txn.paidBy]} · {category.isPersonal ? "Personal" : category.name}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm font-medium text-ink">
          {new Intl.NumberFormat("id-ID").format(txn.amount)}
        </div>
        <div className="ml-auto mt-1.5 flex h-1 w-[42px] overflow-hidden rounded-full">
          {txn.splitDaniel > 0 && (
            <div className="h-full bg-daniel" style={{ width: `${txn.splitDaniel}%` }} />
          )}
          {txn.splitAdel > 0 && (
            <div className="h-full bg-adel" style={{ width: `${txn.splitAdel}%` }} />
          )}
        </div>
      </div>
    </div>
  );
}
