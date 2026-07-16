import Link from "next/link";
import { categories } from "../lib/categories";
import { transactions, budgets, goals } from "../lib/mock-data";
import { computeSettlement, formatIDR } from "../lib/settlement";

const PERSON_LABEL = { daniel: "Daniel", adel: "Adel" } as const;

function categoryOf(id: string) {
  return categories.find((c) => c.id === id)!;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date("2026-07-13");
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthLimit, 0);
  const pctOfBudget = Math.round((totalSpent / totalBudget) * 100);
  const settlement = computeSettlement(transactions);

  const groupedTxns = groupByDay(transactions);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-ivory pb-24">
      <header className="px-6 pb-6 pt-8">
        <div className="mb-1.5 text-[13px] font-medium uppercase tracking-wider text-gray">
          {monthLabel(new Date("2026-07-13"))}
        </div>
        <div className="mb-1 font-display text-[22px] font-medium text-ink">Total spent</div>
        <div className="font-mono text-[42px] font-semibold tracking-tight text-ink">
          {formatIDR(totalSpent)}
        </div>
        <div className="mt-1.5 font-mono text-[13px] text-gray">
          of {formatIDR(totalBudget)} budgeted · {pctOfBudget}%
        </div>
      </header>

      <SettlementCard owedBy={settlement.owedBy} amount={settlement.amount} />

      <section className="px-5 pt-2">
        <div className="mb-3 mt-5 flex items-center justify-between font-display text-[17px] font-medium text-ink">
          Budgets
          <Link href="/budgets" className="font-body text-xs font-medium text-gray">
            View all
          </Link>
        </div>
        <div className="rounded-card border-[0.5px] border-gray-line bg-card px-[18px] py-1.5">
          {budgets.map((b) => (
            <BudgetRow key={b.categoryId} budget={b} />
          ))}
        </div>
      </section>

      <section className="px-5 pt-2">
        <div className="mb-3 mt-5 font-display text-[17px] font-medium text-ink">Goals</div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      </section>

      <section className="px-5 pt-2">
        <div className="mb-3 mt-5 flex items-center justify-between font-display text-[17px] font-medium text-ink">
          Recent transactions
          <Link href="/transactions" className="font-body text-xs font-medium text-gray">
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
                <TxnRow key={t.id} txn={t} />
              ))}
            </div>
          ))}
        </div>
      </section>

      <Link
        href="/add"
        className="fixed bottom-7 left-1/2 w-[min(432px,calc(100%-48px))] -translate-x-1/2 rounded-card bg-ink px-4 py-4 text-center text-[14px] font-medium tracking-wide text-ivory shadow-fab"
      >
        + Add transaction
      </Link>
    </div>
  );
}

function SettlementCard({
  owedBy,
  amount,
}: {
  owedBy: "daniel" | "adel" | null;
  amount: number;
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
    <div className="mx-5 mb-5 flex items-center justify-between rounded-card border-[0.5px] border-[#D9AF95] bg-terracotta-bg px-5 py-4.5">
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
    </div>
  );
}

function BudgetRow({ budget }: { budget: (typeof budgets)[number] }) {
  const category = categoryOf(budget.categoryId);
  const spent = transactions
    .filter((t) => t.categoryId === budget.categoryId)
    .reduce((sum, t) => sum + t.amount, 0);
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

function GoalCard({ goal }: { goal: (typeof goals)[number] }) {
  const pct = Math.min(1, goal.currentAmount / goal.targetAmount);
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  const dateLabel = new Date(goal.targetDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="w-[150px] shrink-0 rounded-card border-[0.5px] border-gray-line bg-card p-4">
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
    </div>
  );
}

function TxnRow({ txn }: { txn: (typeof transactions)[number] }) {
  const category = categoryOf(txn.categoryId);
  return (
    <div className="flex items-center gap-3 border-b-[0.5px] border-gray-line py-[11px] last:border-b-0">
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-daniel-bg text-[15px]">
        {category.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium text-ink">{txn.note}</div>
        <div className="mt-0.5 text-[11.5px] text-gray">
          Paid by {PERSON_LABEL[txn.paidBy]}
          {category.isPersonal ? " · Personal" : ""}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm font-medium text-ink">{formatIDR(txn.amount)}</div>
        <div className="mt-1 flex justify-end gap-1">
          {txn.splitDaniel > 0 && <span className="h-1.5 w-1.5 rounded-full bg-daniel" />}
          {txn.splitAdel > 0 && <span className="h-1.5 w-1.5 rounded-full bg-adel" />}
        </div>
      </div>
    </div>
  );
}

function groupByDay(txns: typeof transactions) {
  const groups = new Map<string, typeof transactions>();
  for (const t of txns) {
    const label = dayLabel(t.date);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(t);
  }
  return Array.from(groups.entries());
}

function formatCompact(amount: number) {
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}jt`;
  return new Intl.NumberFormat("id-ID").format(amount);
}
