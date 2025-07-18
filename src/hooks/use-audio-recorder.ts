"use client";

import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranscriptionUploadStore } from "@/features/transcibe-upload/store/transcription-upload-store";
import { blobToAudioUrl } from "@/lib/audio-utils";

export function useAudioRecorder() {
  const { toast } = useToast();
  const {
    isRecording,
    recordingTime,
    setIsRecording,
    setRecordingTime,
    setAudioUrl,
    setFiles,
    setError,
  } = useTranscriptionUploadStore();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // Clean up on unmount
  useEffect(() => cleanup, [cleanup]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(recordingTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, setRecordingTime, recordingTime]);

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];
      setRecordingTime(0);
      setIsRecording(true);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = async () => {
        if (chunksRef.current.length === 0) {
          setError("No audio data was recorded. Please try again.");
          cleanup();
          return;
        }
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) {
          setError("Recorded audio is empty. Please try again.");
          cleanup();
          return;
        }
        const url = await blobToAudioUrl(blob);
        setAudioUrl(url);
        setFiles([]); // Clear file input if any
        cleanup();
      };
      mediaRecorder.start();
    } catch {
      setError(
        "Could not access microphone. Please check your browser permissions."
      );
      toast({
        title: "Recording Error",
        description:
          "Could not access microphone. Please check your browser permissions.",
        variant: "destructive",
      });
      cleanup();
    }
  }, [
    setAudioUrl,
    setFiles,
    setError,
    setRecordingTime,
    setIsRecording,
    toast,
    cleanup,
  ]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [setIsRecording]);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
  };
}
