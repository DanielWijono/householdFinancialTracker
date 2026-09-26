import { describe, expect, it } from "vitest";
import type { Transaction } from "./mock-data";
import { computeSettlement, computeSettlementByCategory } from "./settlement";

let seq = 0;
function txn(overrides: Partial<Transaction>): Transaction {
  seq += 1;
  return {
    id: `t${seq}`,
    categoryId: "dining",
    amount: 100000,
    paidBy: "daniel",
    splitDaniel: 50,
    splitAdel: 50,
    note: "",
    date: "2026-09-01",
    reimbursed: false,
    reimbursedDate: null,
    createdBy: null,
    ...overrides,
  };
}

describe("computeSettlement", () => {
  it("is settled with no transactions", () => {
    expect(computeSettlement([])).toEqual({ owedBy: null, amount: 0 });
  });

  it("makes Adel owe her share when Daniel pays a 50/50 expense", () => {
    expect(computeSettlement([txn({ paidBy: "daniel", amount: 100000 })])).toEqual({
      owedBy: "adel",
      amount: 50000,
    });
  });

  it("makes Daniel owe his share when Adel pays a 50/50 expense", () => {
    expect(computeSettlement([txn({ paidBy: "adel", amount: 100000 })])).toEqual({
      owedBy: "daniel",
      amount: 50000,
    });
  });

  it("respects uneven splits", () => {
    const t = txn({ paidBy: "adel", amount: 200000, splitDaniel: 70, splitAdel: 30 });
    expect(computeSettlement([t])).toEqual({ owedBy: "daniel", amount: 140000 });
  });

  it("ignores personal expenses paid by their owner", () => {
    const gym = txn({ paidBy: "daniel", splitDaniel: 100, splitAdel: 0 });
    const salon = txn({ paidBy: "adel", splitDaniel: 0, splitAdel: 100 });
    expect(computeSettlement([gym, salon])).toEqual({ owedBy: null, amount: 0 });
  });

  it("charges the full amount when one person pays the other's personal expense", () => {
    const t = txn({ paidBy: "adel", amount: 75000, splitDaniel: 100, splitAdel: 0 });
    expect(computeSettlement([t])).toEqual({ owedBy: "daniel", amount: 75000 });
  });

  it("excludes joint-account transactions entirely", () => {
    const t = txn({ paidBy: "joint", amount: 999999, splitDaniel: 70, splitAdel: 30 });
    expect(computeSettlement([t])).toEqual({ owedBy: null, amount: 0 });
  });

  it("nets opposing debts against each other", () => {
    const a = txn({ paidBy: "daniel", amount: 300000 }); // Adel owes 150k
    const b = txn({ paidBy: "adel", amount: 100000 }); // Daniel owes 50k
    expect(computeSettlement([a, b])).toEqual({ owedBy: "adel", amount: 100000 });
  });

  it("settles exactly when opposing debts cancel", () => {
    const a = txn({ paidBy: "daniel", amount: 100000 });
    const b = txn({ paidBy: "adel", amount: 100000 });
    expect(computeSettlement([a, b])).toEqual({ owedBy: null, amount: 0 });
  });

  describe("rounding", () => {
    it("rounds Daniel's share of an odd amount half-up", () => {
      // Daniel's share = round(50.5) = 51, so Adel's share is 50.
      expect(computeSettlement([txn({ paidBy: "daniel", amount: 101 })])).toEqual({
        owedBy: "adel",
        amount: 50,
      });
      expect(computeSettlement([txn({ paidBy: "adel", amount: 101 })])).toEqual({
        owedBy: "daniel",
        amount: 51,
      });
    });

    it("never loses a rupiah: both payer views add up to the full amount", () => {
      for (const splitDaniel of [5, 35, 55, 95]) {
        const amount = 999;
        const base = { amount, splitDaniel, splitAdel: 100 - splitDaniel };
        const danielPaid = computeSettlement([txn({ ...base, paidBy: "daniel" })]);
        const adelPaid = computeSettlement([txn({ ...base, paidBy: "adel" })]);
        // Adel's share (owed when Daniel pays) + Daniel's share (owed when Adel pays) = amount.
        expect(danielPaid.amount + adelPaid.amount).toBe(amount);
      }
    });

    it("rounds per transaction, not on the monthly total", () => {
      // Each 55/45 split of 999 gives Daniel round(549.45) = 549.
      const ts = [1, 2, 3].map(() => txn({ paidBy: "adel", amount: 999, splitDaniel: 55, splitAdel: 45 }));
      expect(computeSettlement(ts)).toEqual({ owedBy: "daniel", amount: 549 * 3 });
    });

    it("handles decimal amounts from numeric(12,2)", () => {
      const t = txn({ paidBy: "daniel", amount: 10000.5 });
      // Daniel's share = round(5000.25) = 5000; Adel owes 10000.5 - 5000.
      expect(computeSettlement([t])).toEqual({ owedBy: "adel", amount: 5000.5 });
    });
  });
});

describe("computeSettlementByCategory", () => {
  it("returns nothing when everything is settled", () => {
    expect(computeSettlementByCategory([])).toEqual([]);
  });

  it("omits categories that net to zero and sorts the rest by amount", () => {
    const result = computeSettlementByCategory([
      txn({ categoryId: "dining", paidBy: "daniel", amount: 100000 }),
      txn({ categoryId: "dining", paidBy: "adel", amount: 100000 }),
      txn({ categoryId: "groceries", paidBy: "daniel", amount: 200000 }),
      txn({ categoryId: "utilities", paidBy: "adel", amount: 600000 }),
    ]);
    expect(result.map((c) => [c.categoryId, c.owedBy, c.amount])).toEqual([
      ["utilities", "daniel", 300000],
      ["groceries", "adel", 100000],
    ]);
  });

  it("agrees with computeSettlement on the overall net", () => {
    const ts = [
      txn({ categoryId: "dining", paidBy: "daniel", amount: 333333, splitDaniel: 55, splitAdel: 45 }),
      txn({ categoryId: "groceries", paidBy: "adel", amount: 101 }),
      txn({ categoryId: "transport", paidBy: "adel", amount: 70000, splitDaniel: 70, splitAdel: 30 }),
      txn({ categoryId: "gym", paidBy: "daniel", splitDaniel: 100, splitAdel: 0 }),
      txn({ categoryId: "rent", paidBy: "joint", amount: 5000000 }),
    ];
    const total = computeSettlement(ts);
    const signedTotal = total.owedBy === "adel" ? total.amount : -total.amount;
    const signedByCategory = computeSettlementByCategory(ts).reduce(
      (sum, c) => sum + (c.owedBy === "adel" ? c.amount : -c.amount),
      0,
    );
    expect(signedByCategory).toBe(signedTotal);
  });

  describe("items", () => {
    it("lists contributing transactions with signed net, newest first", () => {
      const older = txn({ paidBy: "daniel", amount: 100000, date: "2026-09-02" });
      const newer = txn({ paidBy: "adel", amount: 40000, date: "2026-09-20" });
      const [dining] = computeSettlementByCategory([older, newer]);
      expect(dining.items).toEqual([
        { txn: newer, net: -20000 },
        { txn: older, net: 50000 },
      ]);
    });

    it("item nets sum to the category amount", () => {
      const ts = [
        txn({ paidBy: "daniel", amount: 250000, date: "2026-09-03" }),
        txn({ paidBy: "adel", amount: 80000, date: "2026-09-10" }),
        txn({ paidBy: "daniel", amount: 999, splitDaniel: 55, splitAdel: 45, date: "2026-09-12" }),
      ];
      const [dining] = computeSettlementByCategory(ts);
      const sum = dining.items.reduce((s, i) => s + i.net, 0);
      expect(dining.owedBy === "adel" ? sum : -sum).toBe(dining.amount);
    });

    it("leaves out transactions that don't move the settlement", () => {
      const own = txn({ paidBy: "daniel", splitDaniel: 100, splitAdel: 0 });
      const joint = txn({ paidBy: "joint" });
      const shared = txn({ paidBy: "adel", amount: 60000 });
      const [dining] = computeSettlementByCategory([own, joint, shared]);
      expect(dining.items.map((i) => i.txn)).toEqual([shared]);
    });
  });
});
