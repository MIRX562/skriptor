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
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div>
                <Skeleton className="h-5 w-40" />
                <div className="flex items-center gap-2 mt-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" /> {/* For progress bar */}
              <Skeleton className="h-5 w-16" /> {/* For mode badge */}
              <Skeleton className="h-5 w-16" /> {/* For status badge */}
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
