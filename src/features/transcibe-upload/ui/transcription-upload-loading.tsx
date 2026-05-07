import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TranscriptionUploadLoading() {
  return (
    <Card className="md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-transparent md:bg-card">
      <CardHeader>
        <Skeleton className="h-7 w-48 rounded-md mb-2" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
