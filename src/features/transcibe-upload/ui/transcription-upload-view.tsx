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
import TranscriptionUploadFile from "./transcription-record-form";
import { uploadAudio } from "../server/initiate-job";
import TranscriptionUploadRecord from "./transcription-upload-form";
import TranscriptionUploadForm from "./transcription-upload-form";

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
              <TranscriptionUploadForm />
            </TabsContent>

            <TabsContent value="record" className="space-y-6">
              <p>audio record form</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
