import {
  BarRowSkeleton,
  CardSkeleton,
  PageSkeleton,
  Skeleton,
  SkeletonCircle,
  TxnRowSkeleton,
} from "../components/Skeleton";

export default function DashboardLoading() {
  return (
    <PageSkeleton>
      <header className="px-6 pb-6 pt-8">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="mb-2 h-5 w-28" />
        <Skeleton className="h-11 w-56" />
        <Skeleton className="mt-2 h-3.5 w-44" />
      </header>

      <Skeleton className="mx-5 mb-5 h-[68px] rounded-card" />
      <Skeleton className="mx-5 mb-5 h-[68px] rounded-card" />

      <section className="px-5 pt-2">
        <Skeleton className="mb-3 mt-5 h-4 w-24" />
        <CardSkeleton className="px-[18px] py-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <BarRowSkeleton key={i} />
          ))}
        </CardSkeleton>
      </section>

      <section className="px-5 pt-2">
        <Skeleton className="mb-3 mt-5 h-4 w-20" />
        <div className="flex gap-3 overflow-x-hidden pb-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} className="w-[150px] shrink-0 p-4">
              <SkeletonCircle size={52} />
              <Skeleton className="mb-1 mt-2.5 h-3.5 w-24" />
              <Skeleton className="h-3 w-20" />
            </CardSkeleton>
          ))}
        </div>
      </section>

      <section className="px-5 pt-2">
        <Skeleton className="mb-3 mt-5 h-4 w-40" />
        <CardSkeleton className="px-[18px] py-1">
          <Skeleton className="my-3 h-3 w-16" />
          {Array.from({ length: 4 }).map((_, i) => (
            <TxnRowSkeleton key={i} />
          ))}
        </CardSkeleton>
      </section>
    </PageSkeleton>
  );
}
