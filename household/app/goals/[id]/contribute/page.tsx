import { notFound } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getGoals } from "../../../../lib/supabase/queries";
import ContributeSheet from "./ContributeSheet";

export default async function ContributePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const goals = await getGoals(supabase);
  const goal = goals.find((g) => g.id === id);
  if (!goal) notFound();

  return <ContributeSheet goal={goal} />;
}
