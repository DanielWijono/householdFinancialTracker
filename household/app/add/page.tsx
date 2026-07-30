import AddTransactionSheet from "./AddTransactionSheet";
import { createClient } from "../../lib/supabase/server";
import { getCategories } from "../../lib/supabase/queries";

export default async function AddTransactionPage() {
  const supabase = await createClient();
  const categories = await getCategories(supabase);
  return <AddTransactionSheet categories={categories} />;
}
