"use client";

import type React from "react";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Mic, Pause, Play, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { uploadAudio } from "../server/upload-audio";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "id", label: "Indonesian" },
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "cs", label: "Czech" },
  { value: "da", label: "Danish" },
  { value: "nl", label: "Dutch" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "fi", label: "Finnish" },
  { value: "fr", label: "French" },
  { value: "he", label: "Hebrew" },
  { value: "hu", label: "Hungarian" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portuguese" },
  { value: "ro", label: "Romanian" },
  { value: "ru", label: "Russian" },
  { value: "sv", label: "Swedish" },
  { value: "tr", label: "Turkish" },
  { value: "vi", label: "Vietnamese" },
];

export function TranscriptionUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("auto");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const handleRecordToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        // Set the recorded audio as the selected file for upload
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setSelectedFile(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000
      );
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();

    if (selectedFile) {
      formData.append("audio", selectedFile);
    } else if (recordedBlob) {
      const file = new File([recordedBlob], "recording.webm", {
        type: "audio/webm",
      });
      formData.append("audio", file);
    } else {
      return;
    }

    formData.append("title", title);
    formData.append("language", language);

    await uploadAudio(formData);

    setUploadProgress(100);
    setTimeout(() => setIsUploading(false), 500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Transcription</CardTitle>
          <CardDescription>
            Upload an audio file or record directly to transcribe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Upload File
              </TabsTrigger>
              <TabsTrigger
                value="record"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Record Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-teal-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <FileUp className="h-10 w-10 text-teal-400" />
                    </motion.div>
                    <h3 className="font-medium">
                      Drag and drop your file here or click to browse
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Supports MP3, WAV, M4A, FLAC (max 500MB)
                    </p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".mp3,.wav,.m4a,.flac"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                          <div>
                            <p className="font-medium text-sm">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>

                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="record" className="space-y-6">
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 p-8 border rounded-lg">
                  <motion.div
                    animate={
                      isRecording
                        ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }
                        : {}
                    }
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.5,
                    }}
                    className={`rounded-full p-6 ${isRecording ? "bg-red-100 dark:bg-red-900/30" : "bg-slate-100 dark:bg-slate-800"}`}
                  >
                    <Mic
                      className={`h-10 w-10 ${isRecording ? "text-red-500 dark:text-red-400" : "text-teal-500"}`}
                    />
                  </motion.div>

                  <div className="text-center">
                    <div className="text-2xl font-mono">
                      {formatTime(recordingTime)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRecording
                        ? "Recording in progress..."
                        : "Ready to record"}
                    </p>
                  </div>

                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    className="rounded-full w-12 h-12 p-0"
                    onClick={handleRecordToggle}
                  >
                    {isRecording ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Transcription Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your transcription"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language (Optional)</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile && !isRecording}
          >
            <Upload className="mr-2 h-4 w-4" />
            Start Transcription
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
