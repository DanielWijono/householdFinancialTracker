import { notFound } from "next/navigation";
import EditTransactionSheet from "./EditTransactionSheet";
import { createClient } from "../../../../lib/supabase/server";
import { getCategories, getTransactionById } from "../../../../lib/supabase/queries";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [categories, txn] = await Promise.all([
    getCategories(supabase),
    getTransactionById(supabase, id),
  ]);

  if (!txn) notFound();

  return <EditTransactionSheet txn={txn} categories={categories} />;
}
