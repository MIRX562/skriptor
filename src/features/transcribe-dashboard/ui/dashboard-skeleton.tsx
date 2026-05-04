import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton({ dict, locale }: { dict?: any; locale?: string }) {
  return (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl border border-border/50" />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transcriptions Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-[450px] rounded-xl border border-border/50" />
        </div>

        {/* Stats Chart Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-[450px] rounded-xl border border-border/50" />
        </div>
      </div>
    </div>
  );
}
