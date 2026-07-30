"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Contributor = "daniel" | "adel";

const CONTRIBUTOR_META: Record<Contributor, { label: string; letter: string; color: string }> = {
  daniel: { label: "Daniel", letter: "D", color: "#0F6E56" },
  adel: { label: "Adel", letter: "A", color: "#B4637A" },
};

function formatAmount(raw: string) {
  if (!raw) return "0";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

export default function AddJointContributionSheet() {
  const router = useRouter();
  const [amount, setAmount] = useState(""); // raw digits, e.g. "125000"
  const [contributor, setContributor] = useState<Contributor>("daniel");
  const [note, setNote] = useState("");
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
    const { error: insertError } = await supabase.from("joint_contributions").insert({
      contributor,
      amount: amountValue,
      note: note || null,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-end justify-center bg-ink/55 px-0 sm:px-4">
      <div className="w-full max-w-[480px] rounded-t-sheet bg-ivory px-6 pb-7 pt-3 shadow-sheet">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-gray-line" />
        <h1 className="mb-5 font-display text-[19px] font-medium text-ink">Add joint contribution</h1>

        <div className="mb-5 text-center">
          <div className="font-mono text-[15px] text-gray">Rp</div>
          <div className="font-mono text-[44px] font-semibold tracking-tight text-ink">
            {formatAmount(amount)}
          </div>
        </div>

        <Keypad onKey={handleKeypad} />

        <div className="mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-wider text-gray">
          Contributed by
        </div>
        <div className="flex gap-2">
          {(["daniel", "adel"] as Contributor[]).map((p) => {
            const active = contributor === p;
            const meta = CONTRIBUTOR_META[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setContributor(p)}
                className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-[12px] border bg-card px-2 py-3 text-[12px] font-medium ${
                  active ? "border-[1.5px] border-ink" : "border-[0.5px] border-gray-line"
                }`}
              >
                <span
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-semibold text-white"
                  style={{ background: meta.color }}
                >
                  {meta.letter}
                </span>
                {meta.label}
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
          disabled={saving}
          className="mt-[22px] w-full rounded-[14px] bg-ink py-4 text-[14.5px] font-medium tracking-wide text-ivory disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save contribution"}
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
