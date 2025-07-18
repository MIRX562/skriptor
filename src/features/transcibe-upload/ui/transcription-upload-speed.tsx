import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React from "react";

export default function TranscriptionSpeed() {
  return (
    <div className="space-y-2">
      <Label>Transcription Speed</Label>
      <RadioGroup
        // value={transcriptionSpeed}
        // onValueChange={(value) =>
        //   setTranscriptionSpeed(value as "fast" | "medium" | "super")
        // }
        className="grid grid-cols-3 gap-2"
      >
        <div>
          <RadioGroupItem value="fast" id="fast" className="peer sr-only" />
          <Label
            htmlFor="fast"
            className="flex flex-col items-center justify-center h-24 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-teal-600 dark:peer-data-[state=checked]:border-teal-400 [&:has([data-state=checked])]:border-teal-600 dark:[&:has([data-state=checked])]:border-teal-400 cursor-pointer"
          >
            <span className="text-2xl mb-1">🚀</span>
            <span className="font-medium">Fast</span>
            <span className="text-xs text-muted-foreground">
              Lower accuracy
            </span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
          <Label
            htmlFor="medium"
            className="flex flex-col items-center justify-center h-24 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-teal-600 dark:peer-data-[state=checked]:border-teal-400 [&:has([data-state=checked])]:border-teal-600 dark:[&:has([data-state=checked])]:border-teal-400 cursor-pointer"
          >
            <span className="text-2xl mb-1">⚖️</span>
            <span className="font-medium">Medium</span>
            <span className="text-xs text-muted-foreground">Balanced</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="super" id="super" className="peer sr-only" />
          <Label
            htmlFor="super"
            className="flex flex-col items-center justify-center h-24 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-teal-600 dark:peer-data-[state=checked]:border-teal-400 [&:has([data-state=checked])]:border-teal-600 dark:[&:has([data-state=checked])]:border-teal-400 cursor-pointer"
          >
            <span className="text-2xl mb-1">✨</span>
            <span className="font-medium">Super</span>
            <span className="text-xs text-muted-foreground">
              Highest accuracy
            </span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
