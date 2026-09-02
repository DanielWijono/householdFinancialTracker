import {
  BarRowSkeleton,
  CardSkeleton,
  PageSkeleton,
  Skeleton,
  SkeletonCircle,
} from "../../components/Skeleton";

function BudgetSectionSkeleton({ rows }: { rows: number }) {
  return (
    <section className="px-5">
      <div className="mb-2.5 mt-[18px] flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <CardSkeleton className="px-[18px] py-1">
        {Array.from({ length: rows }).map((_, i) => (
          <BarRowSkeleton key={i} />
        ))}
      </CardSkeleton>
    </section>
  );
}

export default function BudgetsLoading() {
  return (
    <PageSkeleton>
      <header className="flex items-start justify-between px-6 pb-1 pt-7">
        <div>
          <Skeleton className="mb-2 h-7 w-28" />
          <Skeleton className="h-3.5 w-36" />
        </div>
        <Skeleton className="h-4 w-24" />
      </header>

      <div className="mx-5 my-[18px] flex items-center gap-[18px] rounded-card border-[0.5px] border-gray-line bg-card p-5">
        <SkeletonCircle size={64} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      <BudgetSectionSkeleton rows={4} />
      <BudgetSectionSkeleton rows={3} />
    </PageSkeleton>
  );
}
