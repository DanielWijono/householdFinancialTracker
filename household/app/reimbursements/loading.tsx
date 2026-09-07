import { CardSkeleton, PageSkeleton, Skeleton, TxnRowSkeleton } from "../../components/Skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <header className="px-6 pb-6 pt-8">
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="mb-3 h-6 w-64" />
        <Skeleton className="h-10 w-48" />
      </header>
      <div className="px-5"><CardSkeleton className="px-4">
        {Array.from({ length: 4 }, (_, i) => <TxnRowSkeleton key={i} />)}
      </CardSkeleton></div>
    </PageSkeleton>
  );
}
