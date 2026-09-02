import {
  CardSkeleton,
  PageSkeleton,
  Skeleton,
  TxnRowSkeleton,
} from "../../components/Skeleton";

export default function JointSpendingLoading() {
  return (
    <PageSkeleton>
      <header className="px-6 pb-6 pt-8">
        <Skeleton className="mb-3 h-3.5 w-16" />
        <Skeleton className="mb-1.5 h-3.5 w-28" />
        <Skeleton className="mb-2 h-5 w-52" />
        <Skeleton className="h-11 w-56" />
      </header>

      <section className="px-5 pt-2">
        <CardSkeleton className="px-[18px] py-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b-[0.5px] border-gray-line py-3.5 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-[26px] w-[26px] rounded-[8px]" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </CardSkeleton>
      </section>

      <section className="px-5 pt-6">
        <Skeleton className="mb-2.5 h-3 w-24" />
        <CardSkeleton className="px-[18px] py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <TxnRowSkeleton key={i} />
          ))}
        </CardSkeleton>
      </section>
    </PageSkeleton>
  );
}
