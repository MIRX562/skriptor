import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TranscriptionViewLoading() {
  return (
    <Card className="md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-transparent md:bg-card">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 sm:p-6 pb-2 sm:pb-4">
        <div className="space-y-1 min-w-0 flex-1 w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto">
          <Skeleton className="h-8 sm:h-9 w-24 rounded-md" />
          <Skeleton className="h-8 sm:h-9 w-24 rounded-md" />
          <Skeleton className="h-8 sm:h-9 w-24 rounded-md" />
          <Skeleton className="h-8 sm:h-9 w-24 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-3 sm:p-6">
        <div className="p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
          <Skeleton className="h-12 w-full" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1 p-1 bg-muted rounded-md">
              <Skeleton className="h-7 w-28 rounded-sm" />
              <Skeleton className="h-7 w-28 rounded-sm opacity-70" />
            </div>
          </div>

          <div className="border rounded-xl p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
