import Link from "next/link";
import { formatIDR } from "../../lib/settlement";
import { createClient } from "../../lib/supabase/server";
import { getGoals } from "../../lib/supabase/queries";
import type { Goal } from "../../lib/mock-data";

export default async function GoalsPage() {
  const supabase = await createClient();
  const goals = await getGoals(supabase);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-ivory pb-10">
      <header className="flex items-start justify-between px-6 pb-1 pt-7">
        <div>
          <div className="mb-1 font-display text-2xl font-medium text-ink">Goals</div>
          <div className="text-[13px] text-gray">{goals.length} tracked</div>
        </div>
        <Link
          href="/goals/new"
          className="flex h-9 items-center rounded-[10px] border-[0.5px] border-gray-line bg-card px-3 font-body text-xs font-medium text-ink"
        >
          + New goal
        </Link>
      </header>

      <div className="px-5 pt-3">
        {goals.map((g) => (
          <GoalRow key={g.id} goal={g} />
        ))}
      </div>
    </div>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  const pct = Math.min(1, goal.currentAmount / goal.targetAmount);
  const dateLabel = goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "no target date";

  return (
    <Link
      href={`/goals/${goal.id}/contribute`}
      className="mb-3 block rounded-card border-[0.5px] border-gray-line bg-card p-4"
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[14px] font-medium text-ink">{goal.name}</span>
        <span className="font-mono text-[11px] text-gray">~{dateLabel}</span>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-line">
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct * 100}%` }} />
      </div>
      <div className="flex justify-between font-mono text-xs text-ink-soft">
        <span>
          {new Intl.NumberFormat("id-ID").format(goal.currentAmount)}{" "}
          <span className="text-gray">/ {new Intl.NumberFormat("id-ID").format(goal.targetAmount)}</span>
        </span>
        <span className="text-gold">{Math.round(pct * 100)}%</span>
      </div>
    </Link>
  );
}
