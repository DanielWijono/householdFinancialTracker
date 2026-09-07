"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import type { Transaction } from "../../lib/mock-data";
import type { Category } from "../../lib/categories";
import { formatIDR } from "../../lib/settlement";
import { setReimbursed } from "./actions";

function todayISO() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function fullDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function ReimbursementQueue({ transactions, categories }: {
  transactions: Transaction[];
  categories: Category[];
}) {
  const [lastMarked, setLastMarked] = useState<Transaction | null>(null);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();
  const locked = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  function save(transaction: Transaction, undo = false) {
    if (locked.current) return;
    locked.current = true;
    setError("");
    setPendingId(transaction.id);
    startTransition(async () => {
      try {
        const result = await setReimbursed(transaction.id, undo ? null : todayISO());
        if (result.error) {
          setError(result.error);
          return;
        }
        setLastMarked(undo ? null : transaction);
        // The action refreshes server props and all shortcut totals together.
        requestAnimationFrame(() => statusRef.current?.focus());
      } catch {
        setError("Could not save reimbursement. Please try again.");
      } finally {
        locked.current = false;
        setPendingId(null);
      }
    });
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-ivory pb-24">
      <header className="px-6 pb-6 pt-8">
        <Link href="/" className="mb-4 inline-block py-1 text-[13px] font-medium text-gray">← Dashboard</Link>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray">All months · Oldest first</div>
        <h1 className="font-display text-[24px] font-medium text-ink">Awaiting reimbursement</h1>
        <div className="mt-3 break-words font-mono text-[36px] font-semibold tracking-tight text-ink">{formatIDR(total)}</div>
        <p className="mt-1 text-[13px] text-ink-soft" aria-live="polite">{transactions.length} {transactions.length === 1 ? "transaction" : "transactions"} pending</p>
      </header>

      <div ref={statusRef} tabIndex={-1} className="mx-5 outline-none" aria-live="polite">
        {lastMarked && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-card bg-gold-bg px-4 py-3 text-[13px] text-ink">
            <span className="min-w-0 break-words">✓ {lastMarked.note || "Transaction"} reimbursed</span>
            <button type="button" disabled={saving} onClick={() => save(lastMarked, true)} className="min-h-11 shrink-0 px-2 font-semibold underline disabled:opacity-50">Undo</button>
          </div>
        )}
      </div>
      {error && <p role="alert" className="mx-5 mb-4 rounded-card border border-terracotta px-4 py-3 text-sm text-terracotta">{error} Use the same action to retry.</p>}

      <section aria-label="Pending reimbursements" aria-busy={saving} className="px-5">
        {transactions.length === 0 ? (
          <div className="rounded-card border-[0.5px] border-gray-line bg-card px-5 py-10 text-center text-sm text-ink-soft">All caught up—no reimbursements awaiting payment</div>
        ) : (
          <div className="rounded-card border-[0.5px] border-gray-line bg-card px-[18px]">
            {transactions.map((transaction) => {
              const category = categories.find((c) => c.id === transaction.categoryId);
              return (
                <article key={transaction.id} className="border-b-[0.5px] border-gray-line py-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-gold-bg">{category?.icon ?? "•"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="break-words text-sm font-medium text-ink">{transaction.note || category?.name || "Transaction"}</div>
                      <div className="mt-1 text-xs text-gray"><time dateTime={transaction.date}>{fullDate(transaction.date)}</time> · {category?.name ?? "Uncategorized"}</div>
                      <div className="mt-2 break-words font-mono text-sm font-medium text-ink">{formatIDR(transaction.amount)}</div>
                      <button type="button" disabled={saving} onClick={() => save(transaction)} className="mt-3 min-h-11 rounded-full border-[0.5px] border-gray-line px-4 py-2 text-xs font-medium text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50">
                        {saving && pendingId === transaction.id ? "Saving…" : "Mark reimbursed"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
