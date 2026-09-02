import type { ReactNode } from "react";

// Shared loading primitives for route-level `loading.tsx` skeletons.
// Warm-ledger palette only: gray-line as the pulse tone, ivory/card as ground.

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-line/70 ${className}`} />;
}

export function SkeletonCircle({ size = 52 }: { size?: number }) {
  return (
    <div
      className="animate-pulse shrink-0 rounded-full bg-gray-line/70"
      style={{ width: size, height: size }}
    />
  );
}

export function PageSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-ivory pb-24">{children}</div>
  );
}

export function CardSkeleton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border-[0.5px] border-gray-line bg-card ${className}`}>
      {children}
    </div>
  );
}

// A transaction-row shaped placeholder — icon square, two text lines, amount.
export function TxnRowSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b-[0.5px] border-gray-line py-3.5 last:border-b-0">
      <Skeleton className="h-9 w-9 shrink-0 rounded-[11px]" />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <div className="shrink-0 space-y-2 pt-0.5 text-right">
        <Skeleton className="ml-auto h-3.5 w-16" />
        <Skeleton className="ml-auto h-1 w-[42px] rounded-full" />
      </div>
    </div>
  );
}

// A budget/goal progress row — label line, track bar, figures line.
export function BarRowSkeleton() {
  return (
    <div className="border-b-[0.5px] border-gray-line py-4 last:border-b-0">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-[9px]" />
          <Skeleton className="h-3.5 w-28" />
        </div>
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="mb-2 h-1.5 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Bottom-sheet shell reused by every add/edit route.
export function SheetSkeleton({ title, rows = 4 }: { title: string; rows?: number }) {
  return (
    <div className="flex min-h-screen items-end justify-center bg-ink/55 px-0 sm:px-4">
      <div
        role="status"
        aria-label={`Loading ${title}`}
        className="w-full max-w-[480px] rounded-t-sheet bg-ivory px-6 pb-7 pt-3 shadow-sheet"
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-gray-line" />
        <Skeleton className="mb-6 h-5 w-40" />
        <div className="space-y-5">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-[12px]" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-[52px] w-full rounded-[14px]" />
      </div>
    </div>
  );
}
