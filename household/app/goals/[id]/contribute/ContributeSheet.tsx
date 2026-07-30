"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import type { Goal } from "../../../../lib/mock-data";

function formatAmount(raw: string) {
  if (!raw) return "0";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

export default function ContributeSheet({ goal }: { goal: Goal }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("Not signed in.");
      return;
    }

    const { error: insertError } = await supabase.from("goal_contributions").insert({
      goal_id: goal.id,
      contributor: user.id,
      amount: amountValue,
    });
    if (insertError) {
      setSaving(false);
      setError(insertError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("goals")
      .update({ current_amount: goal.currentAmount + amountValue })
      .eq("id", goal.id);
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/goals");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-end justify-center bg-ink/55 px-0 sm:px-4">
      <div className="w-full max-w-[480px] rounded-t-sheet bg-ivory px-6 pb-7 pt-3 shadow-sheet">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-gray-line" />
        <h1 className="mb-1 font-display text-[19px] font-medium text-ink">{goal.name}</h1>
        <p className="mb-5 text-[13px] text-gray">
          {new Intl.NumberFormat("id-ID").format(goal.currentAmount)} /{" "}
          {new Intl.NumberFormat("id-ID").format(goal.targetAmount)} so far
        </p>

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
          disabled={saving}
          className="mt-[22px] w-full rounded-[14px] bg-ink py-4 text-[14.5px] font-medium tracking-wide text-ivory disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add contribution"}
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
