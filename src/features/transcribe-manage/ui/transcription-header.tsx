import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Zap, BarChart2, CheckCircle2 } from "lucide-react";

interface TranscriptionHeaderProps {
  metadata: {
    title: string;
    date: string;
    duration: string;
    mode: string;
    status: string;
  };
  onBack: () => void;
}

export function TranscriptionHeader({
  metadata,
  onBack,
}: TranscriptionHeaderProps) {
  return (
    <div className="flex flex-row items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-1"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-lg font-bold">{metadata.title}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span>{metadata.date}</span>
          <span className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {metadata.duration}
          </span>
          <Badge variant="outline" className="text-xs font-normal capitalize">
            {metadata.mode}
          </Badge>
          <Badge variant="outline" className="text-xs font-normal capitalize">
            {metadata.status.replace("_", " ")}
          </Badge>
        </div>
      </div>
    </div>
  );
}
