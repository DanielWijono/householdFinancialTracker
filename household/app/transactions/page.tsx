import { createClient } from "../../lib/supabase/server";
import { getCategories, getTransactionsForMonth } from "../../lib/supabase/queries";
import TransactionsList from "./TransactionsList";

function parseMonthParam(month: string | undefined): Date {
  if (month) {
    const match = /^(\d{4})-(\d{2})$/.exec(month);
    if (match) {
      const year = Number(match[1]);
      const monthIndex = Number(match[2]) - 1;
      if (monthIndex >= 0 && monthIndex <= 11) return new Date(year, monthIndex, 1);
    }
  }
  return new Date();
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthDate = parseMonthParam(month);
  const today = new Date();
  const supabase = await createClient();
  const [categories, transactions] = await Promise.all([
    getCategories(supabase),
    getTransactionsForMonth(supabase, monthDate),
  ]);

  return (
    <TransactionsList
      categories={categories}
      transactions={transactions}
      today={today}
      monthDate={monthDate}
    />
  );
}
