"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CloudUpload, Minus, Paperclip, Plus, Upload, X } from "lucide-react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-input";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { languages } from "../const/supported-languages";
import { transcriptionUploadSchema } from "../schema/transcription-upload-schema";
import { initiateJob } from "../server/initiate-job";
import { useRouter } from "next/navigation";

export default function TranscriptionUploadForm() {
  const [files, setFiles] = useState<File[] | null>(null);
  const router = useRouter();

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 50,
    multiple: false,
    accept: {
      "audio/*": [".mp3", ".m4a", ".wav", ".flac"],
    },
  };

  const form = useForm<z.infer<typeof transcriptionUploadSchema>>({
    resolver: zodResolver(transcriptionUploadSchema),
    defaultValues: {
      language: "default",
      model: "medium",
      isSpeakerDiarized: false,
      numberOfSpeaker: 1,
    },
  });

  function onSubmit(values: z.infer<typeof transcriptionUploadSchema>) {
    try {
      console.log(values);
      toast.promise(initiateJob(values), {
        error: "Upload failed",
        success: "Upload successful, starting transcription",
      });
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
    router.push("/");
  }

  const speakerEnabled = form.watch("isSpeakerDiarized");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 md:space-y-8 max-w-3xl mx-auto"
      >
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Audio File</FormLabel>
              <FormControl>
                <FileUploader
                  value={files}
                  onValueChange={(selectedFiles) => {
                    setFiles(selectedFiles);
                    field.onChange(selectedFiles ?? []);
                  }}
                  dropzoneOptions={dropZoneConfig}
                  className="relative rounded-lg p-2"
                >
                  <FileInput
                    id="fileInput"
                    className="outline-dashed outline-2 outline-slate-500 hover:outline-teal-600"
                  >
                    <div className="flex items-center justify-center flex-col p-8 w-full ">
                      <CloudUpload className="text-gray-500 w-10 h-10" />
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>
                        &nbsp; or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        MP3,M4A,WAV,FLAC
                      </p>
                    </div>
                  </FileInput>
                  <FileUploaderContent>
                    {files &&
                      files.length > 0 &&
                      files.map((file, i) => (
                        <FileUploaderItem key={i} index={i}>
                          <Paperclip className="h-4 w-4 stroke-current" />
                          <span>{file.name}</span>
                        </FileUploaderItem>
                      ))}
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormDescription>
                Select an audio file to transcribe.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Transcription Title" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Language</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Select language"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
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
              <FormDescription>
                This is the language of the audio, keep as default for
                auto-detect.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Transcription Speed</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-3 gap-2"
                >
                  <div>
                    <RadioGroupItem
                      value="fast"
                      id="fast"
                      className="peer sr-only"
                    />
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
                    <RadioGroupItem
                      value="medium"
                      id="medium"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="medium"
                      className="flex flex-col items-center justify-center h-24 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-teal-600 dark:peer-data-[state=checked]:border-teal-400 [&:has([data-state=checked])]:border-teal-600 dark:[&:has([data-state=checked])]:border-teal-400 cursor-pointer"
                    >
                      <span className="text-2xl mb-1">⚖️</span>
                      <span className="font-medium">Medium</span>
                      <span className="text-xs text-muted-foreground">
                        Balanced
                      </span>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem
                      value="super"
                      id="super"
                      className="peer sr-only"
                    />
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
              </FormControl>
              <FormDescription>
                Select transcription speed based on your needs
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isSpeakerDiarized"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border border-slate-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Identify Speakers</FormLabel>
                <FormDescription>
                  If enabled transcription result will include speaker
                  identification.
                </FormDescription>
                <FormMessage />
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
                <FormLabel>Number of Speakers (Max 10)</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2 w-[200px]">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const value = Number(field.value) || 1;
                        if (value > 1) field.onChange(value - 1);
                      }}
                      aria-label="Decrease"
                      className="rounded-full text-teal-400"
                    >
                      <Minus />
                    </Button>
                    <Input
                      placeholder="2"
                      type=""
                      min={1}
                      className="text-center w-[80px]"
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        field.onChange(val);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const value = Number(field.value) || 1;
                        field.onChange(value + 1);
                      }}
                      aria-label="Increase"
                      className="rounded-full text-teal-400"
                    >
                      <Plus />
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>Minimum value is 1.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => form.reset()}
          >
            <X />
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex justify-center gap-2 bg-teal-600 hover:bg-teal-500 dark:bg-teal-400 dark:hover:bg-teal-300"
          >
            <Upload className="h-4 w-4" />
            Start Transcription
          </Button>
        </div>
      </form>
    </Form>
  );
}
