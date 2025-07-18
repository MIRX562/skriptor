import { Skeleton } from "@/components/ui/skeleton";
import { CardHeader } from "@/components/ui/card";

export function TranscriptionViewLoading() {
  return (
    <div className="space-y-6">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />{" "}
          {/* Updated width for dropdown button */}
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>

      {/* Progress bar skeleton */}
      <div className="px-6 pb-2">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-64 mt-1" />
      </div>

      <div className="space-y-4">
        <div className="flex space-x-1 border-b">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md opacity-70" />
          <Skeleton className="h-10 w-28 rounded-md opacity-70" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />{" "}
            {/* Added for copy button */}
          </div>
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}
