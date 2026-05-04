import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TranscriptionListLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48 rounded-md mb-2" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div>
                    <Skeleton className="h-5 w-40 mb-1" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
