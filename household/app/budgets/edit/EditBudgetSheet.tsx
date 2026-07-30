"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "../../../lib/categories";
import { createClient } from "../../../lib/supabase/client";

function formatAmount(raw: string) {
  if (!raw) return "0";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

export default function EditBudgetSheet({
  category,
  monthStart,
  initialAmount,
}: {
  category: Category;
  monthStart: string; // ISO date, 1st of month
  initialAmount: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(initialAmount));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function handleKeypad(key: string) {
    if (key === "back") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    setAmount((a) => (a + key).slice(0, 12));
  }

  async function handleSave() {
    setError("");
    const amountValue = Number(amount || "0");
    if (amountValue <= 0) {
      setError("Enter an amount first.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: upsertError } = await supabase.from("budgets").upsert(
      {
        category_id: category.id,
        month: monthStart,
        amount_limit: amountValue,
      },
      { onConflict: "category_id,month" },
    );
    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    router.push("/budgets");
    router.refresh();
  }

  async function handleDelete() {
    setError("");
    setDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("budgets")
      .delete()
      .eq("category_id", category.id)
      .eq("month", monthStart);
    setDeleting(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.push("/budgets");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-end justify-center bg-ink/55 px-0 sm:px-4">
      <div className="w-full max-w-[480px] rounded-t-sheet bg-ivory px-6 pb-7 pt-3 shadow-sheet">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-gray-line" />
        <h1 className="mb-5 font-display text-[19px] font-medium text-ink">Edit budget</h1>

        <div className="mb-5 flex items-center gap-2.5 rounded-[12px] border-[0.5px] border-gray-line bg-card px-3 py-3 text-[13px] font-medium">
          <span className="text-[16px]">{category.icon}</span>
          {category.name}
        </div>

        <div className="mb-5 text-center">
          <div className="font-mono text-[15px] text-gray">Rp</div>
          <div className="font-mono text-[44px] font-semibold tracking-tight text-ink">
            {formatAmount(amount)}
          </div>
        </div>

        <Keypad onKey={handleKeypad} />

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || deleting}
          className="mt-[22px] w-full rounded-[14px] bg-ink py-4 text-[14.5px] font-medium tracking-wide text-ivory disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save budget"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="mt-2.5 w-full rounded-[14px] border-[0.5px] border-gray-line py-4 text-[14.5px] font-medium tracking-wide text-terracotta disabled:opacity-60"
        >
          {deleting ? "Removing…" : "Remove budget"}
        </button>
        {error && <p className="mt-2.5 text-center text-[12.5px] text-terracotta">{error}</p>}
      </div>
    </div>
  );
}

function Keypad({ onKey }: { onKey: (key: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "back"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          className="rounded-chip bg-card py-3 font-mono text-lg text-ink"
        >
          {k === "back" ? "⌫" : k}
        </button>
      ))}
    </div>
  );
}
