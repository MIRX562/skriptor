import { Construction } from "lucide-react";

export function WorkInProgressBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 py-2 text-center text-white shadow-lg">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4">
        <Construction className="h-5 w-5 animate-pulse" />
        <p className="text-sm font-semibold md:text-base">
          Exciting things are brewing! This app is under construction. Check
          back soon!
        </p>
        <Construction className="h-5 w-5 animate-pulse" />
      </div>
    </div>
  );
}
