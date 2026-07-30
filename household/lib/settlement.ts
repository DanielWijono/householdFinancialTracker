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
 *
 * Joint-account transactions are excluded entirely: both paid the pool via
 * prior contributions, so there's nothing left to settle between them.
 */
export function computeSettlement(txns: Transaction[]): Settlement {
  let danielPaid = 0;
  let danielFairShare = 0;

  for (const t of txns) {
    if (t.paidBy === "joint") continue;
    if (t.paidBy === "daniel") danielPaid += t.amount;
    danielFairShare += Math.round((t.amount * t.splitDaniel) / 100);
  }

  const net = danielPaid - danielFairShare;

  if (net === 0) return { owedBy: null, amount: 0 };
  return net > 0 ? { owedBy: "adel", amount: net } : { owedBy: "daniel", amount: -net };
}

export type CategorySettlement = {
  categoryId: string;
  owedBy: "daniel" | "adel";
  amount: number;
};

/**
 * Same fair-share math as computeSettlement, but grouped per category so
 * the dashboard can show which categories actually drive the settlement.
 * Categories that net to zero are omitted.
 */
export function computeSettlementByCategory(txns: Transaction[]): CategorySettlement[] {
  const netByCategory = new Map<string, number>();

  for (const t of txns) {
    if (t.paidBy === "joint") continue;
    const danielPaid = t.paidBy === "daniel" ? t.amount : 0;
    const danielFairShare = Math.round((t.amount * t.splitDaniel) / 100);
    const net = danielPaid - danielFairShare;
    netByCategory.set(t.categoryId, (netByCategory.get(t.categoryId) ?? 0) + net);
  }

  const result: CategorySettlement[] = [];
  for (const [categoryId, net] of netByCategory) {
    if (net === 0) continue;
    result.push({
      categoryId,
      owedBy: net > 0 ? "adel" : "daniel",
      amount: Math.abs(net),
    });
  }
  return result.sort((a, b) => b.amount - a.amount);
}

export function formatIDR(amount: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(amount)}`;
}
