import { CardSkeleton, PageSkeleton, Skeleton } from "../../components/Skeleton";

export default function GoalsLoading() {
  return (
    <PageSkeleton>
      <header className="flex items-start justify-between px-6 pb-1 pt-7">
        <div>
          <Skeleton className="mb-2 h-7 w-24" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <Skeleton className="h-9 w-24 rounded-[10px]" />
      </header>

      <div className="px-5 pt-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} className="mb-3 p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="mb-2 h-1.5 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
          </CardSkeleton>
        ))}
      </div>
    </PageSkeleton>
  );
}
