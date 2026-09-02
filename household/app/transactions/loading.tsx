import {
  CardSkeleton,
  PageSkeleton,
  Skeleton,
  TxnRowSkeleton,
} from "../../components/Skeleton";

export default function TransactionsLoading() {
  return (
    <PageSkeleton>
      <header className="px-6 pb-4 pt-7">
        <Skeleton className="mb-2 h-7 w-40" />
        <Skeleton className="h-3.5 w-24" />
      </header>

      <div className="flex gap-2 overflow-x-hidden px-5 pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-16 shrink-0 rounded-full" />
        ))}
      </div>

      <Skeleton className="mx-5 mb-5 h-[68px] rounded-card" />

      <div className="space-y-3.5 px-5">
        {Array.from({ length: 2 }).map((_, g) => (
          <CardSkeleton key={g} className="px-[18px] py-1">
            <div className="flex items-center justify-between py-3.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <TxnRowSkeleton key={i} />
            ))}
          </CardSkeleton>
        ))}
      </div>
    </PageSkeleton>
  );
}
