import { SheetSkeleton } from "../../components/Skeleton";

export default function AddTransactionLoading() {
  return <SheetSkeleton title="Add transaction" rows={6} />;
}
