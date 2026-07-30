"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

const SPLIT_STEP = 5;

function formatAmount(raw: string) {
  if (!raw) return "0";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

export default function NewGoalSheet() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [splitDaniel, setSplitDaniel] = useState(50);
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
    if (!name.trim()) {
      setError("Give this goal a name.");
      return;
    }
    const amountValue = Number(amount || "0");
    if (amountValue <= 0) {
      setError("Enter a target amount first.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("goals").insert({
      name: name.trim(),
      target_amount: amountValue,
      target_date: targetDate || null,
      contribution_daniel: splitDaniel,
      contribution_adel: 100 - splitDaniel,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/goals");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-end justify-center bg-ink/55 px-0 sm:px-4">
      <div className="w-full max-w-[480px] rounded-t-sheet bg-ivory px-6 pb-7 pt-3 shadow-sheet">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-gray-line" />
        <h1 className="mb-5 font-display text-[19px] font-medium text-ink">New goal</h1>

        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray">
          Name
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Home fund, honeymoon…"
          className="mb-5 w-full rounded-[12px] border-[0.5px] border-gray-line bg-card px-3.5 py-3 text-[13.5px] text-ink outline-none"
        />

        <div className="mb-5 text-center">
          <div className="font-mono text-[15px] text-gray">Target — Rp</div>
          <div className="font-mono text-[44px] font-semibold tracking-tight text-ink">
            {formatAmount(amount)}
          </div>
        </div>

        <Keypad onKey={handleKeypad} />

        <div className="mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-wider text-gray">
          Target date (optional)
        </div>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="mb-5 w-full rounded-[12px] border-[0.5px] border-gray-line bg-card px-3.5 py-3 text-[13.5px] text-ink outline-none"
        />

        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray">
          Contribution split
        </div>
        <div className="rounded-card border-[0.5px] border-gray-line bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between font-mono text-[12.5px]">
            <span className="font-semibold text-daniel">Daniel {splitDaniel}%</span>
            <span className="font-semibold text-adel">Adel {100 - splitDaniel}%</span>
          </div>
          <div className="relative flex h-[18px] items-center">
            <div
              className="pointer-events-none absolute inset-x-0 h-2.5 overflow-hidden rounded-full"
              style={{
                background: `linear-gradient(to right, #0F6E56 0%, #0F6E56 ${splitDaniel}%, #B4637A ${splitDaniel}%, #B4637A 100%)`,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={SPLIT_STEP}
              value={splitDaniel}
              onChange={(e) => setSplitDaniel(Number(e.target.value))}
              className="relative w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-white"
              aria-label="Daniel contribution percentage"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-[22px] w-full rounded-[14px] bg-ink py-4 text-[14.5px] font-medium tracking-wide text-ivory disabled:opacity-60"
        >
          {saving ? "Saving…" : "Create goal"}
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
