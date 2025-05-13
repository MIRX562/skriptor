import { Skeleton } from "@/components/ui/skeleton";

export function TranscriptionViewLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-row items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-7 w-48 rounded-md" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-1 border-b">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md opacity-70" />
          <Skeleton className="h-10 w-28 rounded-md opacity-70" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-40 rounded-md" />
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
