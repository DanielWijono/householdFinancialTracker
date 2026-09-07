import { createClient } from "../../lib/supabase/server";
import { getAwaitingReimbursements, getCategories } from "../../lib/supabase/queries";
import ReimbursementQueue from "./ReimbursementQueue";

export default async function ReimbursementsPage() {
  const supabase = await createClient();
  const [transactions, categories] = await Promise.all([
    getAwaitingReimbursements(supabase), getCategories(supabase),
  ]);
  return <ReimbursementQueue transactions={transactions} categories={categories} />;
}
