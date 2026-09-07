import Link from "next/link";
import type { Transaction } from "../lib/mock-data";
import { formatIDR } from "../lib/settlement";

export default function ReimbursementShortcut({ transactions }: { transactions: Transaction[] }) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  return (
    <Link href="/reimbursements" prefetch={false} className="mx-5 mb-5 flex items-center justify-between gap-3 rounded-card border-[0.5px] border-gray-line bg-gold-bg px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
      <div>
        <div className="text-sm font-medium text-ink">Awaiting reimbursement</div>
        <div className="mt-1 text-xs text-ink-soft">All months · {transactions.length} pending</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm font-semibold text-ink">{formatIDR(total)}</div>
        <div aria-hidden="true" className="mt-1 text-ink-soft">→</div>
      </div>
    </Link>
  );
}
