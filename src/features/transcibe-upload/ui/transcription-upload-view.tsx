"use client";

import type React from "react";
import { useRef, useState } from "react";
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
import { Mic, Pause, Play, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranscriptionUploadStore } from "../store/transcription-upload-store";
import { AudioPlayer } from "@/components/audio-player";
import { blobToAudioUrl, createAudioRecorder } from "@/lib/audio-utils";
import TranscriptionUploadFile from "./transcription-upload-view-tabs-upload";
import { uploadAudio } from "../server/upload-audio";
import TranscriptionUploadRecord from "./transcription-upload-view-tabs-record";

export function TranscriptionUpload() {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const languageSelectRef = useRef<HTMLSelectElement>(null);

  const [activeTab, setActiveTab] = useState("upload");

  // Store state
  const {
    files,
    setFiles,
    audioUrl,
    setAudioUrl,
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    reset,
  } = useTranscriptionUploadStore();

  // Audio recorder instance
  const recorderRef = useRef<any>(null);

  // Advanced options state
  const [model, setModel] = useState("medium");
  const [isSpeakerDiarized, setIsSpeakerDiarized] = useState(false);
  const [numberOfSpeaker, setNumberOfSpeaker] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio recording logic
  const handleRecordToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
      recorderRef.current?.stop();
    } else {
      setIsRecording(true);
      recorderRef.current = createAudioRecorder(
        () => {},
        async (blob: Blob) => {
          setIsRecording(false);
          setFiles([]);
          const url = await blobToAudioUrl(blob);
          setAudioUrl(url);
        }
      );
      recorderRef.current.start();
    }
  };

  // Advanced options handlers
  const handleModelChange = (val: string) => setModel(val);
  const handleSpeakerDiarizedChange = (val: boolean) => {
    setIsSpeakerDiarized(val);
    if (!val) setNumberOfSpeaker(1);
  };
  const handleNumberOfSpeakerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > 10) value = 10;
    setNumberOfSpeaker(value);
  };

  // Main upload handler
  const handleStartTranscription = async () => {
    setError(null);
    if (!files || files.length === 0) {
      setError("Please upload or record an audio file.");
      return;
    }
    const title = titleInputRef.current?.value?.trim();
    if (!title) {
      setError("Please enter a title.");
      return;
    }
    const language = languageSelectRef.current?.value || "auto";
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", files[0]);
      formData.append("title", title);
      formData.append("language", language);
      formData.append("model", model);
      formData.append("isSpeakerDiarized", String(isSpeakerDiarized));
      formData.append("numberOfSpeaker", String(numberOfSpeaker));
      const result = await uploadAudio(formData);
      reset();
      // Optionally show a toast or redirect
    } catch (e: any) {
      setError(e?.message || "Failed to start transcription.");
    } finally {
      setLoading(false);
    }
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
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
              <TranscriptionUploadFile />
            </TabsContent>

            <TabsContent value="record" className="space-y-6">
              <TranscriptionUploadRecord />
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
                    value={model}
                    onValueChange={handleModelChange}
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
                    checked={isSpeakerDiarized}
                    onCheckedChange={handleSpeakerDiarizedChange}
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
                    {isSpeakerDiarized && (
                      <div className="mt-2">
                        <Label htmlFor="number-of-speaker" className="text-xs">
                          Number of Speakers (max 10)
                        </Label>
                        <input
                          id="number-of-speaker"
                          type="number"
                          min={1}
                          max={10}
                          value={numberOfSpeaker}
                          onChange={handleNumberOfSpeakerChange}
                          className="w-20 border rounded px-2 py-1 text-sm mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Speaker count UI only, no logic */}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={reset} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleStartTranscription} disabled={loading}>
            {loading ? (
              <span className="mr-2">Uploading...</span>
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Start Transcription
          </Button>
        </CardFooter>
        {error && <div className="text-red-500 text-sm px-6 pb-4">{error}</div>}
      </Card>
    </motion.div>
  );
}
