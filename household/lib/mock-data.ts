// Mock transactions/budgets/goals until Supabase is wired up (needs Auth first).

export type Person = "daniel" | "adel";

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
  { id: "t2", categoryId: "wedding", amount: 1500000, paidBy: "daniel", splitDaniel: 50, splitAdel: 50, note: "Vendor DP — florist", date: "2026-07-13" },
  { id: "t3", categoryId: "transport", amount: 200000, paidBy: "daniel", splitDaniel: 70, splitAdel: 30, note: "Pertamina — fuel", date: "2026-07-12" },
  { id: "t4", categoryId: "gym", amount: 450000, paidBy: "daniel", splitDaniel: 100, splitAdel: 0, note: "Gym membership", date: "2026-07-12" },
  { id: "t5", categoryId: "groceries", amount: 1760000, paidBy: "daniel", splitDaniel: 50, splitAdel: 50, note: "Monthly groceries run", date: "2026-07-05" },
  { id: "t6", categoryId: "transport", amount: 1650000, paidBy: "adel", splitDaniel: 70, splitAdel: 30, note: "Car service", date: "2026-07-03" },
  { id: "t7", categoryId: "dining", amount: 650000, paidBy: "adel", splitDaniel: 50, splitAdel: 50, note: "Dinner — Plataran", date: "2026-07-09" },
  { id: "t8", categoryId: "skincare", amount: 550000, paidBy: "adel", splitDaniel: 0, splitAdel: 100, note: "Skincare restock", date: "2026-07-09" },
];

export type Budget = {
  categoryId: string;
  monthLimit: number;
};

export const budgets: Budget[] = [
  { categoryId: "groceries", monthLimit: 2500000 },
  { categoryId: "transport", monthLimit: 1500000 },
  { categoryId: "utilities", monthLimit: 1500000 },
  { categoryId: "wedding", monthLimit: 5000000 },
  { categoryId: "gym", monthLimit: 500000 },
  { categoryId: "skincare", monthLimit: 1000000 },
];

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date, projected
};

export const goals: Goal[] = [
  { id: "g1", name: "Home fund", targetAmount: 450_000_000, currentAmount: 180_000_000, targetDate: "2028-03-01" },
  { id: "g2", name: "Honeymoon", targetAmount: 45_000_000, currentAmount: 32_000_000, targetDate: "2026-11-01" },
  { id: "g3", name: "Emergency", targetAmount: 30_000_000, currentAmount: 8_000_000, targetDate: "2027-06-01" },
];
