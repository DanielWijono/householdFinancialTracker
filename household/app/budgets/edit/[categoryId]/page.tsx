import { notFound } from "next/navigation";
import EditBudgetSheet from "../EditBudgetSheet";
import { createClient } from "../../../../lib/supabase/server";
import { getBudgetsForMonth, getCategories } from "../../../../lib/supabase/queries";

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const today = new Date();
  const monthStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)).toISOString().slice(0, 10);

  const supabase = await createClient();
  const [categories, budgets] = await Promise.all([
    getCategories(supabase),
    getBudgetsForMonth(supabase, today),
  ]);

  const category = categories.find((c) => c.id === categoryId);
  const budget = budgets.find((b) => b.categoryId === categoryId);
  if (!category || !budget) notFound();

  return <EditBudgetSheet category={category} monthStart={monthStart} initialAmount={budget.monthLimit} />;
}
