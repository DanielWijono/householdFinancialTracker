"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

export async function setReimbursed(id: string, date: string | null) {
  if (date !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))) {
    return { error: "Choose a valid reimbursement date." };
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("transactions")
      .update({ reimbursed: date !== null, reimbursed_date: date })
      .eq("id", id).eq("paid_by", "joint").select("id").single();
    if (error || !data) return { error: "Could not save reimbursement. Please try again." };
  } catch {
    return { error: "Could not connect. Please try again." };
  }
  for (const path of ["/", "/transactions", "/joint-spending", "/reimbursements"]) {
    revalidatePath(path);
  }
  return { error: null };
}
