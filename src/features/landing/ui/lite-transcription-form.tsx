"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CloudUpload, Loader2, Upload, Paperclip } from "lucide-react";
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from "@/components/ui/file-input";
import AudioInput from "@/components/ui/audio-input";
import { authClient } from "@/lib/auth-client";
import { savePendingJob } from "@/lib/pending-job";
import { motion } from "framer-motion";
import { WaveformPlayer } from "@/features/transcribe-manage/ui/waveform-player";
import { Label } from "@/components/ui/label";

export function LiteTranscriptionForm() {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (file && activeTab === "upload") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file, activeTab]);

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 50,
    multiple: false,
    accept: {
      "audio/*": [".mp3", ".m4a", ".wav", ".flac"],
    },
  };

  const handleTranscribe = async () => {
    if (!file) {
      toast.error("Please provide an audio file to transcribe.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check auth status
      const { data: session } = await authClient.getSession();

      if (!session) {
        // Logged out: Save state and redirect to signup
        await savePendingJob(file);
        toast.info("Please sign up or log in to continue.");
        router.push("/sign-up");
        return;
      }

      // Logged in: Submit with default config
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", "Untitled Transcription");
      formData.append("language", "default");
      formData.append("model", "medium");
      formData.append("isSpeakerDiarized", "false");
      formData.append("numberOfSpeaker", "1");

      const response = await fetch("/api/transcribe-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error ? JSON.stringify(data.error) : "Upload failed.");
      }

      toast.success("Transcription started successfully.");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Try Skriptor Now</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload or record an audio file to see how fast our transcription works.</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400">Upload File</TabsTrigger>
            <TabsTrigger value="record" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400">Record Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <FileUploader
              value={file ? [file] : []}
              onValueChange={(files) => setFile(files && files.length > 0 ? files[0] : null)}
              dropzoneOptions={dropZoneConfig}
              className="relative rounded-lg p-2"
            >
              <FileInput id="liteFileInput" className="outline-dashed outline-2 outline-slate-300 dark:outline-slate-700 hover:outline-teal-600 dark:hover:outline-teal-500 transition-colors">
                <div className="flex items-center justify-center flex-col p-8 w-full">
                  <CloudUpload className="text-slate-400 w-10 h-10" />
                  <p className="mb-1 text-sm text-slate-500 dark:text-slate-400 mt-4">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-400">MP3, M4A, WAV, FLAC (Max 50MB)</p>
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
            {previewUrl && (
              <div className="w-full mt-4">
                <Label className="mb-2 block text-sm">Audio Preview</Label>
                <WaveformPlayer audioUrl={previewUrl} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="record">
            <div className="py-2">
              <AudioInput
                value={file}
                onValueChange={(f) => setFile(f ?? null)}
              />
            </div>
          </TabsContent>

          <div className="mt-6">
            <Button
              className="w-full h-12 text-lg font-medium bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
              onClick={handleTranscribe}
              disabled={!file || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Transcribe Now
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
