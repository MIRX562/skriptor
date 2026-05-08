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
import SpotlightCard from "@/components/SpotlightCard";
import ShinyText from "@/components/ShinyText";

interface LiteTranscriptionFormProps {
  dict: any;
  common: any;
  fullDict: any;
}

export function LiteTranscriptionForm({ dict, common, fullDict }: LiteTranscriptionFormProps) {
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
      toast.error(dict.messages.noFile);
      return;
    }

    setIsSubmitting(true);

    try {
      // Check auth status
      const { data: session } = await authClient.getSession();

      if (!session) {
        // Logged out: Save state and redirect to signup
        await savePendingJob(file);
        toast.info(dict.messages.authRequired);
        router.push("/sign-up");
        return;
      }

      // Logged in: Submit with default config
      // 1. Get presigned URL
      const presignedResponse = await fetch("/api/transcribe-upload/presigned-url", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!presignedResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, storageKey } = await presignedResponse.json();

      // 2. Upload directly to S3
      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!s3Response.ok) {
        throw new Error("Failed to upload file to storage");
      }

      // 3. Initiate transcription job
      const formData = new FormData();
      formData.append("storageKey", storageKey);
      formData.append("title", common.untitled);
      formData.append("language", "default");
      formData.append("model", "turbo");
      formData.append("isSpeakerDiarized", "false");
      formData.append("numberOfSpeaker", "1");
      formData.append("fileSize", file.size.toString());
      formData.append("fileType", file.type);

      const response = await fetch("/api/transcribe-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error ? JSON.stringify(data.error) : dict.messages.uploadFailed);
      }

      toast.success(dict.messages.started);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : dict.messages.uploadFailed);
      setIsSubmitting(false);
    }
  };

  return (
    <SpotlightCard 
      className="w-full max-w-xl mx-auto border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.15)] bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl"
      spotlightColor="rgba(20, 184, 166, 0.15)"
    >
      <CardContent className="p-0">
        <div className="mb-6 text-center">
          <ShinyText 
            text={dict.title} 
            className="text-2xl font-bold mb-1" 
            color="#0d9488" 
            shineColor="#5eead4" 
          />
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{dict.description}</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400">{dict.tabs.upload}</TabsTrigger>
            <TabsTrigger value="record" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400">{dict.tabs.record}</TabsTrigger>
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
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{dict.uploadArea.clickToUpload}</span> {dict.uploadArea.orDragAndDrop}
                  </p>
                  <p className="text-xs text-slate-400">{dict.uploadArea.hint}</p>
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
                <Label className="mb-2 block text-sm">{dict.audioPreview}</Label>
                <WaveformPlayer audioUrl={previewUrl} dict={fullDict} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="record">
            <div className="py-2">
              <AudioInput
                value={file}
                onValueChange={(f) => setFile(f ?? null)}
                dict={fullDict}
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
                  {dict.processing}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  {dict.submit}
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </SpotlightCard>
  );
}
