import Link from "next/link";
import type { Category } from "../../lib/categories";
import type { Budget } from "../../lib/mock-data";
import { formatIDR } from "../../lib/settlement";
import { createClient } from "../../lib/supabase/server";
import { getBudgetsForMonth, getCategories, getTransactionsForMonth } from "../../lib/supabase/queries";

export default async function BudgetsPage() {
  const today = new Date();
  const supabase = await createClient();
  const [categories, budgets, transactions] = await Promise.all([
    getCategories(supabase),
    getBudgetsForMonth(supabase, today),
    getTransactionsForMonth(supabase, today),
  ]);

  function categoryOf(id: string) {
    return categories.find((c) => c.id === id)!;
  }

  function spentFor(categoryId: string) {
    return transactions
      .filter((t) => t.categoryId === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  function jointSpentFor(categoryId: string) {
    return transactions
      .filter((t) => t.categoryId === categoryId && t.paidBy === "joint")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  const sharedBudgets = budgets.filter((b) => !categoryOf(b.categoryId).isPersonal);
  const personalBudgets = budgets.filter((b) => categoryOf(b.categoryId).isPersonal);

  const totalSpent = budgets.reduce((sum, b) => sum + spentFor(b.categoryId), 0);
  const totalJoint = budgets.reduce((sum, b) => sum + jointSpentFor(b.categoryId), 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.monthLimit, 0);
  const overCount = budgets.filter((b) => spentFor(b.categoryId) > b.monthLimit).length;
  const overallPct = totalLimit > 0 ? Math.min(1, totalSpent / totalLimit) : 0;

  const r = 27;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - overallPct);

  const monthLabel = today.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-ivory pb-10">
      <header className="flex items-start justify-between px-6 pb-1 pt-7">
        <div>
          <div className="mb-1 font-display text-2xl font-medium text-ink">Budgets</div>
          <div className="text-[13px] text-gray">{budgets.length} categories tracked</div>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-xs text-gray">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[0.5px] border-gray-line bg-card text-[11px]">
            ‹
          </span>
          {monthLabel}
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[0.5px] border-gray-line bg-card text-[11px]">
            ›
          </span>
        </div>
      </header>

      <div className="mx-5 my-[18px] flex items-center gap-[18px] rounded-card border-[0.5px] border-gray-line bg-card p-5">
        <svg className="h-16 w-16 shrink-0" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#E2DDCF" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={overCount > 0 ? "#C1633D" : "#C9A227"}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div>
          <div className="font-mono text-2xl font-semibold text-ink">{formatIDR(totalSpent)}</div>
          <div className="mt-0.5 text-xs text-gray">
            of {formatIDR(totalLimit)}
            {overCount > 0 && (
              <>
                {" "}
                ·{" "}
                <span className="font-medium text-terracotta">
                  {overCount} {overCount === 1 ? "category" : "categories"} over budget
                </span>
              </>
            )}
          </div>
          {totalJoint > 0 && (
            <div className="mt-1 text-xs text-gold">{formatIDR(totalJoint)} from joint account</div>
          )}
        </div>
      </div>

      <BudgetSection
        title="Shared"
        section="shared"
        items={sharedBudgets}
        categoryOf={categoryOf}
        spentFor={spentFor}
        jointSpentFor={jointSpentFor}
      />
      <BudgetSection
        title="Personal"
        section="personal"
        items={personalBudgets}
        categoryOf={categoryOf}
        spentFor={spentFor}
        jointSpentFor={jointSpentFor}
      />
    </div>
  );
}

function BudgetSection({
  title,
  section,
  items,
  categoryOf,
  spentFor,
  jointSpentFor,
}: {
  title: string;
  section: "shared" | "personal";
  items: Budget[];
  categoryOf: (id: string) => Category;
  spentFor: (id: string) => number;
  jointSpentFor: (id: string) => number;
}) {
  return (
    <section className="px-5">
      <div className="mb-2.5 mt-[18px] flex items-center justify-between font-display text-[16px] font-medium text-ink">
        {title}
        <Link href={`/budgets/add?section=${section}`} className="font-body text-xs font-medium text-gray">
          + Add category
        </Link>
      </div>
      {items.length > 0 && (
        <div className="rounded-card border-[0.5px] border-gray-line bg-card px-[18px] py-1">
          {items.map((b) => (
            <BudgetRow
              key={b.categoryId}
              budget={b}
              category={categoryOf(b.categoryId)}
              spent={spentFor(b.categoryId)}
              joint={jointSpentFor(b.categoryId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BudgetRow({
  budget,
  category,
  spent,
  joint,
}: {
  budget: Budget;
  category: Category;
  spent: number;
  joint: number;
}) {
  const pct = Math.round((spent / budget.monthLimit) * 100);
  const over = spent > budget.monthLimit;
  const barPct = Math.min(100, pct);
  const remaining = Math.abs(budget.monthLimit - spent);

  const chipBg = category.isPersonal
    ? category.defaultSplitDaniel === 100
      ? "bg-daniel-bg"
      : "bg-adel-bg"
    : "bg-daniel-bg";
  const chipColor = category.isPersonal
    ? category.defaultSplitDaniel === 100
      ? "text-daniel"
      : "text-adel"
    : "text-daniel";

  const label = category.isPersonal
    ? `${category.defaultSplitDaniel === 100 ? "Daniel" : "Adel"} — ${category.name}`
    : category.name;

  return (
    <Link
      href={`/budgets/edit/${category.id}`}
      className="block border-b-[0.5px] border-gray-line py-4 last:border-b-0"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-[9px] bg-daniel-bg text-[14px]">
            {category.icon}
          </span>
          {label}
          <span className={`rounded-[5px] ${chipBg} px-1.5 py-0.5 font-mono text-[9.5px] font-medium ${chipColor}`}>
            {category.defaultSplitDaniel}/{category.defaultSplitAdel}
          </span>
        </div>
        <div className={`font-mono text-[11px] font-medium ${over ? "text-terracotta" : "text-gold"}`}>
          {pct}%
        </div>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-line">
        <div
          className={`h-full rounded-full ${over ? "bg-terracotta" : "bg-gold"}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-xs text-ink-soft">
        <span>
          {new Intl.NumberFormat("id-ID").format(spent)}{" "}
          <span className="text-gray">/ {new Intl.NumberFormat("id-ID").format(budget.monthLimit)}</span>
        </span>
        <span className={over ? "text-terracotta" : "text-gray"}>
          {new Intl.NumberFormat("id-ID").format(remaining)} {over ? "over" : "left"}
        </span>
      </div>
      {joint > 0 && (
        <div className="mt-1.5 text-[10.5px] text-gold">
          {new Intl.NumberFormat("id-ID").format(joint)} from joint account
        </div>
      )}
    </Link>
  );
}
