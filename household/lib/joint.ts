import type { JointContribution, Transaction } from "./mock-data";

export type JointBalance = {
  balance: number;
  contributedDaniel: number;
  contributedAdel: number;
  spent: number;
};

/**
 * Joint account balance = contributions in minus joint-paid spend out.
 * Mirrors a goal_contributions-style ledger, but tracks a running balance
 * instead of progress toward a fixed target.
 */
export function computeJointBalance(
  contributions: JointContribution[],
  transactions: Transaction[],
): JointBalance {
  const contributedDaniel = contributions
    .filter((c) => c.contributor === "daniel")
    .reduce((sum, c) => sum + c.amount, 0);
  const contributedAdel = contributions
    .filter((c) => c.contributor === "adel")
    .reduce((sum, c) => sum + c.amount, 0);
  const spent = transactions
    .filter((t) => t.paidBy === "joint")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    balance: contributedDaniel + contributedAdel - spent,
    contributedDaniel,
    contributedAdel,
    spent,
  };
}
