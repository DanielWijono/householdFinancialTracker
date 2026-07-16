import type { Transaction } from "./mock-data";

export type Settlement = {
  // Positive amount, owed by `owedBy` to the other person. Null amount means settled.
  owedBy: "daniel" | "adel" | null;
  amount: number;
};

/**
 * spend × split_ratio = fair share per person, compared against paid_by totals.
 * splitAdel is derived as (amount - danielShare) rather than its own round()
 * so the two shares always sum exactly to the transaction amount — no
 * rupiah lost or gained to independent rounding.
 */
export function computeSettlement(txns: Transaction[]): Settlement {
  let danielPaid = 0;
  let danielFairShare = 0;

  for (const t of txns) {
    if (t.paidBy === "daniel") danielPaid += t.amount;
    danielFairShare += Math.round((t.amount * t.splitDaniel) / 100);
  }

  const net = danielPaid - danielFairShare;

  if (net === 0) return { owedBy: null, amount: 0 };
  return net > 0 ? { owedBy: "adel", amount: net } : { owedBy: "daniel", amount: -net };
}

export function formatIDR(amount: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}
