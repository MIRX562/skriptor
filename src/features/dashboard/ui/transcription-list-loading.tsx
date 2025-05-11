import { Skeleton } from "@/components/ui/skeleton";

export function TranscriptionListLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
