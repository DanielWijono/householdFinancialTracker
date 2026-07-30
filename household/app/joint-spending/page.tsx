import Link from "next/link";
import { formatIDR } from "../../lib/settlement";
import { createClient } from "../../lib/supabase/server";
import { getCategories, getTransactionsForMonth } from "../../lib/supabase/queries";

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default async function JointSpendingPage() {
  const today = new Date();
  const supabase = await createClient();
  const [categories, transactions] = await Promise.all([
    getCategories(supabase),
    getTransactionsForMonth(supabase, today),
  ]);

  const jointTxns = transactions.filter((t) => t.paidBy === "joint");
  const total = jointTxns.reduce((sum, t) => sum + t.amount, 0);

  const byCategory = new Map<string, number>();
  for (const t of jointTxns) {
    byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + t.amount);
  }
  const rows = Array.from(byCategory.entries())
    .map(([categoryId, amount]) => ({
      category: categories.find((c) => c.id === categoryId)!,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-ivory pb-24">
      <header className="px-6 pb-6 pt-8">
        <Link href="/" className="mb-3 inline-block text-[13px] font-medium text-gray">
          ← Back
        </Link>
        <div className="mb-1.5 text-[13px] font-medium uppercase tracking-wider text-gray">
          {monthLabel(today)}
        </div>
        <div className="mb-1 font-display text-[22px] font-medium text-ink">
          Joint account spending
        </div>
        <div className="font-mono text-[42px] font-semibold tracking-tight text-ink">
          {formatIDR(total)}
        </div>
      </header>

      <section className="px-5 pt-2">
        <div className="rounded-card border-[0.5px] border-gray-line bg-card px-[18px] py-1.5">
          {rows.length === 0 && (
            <div className="py-4.5 text-sm text-ink-soft">No joint account spending this month</div>
          )}
          {rows.map(({ category, amount }) => (
            <div
              key={category.id}
              className="flex items-center justify-between border-b-[0.5px] border-gray-line py-3.5 last:border-b-0"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-daniel-bg text-[13px]">
                  {category.icon}
                </span>
                {category.name}
              </div>
              <div className="font-mono text-[13px] text-ink-soft">{formatIDR(amount)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
