import { Skeleton } from "@/components/ui/skeleton";

export function TranscriptionUploadLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[500px] rounded-lg" />
    </div>
  );
}
