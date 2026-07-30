// Mock transactions/budgets/goals until Supabase is wired up (needs Auth first).

export type Person = "daniel" | "adel" | "joint";

export type Transaction = {
  id: string;
  categoryId: string;
  amount: number;
  paidBy: Person;
  splitDaniel: number;
  splitAdel: number;
  note: string;
  date: string; // ISO date
};

export const transactions: Transaction[] = [
  { id: "t1", categoryId: "groceries", amount: 340000, paidBy: "adel", splitDaniel: 50, splitAdel: 50, note: "Superindo — weekly groceries", date: "2026-07-13" },
  { id: "t3", categoryId: "transport-daniel", amount: 200000, paidBy: "daniel", splitDaniel: 100, splitAdel: 0, note: "Pertamina — fuel", date: "2026-07-12" },
  { id: "t4", categoryId: "gym", amount: 450000, paidBy: "daniel", splitDaniel: 100, splitAdel: 0, note: "Gym membership", date: "2026-07-12" },
  { id: "t5", categoryId: "groceries", amount: 1760000, paidBy: "daniel", splitDaniel: 50, splitAdel: 50, note: "Monthly groceries run", date: "2026-07-05" },
  { id: "t6", categoryId: "transport-adel", amount: 1650000, paidBy: "adel", splitDaniel: 0, splitAdel: 100, note: "Car service", date: "2026-07-03" },
  { id: "t7", categoryId: "dining", amount: 650000, paidBy: "adel", splitDaniel: 50, splitAdel: 50, note: "Dinner — Plataran", date: "2026-07-09" },
  { id: "t8", categoryId: "skincare", amount: 550000, paidBy: "adel", splitDaniel: 0, splitAdel: 100, note: "Skincare restock", date: "2026-07-09" },
  { id: "t9", categoryId: "groceries", amount: 900000, paidBy: "joint", splitDaniel: 50, splitAdel: 50, note: "Groceries — joint account", date: "2026-07-08" },
];

export type Budget = {
  categoryId: string;
  monthLimit: number;
};

export const budgets: Budget[] = [
  { categoryId: "groceries", monthLimit: 2500000 },
  { categoryId: "transport-daniel", monthLimit: 1000000 },
  { categoryId: "transport-adel", monthLimit: 500000 },
  { categoryId: "utilities", monthLimit: 1500000 },
  { categoryId: "gym", monthLimit: 500000 },
  { categoryId: "skincare", monthLimit: 1000000 },
];

// Deposits into the shared joint savings account. Balance = contributions
// minus joint-paid transactions (see lib/joint.ts).
export type JointContribution = {
  id: string;
  contributor: "daniel" | "adel";
  amount: number;
  note: string;
  date: string; // ISO date
};

export const jointContributions: JointContribution[] = [
  { id: "jc1", contributor: "daniel", amount: 5_000_000, note: "Monthly top-up", date: "2026-07-01" },
  { id: "jc2", contributor: "adel", amount: 5_000_000, note: "Monthly top-up", date: "2026-07-01" },
];

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null; // ISO date, projected
};

export const goals: Goal[] = [
  { id: "g1", name: "Home fund", targetAmount: 450_000_000, currentAmount: 180_000_000, targetDate: "2028-03-01" },
  { id: "g2", name: "Honeymoon", targetAmount: 45_000_000, currentAmount: 32_000_000, targetDate: "2026-11-01" },
  { id: "g3", name: "Emergency", targetAmount: 30_000_000, currentAmount: 8_000_000, targetDate: "2027-06-01" },
];
