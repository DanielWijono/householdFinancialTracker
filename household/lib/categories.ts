// Mock category data until Supabase `categories` table is wired up.
// Shape mirrors the CLAUDE.md data model: default_split_daniel / default_split_adel sum to 100.

export type Category = {
  id: string;
  name: string;
  icon: string;
  defaultSplitDaniel: number;
  defaultSplitAdel: number;
};

export const categories: Category[] = [
  { id: "groceries", name: "Groceries", icon: "🛒", defaultSplitDaniel: 50, defaultSplitAdel: 50 },
  { id: "transport", name: "Transport", icon: "🚗", defaultSplitDaniel: 70, defaultSplitAdel: 30 },
  { id: "dining", name: "Dining", icon: "🍽️", defaultSplitDaniel: 50, defaultSplitAdel: 50 },
  { id: "wedding", name: "Wedding", icon: "💍", defaultSplitDaniel: 50, defaultSplitAdel: 50 },
  { id: "gym", name: "Gym", icon: "🏋️", defaultSplitDaniel: 100, defaultSplitAdel: 0 },
  { id: "rent", name: "Rent", icon: "🏠", defaultSplitDaniel: 50, defaultSplitAdel: 50 },
  { id: "utilities", name: "Utilities", icon: "💡", defaultSplitDaniel: 50, defaultSplitAdel: 50 },
];
