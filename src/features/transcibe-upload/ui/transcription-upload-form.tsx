"use client";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
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
import { Upload, X, AudioLines, FileAudio, CheckCircle2, Loader2, CloudUpload, Minus, Paperclip, Plus } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { WaveformPlayer } from "../../transcribe-manage/ui/waveform-player";

type TranscriptionUploadValues = z.infer<typeof transcriptionUploadSchema>;

export default function TranscriptionUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  // Manage object URL lifecycle
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 50,
    multiple: false,
    accept: {
      "audio/*": [".mp3", ".m4a", ".wav", ".flac"],
    },
  };

  const form = useForm<TranscriptionUploadValues>({
    resolver: zodResolver(transcriptionUploadSchema),
    defaultValues: {
      title: "",
      language: "default",
      model: "medium",
      isSpeakerDiarized: false,
      numberOfSpeaker: 1,
    },
  });

  async function onSubmit(values: TranscriptionUploadValues) {
    // Trigger the mutation which will handle validation and notifications
    mutation.mutate(values);
  }

  // keep toast id to update the loading toast
  const loadingToastId = useRef<number | string | null>(null);

  const uploadFn = async (
    values: TranscriptionUploadValues
  ) => {
    if (!file) {
      throw new Error("Please select a file to upload.");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", values.title);
    formData.append("language", values.language);
    formData.append("model", values.model);
    formData.append("isSpeakerDiarized", values.isSpeakerDiarized.toString());
    formData.append("numberOfSpeaker", values.numberOfSpeaker.toString());

    const response = await fetch("/api/transcribe-upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const msg = data?.error ? JSON.stringify(data.error) : "Upload failed.";
      throw new Error(msg);
    }
    return data;
  };

  const mutation = useMutation({
    mutationFn: uploadFn,
    onMutate: () => {
      // Overlay will be shown via isPending state
    },
    onError: (err: unknown) => {
      // clear loading toast then show error
      if (loadingToastId.current)
        toast.dismiss(loadingToastId.current as number | string);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to submit the form. Please try again.";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Transcription started successfully.");
      router.push("/dashboard");
    },
  });

  const speakerEnabled = form.watch("isSpeakerDiarized");

  return (
    <>
      {mutation.isPending && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-teal-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold">Creating transcription job...</h2>
          <p className="text-muted-foreground mt-2">Uploading audio and preparing models</p>
        </div>
      )}
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
                  value={file ? [file] : []}
                  onValueChange={(selectedFiles) => {
                    const newFile = selectedFiles && selectedFiles.length > 0 ? selectedFiles[0] : null;
                    setFile(newFile);
                    field.onChange(newFile);
                    if (newFile && !form.getValues("title")) {
                      const titleName = newFile.name.replace(/\.[^/.]+$/, "");
                      form.setValue("title", titleName, { shouldValidate: true });
                    }
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
                    {file && (
                      <FileUploaderItem index={0}>
                        <Paperclip className="h-4 w-4 stroke-current" />
                        <span>{file.name}</span>
                      </FileUploaderItem>
                    )}
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
        {previewUrl && (
          <div className="w-full mt-4">
            <Label className="mb-2 block">Audio Preview</Label>
            <WaveformPlayer audioUrl={previewUrl} />
          </div>
        )}
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
                      type="button"
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
                      value="small"
                      id="small"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="small"
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
                      value="large"
                      id="large"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="large"
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
    </>
  );
}
