"use client";

import { useMemo, useState } from "react";
import { categories } from "../../lib/categories";

type Person = "daniel" | "adel";

const SPLIT_STEP = 5;

function formatAmount(raw: string) {
  if (!raw) return "0";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

export default function AddTransactionSheet() {
  const [amount, setAmount] = useState(""); // raw digits, e.g. "125000"
  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [splitDaniel, setSplitDaniel] = useState(categories[0].defaultSplitDaniel);
  const [paidBy, setPaidBy] = useState<Person>("daniel");
  const [note, setNote] = useState("");

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId)!,
    [categoryId],
  );
  const splitAdel = 100 - splitDaniel;

  function selectCategory(id: string) {
    setCategoryId(id);
    const cat = categories.find((c) => c.id === id)!;
    setSplitDaniel(cat.defaultSplitDaniel);
  }

  function handleKeypad(key: string) {
    if (key === "back") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    setAmount((a) => (a + key).slice(0, 12));
  }

  function handleSave() {
    const payload = {
      categoryId,
      amount: Number(amount || "0"),
      splitDaniel,
      splitAdel,
      paidBy,
      note,
      date: new Date().toISOString(),
    };
    // Supabase insert wiring pending — log for now.
    console.log("save transaction", payload);
  }

  return (
    <div className="flex min-h-screen items-end justify-center bg-ink/55 px-0 sm:px-4">
      <div className="w-full max-w-[480px] rounded-t-sheet bg-ivory px-6 pb-7 pt-3 shadow-sheet">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-gray-line" />
        <h1 className="mb-5 font-display text-[19px] font-medium text-ink">Add transaction</h1>

        <div className="mb-5 text-center">
          <div className="font-mono text-[15px] text-gray">Rp</div>
          <div className="font-mono text-[44px] font-semibold tracking-tight text-ink">
            {formatAmount(amount)}
          </div>
        </div>

        <Keypad onKey={handleKeypad} />

        <div className="mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-wider text-gray">
          Category
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {categories.map((c) => {
            const active = c.id === categoryId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCategory(c.id)}
                className={`rounded-chip border px-1.5 py-3 text-center ${
                  active
                    ? "border-[1.5px] border-daniel bg-daniel-bg"
                    : "border-[0.5px] border-gray-line bg-card"
                }`}
              >
                <div className="mb-1 text-lg">{c.icon}</div>
                <div className="text-[10.5px] font-medium text-ink-soft">{c.name}</div>
              </button>
            );
          })}
        </div>

        <div className="mb-2.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray">
          Split
        </div>
        <div className="rounded-card border-[0.5px] border-gray-line bg-card p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[13px] font-medium text-ink">{category.name} split</span>
            <span className="font-mono text-[12.5px]">
              <span className="font-semibold text-daniel">Daniel {splitDaniel}%</span>
              {" · "}
              <span className="font-semibold text-adel">Adel {splitAdel}%</span>
            </span>
          </div>

          <div
            className="relative h-2.5 overflow-hidden rounded-full"
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
            className="mt-[-10px] h-2.5 w-full cursor-pointer opacity-0"
            aria-label="Daniel split percentage"
          />
          <p className="mt-2 text-[11px] text-gray">Drag to override for this transaction only</p>
        </div>

        <div className="mb-2.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray">
          Paid by
        </div>
        <div className="flex gap-2.5">
          {(["daniel", "adel"] as Person[]).map((p) => {
            const active = paidBy === p;
            const isDaniel = p === "daniel";
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPaidBy(p)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] border bg-card px-3 py-3 text-[13px] font-medium ${
                  active ? "border-[1.5px] border-ink" : "border-[0.5px] border-gray-line"
                }`}
              >
                <span
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-semibold text-white"
                  style={{ background: isDaniel ? "#0F6E56" : "#B4637A" }}
                >
                  {isDaniel ? "D" : "A"}
                </span>
                {isDaniel ? "Daniel" : "Adel"}
              </button>
            );
          })}
        </div>

        <div className="mb-2.5 mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray">
          Note
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was this for?"
          className="w-full rounded-[12px] border-[0.5px] border-gray-line bg-card px-3.5 py-3 text-[13.5px] text-ink outline-none"
        />

        <button
          type="button"
          onClick={handleSave}
          className="mt-[22px] w-full rounded-[14px] bg-ink py-4 text-[14.5px] font-medium tracking-wide text-ivory"
        >
          Save transaction
        </button>
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
