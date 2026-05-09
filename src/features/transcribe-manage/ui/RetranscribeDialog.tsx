"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  RefreshCcw, 
  AlertTriangle, 
  Check, 
  ChevronsUpDown, 
  Minus, 
  Plus,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { languages } from "../../transcibe-upload/const/supported-languages";
import { useRetranscribe } from "../model/use-retranscribe";
import { type Dictionary } from "@/i18n/dictionaries";

const retranscribeSchema = z.object({
  language: z.string().min(1),
  model: z.enum(["small", "turbo", "large"]),
  isSpeakerDiarized: z.boolean(),
  numberOfSpeaker: z.number().min(1).max(10),
});

type RetranscribeValues = z.infer<typeof retranscribeSchema>;

interface RetranscribeDialogProps {
  id: string;
  currentSettings: {
    language: string;
    model: string;
    isSpeakerDiarized: boolean;
    numberOfSpeaker: number;
  };
  dict: Dictionary;
  trigger?: React.ReactNode;
}

export function RetranscribeDialog({ id, currentSettings, dict, trigger }: RetranscribeDialogProps) {
  const [open, setOpen] = useState(false);
  const retranscribeMutation = useRetranscribe(id);

  const form = useForm<RetranscribeValues>({
    resolver: zodResolver(retranscribeSchema),
    defaultValues: {
      language: currentSettings.language || "en",
      model: (currentSettings.model as any) || "turbo",
      isSpeakerDiarized: currentSettings.isSpeakerDiarized || false,
      numberOfSpeaker: currentSettings.numberOfSpeaker || 1,
    },
  });

  const onSubmit = (values: RetranscribeValues) => {
    retranscribeMutation.mutate(values, {
      onSuccess: () => {
        toast.success(dict.view.retranscribe?.success || "Retranscription started");
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to start retranscription");
      },
    });
  };

  const speakerEnabled = form.watch("isSpeakerDiarized");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8">
            <RefreshCcw className="h-4 w-4 mr-2" />
            {dict.view.actions?.retranscribe || "Re-transcribe"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-teal-600" />
            {dict.view.retranscribe?.title || "Re-transcribe Options"}
          </DialogTitle>
          <DialogDescription>
            {dict.view.retranscribe?.description || "Run the transcription again with different settings. This will replace the current transcript."}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 flex gap-3 items-start mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-400">
            {dict.view.retranscribe?.warning || "Warning: All manual edits and speaker labels will be lost and replaced with the new results."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{dict.transcribe.form.language.label}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? languages.find(
                                (language) => language.value === field.value
                              )?.label
                            : dict.transcribe.form.language.placeholder}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder={dict.transcribe.form.language.searchPlaceholder} />
                        <CommandList>
                          <CommandEmpty>{dict.transcribe.form.language.noFound}</CommandEmpty>
                          <CommandGroup>
                            {languages.map((language) => (
                              <CommandItem
                                value={language.label}
                                key={language.value}
                                onSelect={() => {
                                  form.setValue("language", language.value);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    language.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {language.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{dict.transcribe.form.speed.label}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-3 gap-2"
                    >
                      {["small", "turbo", "large"].map((m) => (
                        <div key={m}>
                          <RadioGroupItem
                            value={m}
                            id={`re-${m}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`re-${m}`}
                            className="flex flex-col items-center justify-center h-20 rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-teal-600 dark:peer-data-[state=checked]:border-teal-400 cursor-pointer"
                          >
                            <span className="text-xl mb-1">
                              {m === "small" ? "🚀" : m === "turbo" ? "⚖️" : "✨"}
                            </span>
                            <span className="text-xs font-medium uppercase">
                              {(dict.transcribe.form.speed as any)[m === "small" ? "fast" : m === "turbo" ? "turbo" : "super"]?.label || m}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSpeakerDiarized"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{dict.transcribe.form.diarization.label}</FormLabel>
                    <FormDescription className="text-[10px]">
                      {dict.transcribe.form.diarization.description}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {speakerEnabled && (
              <FormField
                control={form.control}
                name="numberOfSpeaker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.transcribe.form.speakers.label}</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => {
                            const value = Number(field.value) || 1;
                            if (value > 1) field.onChange(value - 1);
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          className="text-center w-16 h-8"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => {
                            const value = Number(field.value) || 1;
                            if (value < 10) field.onChange(value + 1);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)}
                disabled={retranscribeMutation.isPending}
              >
                {dict.common?.cancel || "Cancel"}
              </Button>
              <Button 
                type="submit" 
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={retranscribeMutation.isPending}
              >
                {retranscribeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {dict.view.retranscribe?.confirm || "Start Retranscription"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
