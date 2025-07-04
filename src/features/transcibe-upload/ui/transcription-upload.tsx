"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUploadStore } from "../store/upload-store";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useTranscriptionListStore } from "@/features/transcribe-manage/store/transcription-list-store";
import { AudioPlayer } from "@/components/audio-player";

export function TranscriptionUpload() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const languageSelectRef = useRef<HTMLSelectElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);

  const {
    selectedFile,
    isUploading,
    uploadProgress,
    recordingTime,
    audioUrl,
    speakerIdentification,
    speakerCount,
    transcriptionSpeed,
    error,
    setSelectedFile,
    startUpload,
    updateUploadProgress,
    completeUpload,
    setSpeakerIdentification,
    setSpeakerCount,
    setTranscriptionSpeed,
    reset,
  } = useUploadStore();

  const { startRecording, stopRecording, isRecording } = useAudioRecorder();

  const { createTranscription } = useTranscriptionListStore();

  // Clean up audio when switching tabs
  useEffect(() => {
    // Reset audio state when changing tabs
    reset();
  }, [activeTab, reset]);

  // Display error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  // Set up global drag and drop handlers
  useEffect(() => {
    if (activeTab !== "upload") return;

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      setIsDragging(true);
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Only consider it a leave if we're leaving the window
      if (
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
        }
        dragTimeoutRef.current = setTimeout(() => {
          setIsDragging(false);
        }, 100);
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      setIsDragging(false);
    };

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);
    window.addEventListener("dragover", (e) => e.preventDefault());

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
      window.removeEventListener("dragover", (e) => e.preventDefault());
    };
  }, [activeTab]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
      }
    },
    [setSelectedFile]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    const title = titleInputRef.current?.value || selectedFile.name;
    const language = languageSelectRef.current?.value || "auto";

    startUpload();

    // Simulate upload progress
    const interval = setInterval(() => {
      updateUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    try {
      // Create a new transcription in the list
      await createTranscription({
        title,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        duration: "00:00", // This would be determined by the actual file
        status: "queued",
        mode: transcriptionSpeed,
        progress: 0,
      });

      // Complete the upload
      setTimeout(() => {
        clearInterval(interval);
        completeUpload();

        toast({
          title: "Success",
          description:
            "Your file has been uploaded and queued for transcription.",
        });

        // Reset the form after a delay
        setTimeout(() => {
          reset();
        }, 1500);
      }, 2000);
    } catch (err) {
      clearInterval(interval);
      // Error handling is done in the store
    }
  }, [
    selectedFile,
    startUpload,
    updateUploadProgress,
    createTranscription,
    transcriptionSpeed,
    completeUpload,
    toast,
    reset,
  ]);

  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleTabChange = useCallback(
    (value: string) => {
      // Reset audio state before changing tabs
      reset();
      setActiveTab(value);
    },
    [reset]
  );

  // Optimized drop handler
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const validTypes = [
          ".mp3",
          ".wav",
          ".m4a",
          ".flac",
          "audio/mp3",
          "audio/wav",
          "audio/m4a",
          "audio/flac",
          "audio/mpeg",
        ];
        const fileType = file.type.toLowerCase();
        const fileExtension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();

        if (
          validTypes.includes(fileType) ||
          validTypes.includes(fileExtension)
        ) {
          setSelectedFile(file);
          if (titleInputRef.current && !titleInputRef.current.value) {
            titleInputRef.current.value = file.name;
          }
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload an audio file (MP3, WAV, M4A, FLAC)",
            variant: "destructive",
          });
        }
      }
    },
    [setSelectedFile, toast]
  );

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
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
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
                  ref={dropZoneRef}
                  className={`border-2 ${
                    isDragging
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                      : "border-dashed hover:bg-slate-50 dark:hover:bg-slate-900"
                  } rounded-lg p-8 text-center cursor-pointer transition-colors`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <motion.div
                      whileHover={{ y: -5 }}
                      animate={
                        isDragging
                          ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }
                          : {}
                      }
                      transition={
                        isDragging
                          ? { repeat: Number.POSITIVE_INFINITY, duration: 1.5 }
                          : { type: "spring", stiffness: 400, damping: 10 }
                      }
                    >
                      <FileUp
                        className={`h-10 w-10 ${isDragging ? "text-teal-500 dark:text-teal-400" : "text-slate-400"}`}
                      />
                    </motion.div>
                    <h3 className="font-medium">
                      {isDragging
                        ? "Drop your file here"
                        : "Drag and drop your file here or click to browse"}
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
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>

                      {activeTab === "upload" && audioUrl && (
                        <div key="upload-player-container">
                          <AudioPlayer />
                        </div>
                      )}

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
                      className={`h-10 w-10 ${isRecording ? "text-red-500 dark:text-red-400" : "text-slate-500"}`}
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

                {activeTab === "record" && audioUrl && !isRecording && (
                  <div
                    className="border rounded-lg p-4"
                    key="record-player-container"
                  >
                    <h4 className="font-medium mb-2">Preview Recording</h4>
                    <AudioPlayer />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Transcription Title</Label>
              <Input
                id="title"
                ref={titleInputRef}
                placeholder="Enter a title for your transcription"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language (Optional)</Label>
              <select
                id="language"
                ref={languageSelectRef}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="auto">Auto-detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
              <h3 className="font-medium text-slate-900 dark:text-white">
                Advanced Options
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Transcription Speed</Label>
                  <RadioGroup
                    value={transcriptionSpeed}
                    onValueChange={(value) =>
                      setTranscriptionSpeed(
                        value as "fast" | "medium" | "super"
                      )
                    }
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
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="speaker-identification"
                    checked={speakerIdentification}
                    onCheckedChange={(checked) =>
                      setSpeakerIdentification(checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="speaker-identification"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Enable Speaker Identification
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically identify and label different speakers in
                      your audio
                    </p>
                  </div>
                </div>

                {speakerIdentification && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="speaker-count">Number of Speakers</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setSpeakerCount(Math.max(1, speakerCount - 1))
                          }
                          disabled={speakerCount <= 1}
                        >
                          <span className="sr-only">Decrease</span>
                          <span className="text-lg">-</span>
                        </Button>
                        <Input
                          id="speaker-count"
                          type="number"
                          min={1}
                          max={10}
                          value={speakerCount}
                          onChange={(e) =>
                            setSpeakerCount(
                              Number.parseInt(e.target.value) || 1
                            )
                          }
                          className="w-16 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setSpeakerCount(Math.min(10, speakerCount + 1))
                          }
                          disabled={speakerCount >= 10}
                        >
                          <span className="sr-only">Increase</span>
                          <span className="text-lg">+</span>
                        </Button>
                        <span className="text-sm text-muted-foreground ml-2">
                          (Max 10)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={reset}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={(!selectedFile && !isRecording) || isUploading}
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Transcription
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
