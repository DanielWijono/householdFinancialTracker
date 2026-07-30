import { createClient } from "../../lib/supabase/server";
import { getCategories, getTransactionsForMonth } from "../../lib/supabase/queries";
import TransactionsList from "./TransactionsList";

export default async function TransactionsPage() {
  const today = new Date();
  const supabase = await createClient();
  const [categories, transactions] = await Promise.all([
    getCategories(supabase),
    getTransactionsForMonth(supabase, today),
  ]);

  return <TransactionsList categories={categories} transactions={transactions} today={today} />;
}
