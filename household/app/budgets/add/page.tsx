import AddBudgetSheet from "../AddBudgetSheet";
import { createClient } from "../../../lib/supabase/server";
import { getBudgetsForMonth, getCategories } from "../../../lib/supabase/queries";

export default async function AddBudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const today = new Date();
  const monthStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)).toISOString().slice(0, 10);

  const supabase = await createClient();
  const [categories, budgets] = await Promise.all([
    getCategories(supabase),
    getBudgetsForMonth(supabase, today),
  ]);

  const budgetedIds = new Set(budgets.map((b) => b.categoryId));
  let available = categories.filter((c) => !budgetedIds.has(c.id));
  if (section === "shared") available = available.filter((c) => !c.isPersonal);
  if (section === "personal") available = available.filter((c) => c.isPersonal);

  return <AddBudgetSheet categories={available} monthStart={monthStart} />;
}
