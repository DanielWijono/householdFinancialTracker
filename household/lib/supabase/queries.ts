import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "../categories";
import type { Budget, Goal, JointContribution, Transaction } from "../mock-data";

// PostgREST embeds `creator:household_users(name)` as either an object or a
// single-element array depending on how it infers the relationship. Normalise
// both to the member name.
function creatorName(creator: unknown): "daniel" | "adel" | null {
  const c = Array.isArray(creator) ? creator[0] : creator;
  const name = (c as { name?: string } | null | undefined)?.name;
  return name === "daniel" || name === "adel" ? name : null;
}

function monthRange(monthStart: Date) {
  const start = new Date(Date.UTC(monthStart.getFullYear(), monthStart.getMonth(), 1));
  const end = new Date(Date.UTC(monthStart.getFullYear(), monthStart.getMonth() + 1, 1));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export async function getCategories(supabase: SupabaseClient): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, default_split_daniel, default_split_adel, is_personal")
    .order("created_at");
  if (error) throw error;

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    defaultSplitDaniel: c.default_split_daniel,
    defaultSplitAdel: c.default_split_adel,
    isPersonal: c.is_personal,
  }));
}

export async function getTransactionsForMonth(
  supabase: SupabaseClient,
  monthStart: Date,
): Promise<Transaction[]> {
  const { start, end } = monthRange(monthStart);
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, category_id, amount, paid_by, split_daniel, split_adel, note, date, reimbursed, reimbursed_date, created_by, creator:household_users(name)",
    )
    .gte("date", start)
    .lt("date", end)
    .order("date", { ascending: false });
  if (error) throw error;

  return data.map((t) => ({
    id: t.id,
    categoryId: t.category_id,
    amount: Number(t.amount),
    paidBy: t.paid_by,
    splitDaniel: t.split_daniel,
    splitAdel: t.split_adel,
    note: t.note ?? "",
    date: t.date,
    reimbursed: t.reimbursed ?? false,
    reimbursedDate: t.reimbursed_date ?? null,
    createdBy: creatorName(t.creator),
  }));
}

export async function getTransactionById(
  supabase: SupabaseClient,
  id: string,
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, category_id, amount, paid_by, split_daniel, split_adel, note, date, reimbursed, reimbursed_date, created_by, creator:household_users(name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    categoryId: data.category_id,
    amount: Number(data.amount),
    paidBy: data.paid_by,
    splitDaniel: data.split_daniel,
    splitAdel: data.split_adel,
    note: data.note ?? "",
    date: data.date,
    reimbursed: data.reimbursed ?? false,
    reimbursedDate: data.reimbursed_date ?? null,
    createdBy: creatorName(data.creator),
  };
}

export async function getBudgetsForMonth(
  supabase: SupabaseClient,
  monthStart: Date,
): Promise<Budget[]> {
  const { start } = monthRange(monthStart);
  const { data, error } = await supabase
    .from("budgets")
    .select("category_id, amount_limit")
    .eq("month", start);
  if (error) throw error;

  return data.map((b) => ({
    categoryId: b.category_id,
    monthLimit: Number(b.amount_limit),
  }));
}

export async function getGoals(supabase: SupabaseClient): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("id, name, target_amount, current_amount, target_date")
    .order("created_at");
  if (error) throw error;

  return data.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: Number(g.target_amount),
    currentAmount: Number(g.current_amount),
    targetDate: g.target_date,
  }));
}

export async function getDashboardData(
  supabase: SupabaseClient,
  monthStart: Date,
): Promise<{
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}> {
  const { start } = monthRange(monthStart);
  const { data, error } = await supabase.rpc("get_dashboard_data", { p_month: start });
  if (error) throw error;

  const result = data as {
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
  };

  return {
    categories: result.categories ?? [],
    transactions: (result.transactions ?? []).map((t) => ({
      ...t,
      note: t.note ?? "",
      reimbursed: t.reimbursed ?? false,
      reimbursedDate: t.reimbursedDate ?? null,
      createdBy: t.createdBy ?? null,
    })),
    budgets: result.budgets ?? [],
    goals: result.goals ?? [],
  };
}

export async function getJointContributionsForMonth(
  supabase: SupabaseClient,
  monthStart: Date,
): Promise<JointContribution[]> {
  const { start, end } = monthRange(monthStart);
  const { data, error } = await supabase
    .from("joint_contributions")
    .select("id, contributor, amount, note, date")
    .gte("date", start)
    .lt("date", end)
    .order("date", { ascending: false });
  if (error) throw error;

  return data.map((c) => ({
    id: c.id,
    contributor: c.contributor,
    amount: Number(c.amount),
    note: c.note ?? "",
    date: c.date,
  }));
}
