import { Skeleton } from "@/components/ui/skeleton";

export default function SignupLoading() {
  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-56 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="flex items-start space-x-2 mt-4">
          <Skeleton className="h-4 w-4 rounded mt-0.5" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <Skeleton className="h-10 w-full mt-2" />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <Skeleton className="h-4 w-36 bg-white dark:bg-slate-900" />
          </div>
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="text-center mt-6">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
