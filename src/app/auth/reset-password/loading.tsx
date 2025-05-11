import { Skeleton } from "@/components/ui/skeleton";

export default function ResetPasswordLoading() {
  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-56 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </div>
  );
}
