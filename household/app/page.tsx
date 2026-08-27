import Link from "next/link";
import type { Category } from "../lib/categories";
import type { Budget, Goal, Transaction } from "../lib/mock-data";
import {
  computeSettlement,
  computeSettlementByCategory,
  formatIDR,
  type CategorySettlement,
} from "../lib/settlement";
import { createClient } from "../lib/supabase/server";
import { getDashboardData } from "../lib/supabase/queries";
import SignOutButton from "./SignOutButton";

const PERSON_LABEL = { daniel: "Daniel", adel: "Adel", joint: "Joint Account" } as const;

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dayLabel(iso: string, today: Date) {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((todayMidnight.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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

function monthParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthDate = parseMonthParam(month);
  const today = new Date();
  const isCurrentMonth =
    monthDate.getFullYear() === today.getFullYear() && monthDate.getMonth() === today.getMonth();
  const supabase = await createClient();
  const { categories, transactions, budgets, goals } = await getDashboardData(supabase, monthDate);

  function categoryOf(id: string) {
    return categories.find((c) => c.id === id)!;
  }

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalJoint = transactions
    .filter((t) => t.paidBy === "joint")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthLimit, 0);
  const pctOfBudget = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const settlement = computeSettlement(transactions);
  const settlementByCategory = computeSettlementByCategory(transactions);

  const groupedTxns = groupByDay(transactions, today);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-ivory pb-24">
      <header className="px-6 pb-6 pt-8">
        <div className="mb-1.5 flex items-center justify-between text-[13px] font-medium uppercase tracking-wider text-gray">
          <div className="flex items-center gap-2.5 normal-case tracking-normal">
            <Link
              href={`/?month=${monthParam(addMonths(monthDate, -1))}`}
              aria-label="Previous month"
              className="flex h-6 w-6 items-center justify-center rounded-full border-[0.5px] border-gray-line text-ink-soft"
            >
              ‹
            </Link>
            <span className="uppercase tracking-wider">{monthLabel(monthDate)}</span>
            {isCurrentMonth ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-gray-line">
                ›
              </span>
            ) : (
              <Link
                href={`/?month=${monthParam(addMonths(monthDate, 1))}`}
                aria-label="Next month"
                className="flex h-6 w-6 items-center justify-center rounded-full border-[0.5px] border-gray-line text-ink-soft"
              >
                ›
              </Link>
            )}
          </div>
          <SignOutButton />
        </div>
        <div className="mb-1 font-display text-[22px] font-medium text-ink">Total spent</div>
        <div className="font-mono text-[42px] font-semibold tracking-tight text-ink">
          {formatIDR(totalSpent)}
        </div>
        <div className="mt-1.5 font-mono text-[13px] text-gray">
          of {formatIDR(totalBudget)} budgeted · {pctOfBudget}%
        </div>
        {totalJoint > 0 && (
          <div className="mt-1 font-mono text-[12px] text-gold">
            {formatIDR(totalJoint)} paid from joint account
          </div>
        )}
      </header>

      <SettlementCard
        owedBy={settlement.owedBy}
        amount={settlement.amount}
        byCategory={settlementByCategory}
        categoryOf={categoryOf}
      />

      <JointAccountSpendingCard amount={totalJoint} />

      <section className="px-5 pt-2">
        <div className="mb-3 mt-5 flex items-center justify-between font-display text-[17px] font-medium text-ink">
          Budgets
          <Link href="/budgets" className="font-body text-xs font-medium text-gray">
            View all
          </Link>
        </div>
        <div className="rounded-card border-[0.5px] border-gray-line bg-card px-[18px] py-1.5">
          {budgets.map((b) => (
            <BudgetRow
              key={b.categoryId}
              budget={b}
              category={categoryOf(b.categoryId)}
              spent={transactions
                .filter((t) => t.categoryId === b.categoryId)
                .reduce((sum, t) => sum + t.amount, 0)}
            />
          ))}
        </div>
      </section>

      <section className="px-5 pt-2">
        <div className="mb-3 mt-5 flex items-center justify-between font-display text-[17px] font-medium text-ink">
          Goals
          <Link href="/goals" className="font-body text-xs font-medium text-gray">
            View all
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
          <Link
            href="/goals/new"
            className="flex w-[150px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-card border-[0.5px] border-dashed border-gray-line bg-card p-4 text-[12.5px] font-medium text-gray"
          >
            + New goal
          </Link>
        </div>
      </section>

      <section className="px-5 pt-2">
        <div className="mb-3 mt-5 flex items-center justify-between font-display text-[17px] font-medium text-ink">
          Recent transactions
          <Link
            href={`/transactions?month=${monthParam(monthDate)}`}
            className="font-body text-xs font-medium text-gray"
          >
            View all
          </Link>
        </div>
        <div className="rounded-card border-[0.5px] border-gray-line bg-card px-[18px] py-1">
          {groupedTxns.map(([day, txns]) => (
            <div key={day}>
              <div className="px-0 pb-1.5 pt-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray">
                {day}
              </div>
              {txns.map((t) => (
                <TxnRow key={t.id} txn={t} category={categoryOf(t.categoryId)} />
              ))}
            </div>
          ))}
        </div>
      </section>

      <Link
        href="/add"
        className="fixed bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 w-[min(432px,calc(100%-48px))] -translate-x-1/2 rounded-card bg-ink px-4 py-4 text-center text-[14px] font-medium tracking-wide text-ivory shadow-fab"
      >
        + Add transaction
      </Link>
    </div>
  );
}

function SettlementCard({
  owedBy,
  amount,
  byCategory,
  categoryOf,
}: {
  owedBy: "daniel" | "adel" | null;
  amount: number;
  byCategory: CategorySettlement[];
  categoryOf: (id: string) => Category;
}) {
  if (!owedBy) {
    return (
      <div className="mx-5 mb-5 flex items-center justify-between rounded-card border-[0.5px] border-gray-line bg-card px-5 py-4.5">
        <span className="text-sm text-ink-soft">All settled up this month</span>
      </div>
    );
  }

  const owedTo = owedBy === "daniel" ? "Adel" : "Daniel";

  return (
    <details className="group mx-5 mb-5 rounded-card border-[0.5px] border-[#D9AF95] bg-terracotta-bg px-5 py-4.5">
      <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-3">
          <div className="flex">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-daniel text-[10px] font-semibold text-white">
              D
            </span>
            <span className="-ml-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-terracotta-bg bg-adel text-[10px] font-semibold text-white">
              A
            </span>
          </div>
          <div className="text-sm leading-snug text-[#5A2E19]">
            {PERSON_LABEL[owedBy]} owes
            <br />
            <b className="font-semibold">{owedTo}</b> this month
          </div>
        </div>
        <div className="font-mono text-lg font-semibold text-[#5A2E19]">{formatIDR(amount)}</div>
      </summary>
      <div className="mt-3.5 border-t-[0.5px] border-[#D9AF95] pt-3">
        {byCategory.map((c) => {
          const category = categoryOf(c.categoryId);
          const owedToLabel = c.owedBy === "daniel" ? "Adel" : "Daniel";
          return (
            <div
              key={c.categoryId}
              className="flex items-center justify-between py-1 text-[12.5px] text-[#5A2E19]"
            >
              <span>
                {category.icon} {category.name}
                <span className="text-[#8A5A3D]"> · {PERSON_LABEL[c.owedBy]} owes {owedToLabel}</span>
              </span>
              <span className="font-mono">{formatIDR(c.amount)}</span>
            </div>
          );
        })}
      </div>
    </details>
  );
}

function JointAccountSpendingCard({ amount }: { amount: number }) {
  return (
    <Link
      href="/joint-spending"
      className="mx-5 mb-5 flex items-center justify-between rounded-card border-[0.5px] border-gray-line bg-gold-bg px-5 py-4.5"
    >
      <span className="text-sm font-medium text-ink">Joint account spending</span>
      <span className="font-mono text-lg font-semibold text-ink">{formatIDR(amount)}</span>
    </Link>
  );
}

function BudgetRow({
  budget,
  category,
  spent,
}: {
  budget: Budget;
  category: Category;
  spent: number;
}) {
  const pct = Math.min(100, Math.round((spent / budget.monthLimit) * 100));
  const over = spent > budget.monthLimit;
  const chipBg = category.isPersonal ? "bg-daniel-bg" : "bg-gold-bg";
  const chipColor = category.isPersonal ? "text-daniel" : "text-gold-text";

  return (
    <div className="border-b-[0.5px] border-gray-line py-3.5 last:border-b-0">
      <div className="mb-2 flex items-baseline justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-daniel-bg text-[13px]">
            {category.icon}
          </span>
          {category.name}
          {category.isPersonal ? (
            <span className={`ml-1.5 rounded-[5px] ${chipBg} px-1.5 py-0.5 font-mono text-[10px] font-medium ${chipColor}`}>
              {category.defaultSplitDaniel}/{category.defaultSplitAdel}
            </span>
          ) : (
            <span className="ml-1.5 rounded-[5px] bg-teal-bg px-1.5 py-0.5 font-mono text-[10px] font-medium text-daniel">
              {category.defaultSplitDaniel}/{category.defaultSplitAdel}
            </span>
          )}
        </div>
        <div className="font-mono text-[13px] text-ink-soft">
          {new Intl.NumberFormat("id-ID").format(spent)}{" "}
          <span className="text-gray">/ {new Intl.NumberFormat("id-ID").format(budget.monthLimit)}</span>
        </div>
      </div>
      <div className="h-[5px] overflow-hidden rounded-full bg-gray-line">
        <div
          className={`h-full rounded-full ${over ? "bg-terracotta" : "bg-gold"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const pct = Math.min(1, goal.currentAmount / goal.targetAmount);
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  const dateLabel = goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "no date";

  return (
    <Link
      href={`/goals/${goal.id}/contribute`}
      className="block w-[150px] shrink-0 rounded-card border-[0.5px] border-gray-line bg-card p-4"
    >
      <svg className="mb-2.5 h-[52px] w-[52px]" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#E2DDCF" strokeWidth="5" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="#C9A227"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
        />
      </svg>
      <div className="mb-1 text-[13px] font-medium text-ink">{goal.name}</div>
      <div className="font-mono text-xs text-gray">
        {formatCompact(goal.currentAmount)} / {formatCompact(goal.targetAmount)}
      </div>
      <div className="mt-1.5 font-mono text-[11px] font-medium text-gold">~{dateLabel}</div>
    </Link>
  );
}

function TxnRow({ txn, category }: { txn: Transaction; category: Category }) {
  return (
    <Link
      href={`/transactions/edit/${txn.id}`}
      className="flex items-center gap-3 border-b-[0.5px] border-gray-line py-[11px] last:border-b-0"
    >
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-daniel-bg text-[15px]">
        {category.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium text-ink">{txn.note}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-gray">
          <span>
            Paid by {PERSON_LABEL[txn.paidBy]}
            {category.isPersonal ? " · Personal" : ""}
          </span>
          {txn.paidBy === "joint" &&
            (txn.reimbursed ? (
              <span className="rounded-full bg-gold-bg px-1.5 py-px text-[10px] font-medium text-gold-text">
                ✓ Reimbursed
              </span>
            ) : (
              <span className="rounded-full bg-terracotta-bg px-1.5 py-px text-[10px] font-medium text-terracotta">
                Awaiting
              </span>
            ))}
          {txn.createdBy && <span>· by {PERSON_LABEL[txn.createdBy]}</span>}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm font-medium text-ink">{formatIDR(txn.amount)}</div>
        <div className="mt-1 flex justify-end gap-1">
          {txn.splitDaniel > 0 && <span className="h-1.5 w-1.5 rounded-full bg-daniel" />}
          {txn.splitAdel > 0 && <span className="h-1.5 w-1.5 rounded-full bg-adel" />}
        </div>
      </div>
    </Link>
  );
}

function groupByDay(txns: Transaction[], today: Date) {
  const groups = new Map<string, Transaction[]>();
  for (const t of txns) {
    const label = dayLabel(t.date, today);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(t);
  }
  return Array.from(groups.entries());
}

function formatCompact(amount: number) {
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}jt`;
  return new Intl.NumberFormat("id-ID").format(amount);
}
