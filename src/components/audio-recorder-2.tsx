import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export default function Component() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="bg-card rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-4xl font-bold text-card-foreground">00:00</div>
            <div className="text-sm text-muted-foreground">Recording Time</div>
          </div>
          <Button
            size="lg"
            variant="ghost"
            className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center hover:bg-primary/80"
          >
            <Mic className="w-12 h-12" />
          </Button>
        </div>
      </div>
    </div>
  );
}
