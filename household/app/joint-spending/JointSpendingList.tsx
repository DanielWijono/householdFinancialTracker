"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "../../lib/categories";
import type { Transaction } from "../../lib/mock-data";
import { formatIDR } from "../../lib/settlement";
import { createClient } from "../../lib/supabase/client";

function todayISO() {
  const d = new Date();
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

function shortDate(iso: string) {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function JointSpendingList({
  jointTxns,
  categories,
}: {
  jointTxns: Transaction[];
  categories: Category[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function categoryOf(id: string) {
    return categories.find((c) => c.id === id)!;
  }

  async function patch(id: string, fields: { reimbursed: boolean; reimbursed_date: string | null }) {
    setError("");
    setPendingId(id);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("transactions")
      .update(fields)
      .eq("id", id);
    setPendingId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-card border-[0.5px] border-gray-line bg-card px-[18px] py-1">
      {jointTxns.map((t) => {
        const category = categoryOf(t.categoryId);
        const busy = pendingId === t.id;
        return (
          <div
            key={t.id}
            className="border-b-[0.5px] border-gray-line py-3.5 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-daniel-bg text-base">
                {category.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="break-words text-[13.5px] font-medium text-ink">
                  {t.note || category.name}
                </div>
                <div className="mt-0.5 text-[11.5px] text-gray">
                  {shortDate(t.date)} · {category.name}
                </div>
              </div>
              <div className="font-mono text-sm font-medium text-ink">
                {formatIDR(t.amount)}
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-2 pl-12">
              {t.reimbursed ? (
                <>
                  <span className="rounded-full bg-gold-bg px-2.5 py-1 text-[11px] font-medium text-gold-text">
                    ✓ Reimbursed{t.reimbursedDate ? ` ${shortDate(t.reimbursedDate)}` : ""}
                  </span>
                  <input
                    type="date"
                    value={t.reimbursedDate ?? todayISO()}
                    max={todayISO()}
                    disabled={busy}
                    onChange={(e) =>
                      patch(t.id, {
                        reimbursed: true,
                        reimbursed_date: e.target.value || null,
                      })
                    }
                    aria-label="Reimbursed date"
                    className="rounded-[10px] border-[0.5px] border-gray-line bg-card px-2 py-1 text-[11.5px] text-ink outline-none disabled:opacity-60"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => patch(t.id, { reimbursed: false, reimbursed_date: null })}
                    className="text-[11.5px] font-medium text-gray underline disabled:opacity-60"
                  >
                    Undo
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    patch(t.id, { reimbursed: true, reimbursed_date: todayISO() })
                  }
                  className="rounded-full border-[0.5px] border-gray-line px-3 py-1 text-[11.5px] font-medium text-terracotta disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Mark reimbursed"}
                </button>
              )}
            </div>
          </div>
        );
      })}
      {error && <p className="py-2 text-center text-[12.5px] text-terracotta">{error}</p>}
    </div>
  );
}
