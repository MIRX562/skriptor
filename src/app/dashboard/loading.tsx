import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/features/dashboard/ui/dashboard-header";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <SiteHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {/* Tabs Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="grid w-full max-w-md grid-cols-3 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <Skeleton className="h-9 rounded-md" />
            <Skeleton className="h-9 rounded-md opacity-70" />
            <Skeleton className="h-9 rounded-md opacity-70" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Transcriptions Skeleton */}
          <Skeleton className="h-[450px] rounded-lg" />

          {/* Stats Chart Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-[450px] rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
