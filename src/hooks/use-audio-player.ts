"use client";

import { useTranscriptionUploadStore } from "@/features/transcibe-upload/store/transcription-upload-store";
import { useEffect, useRef, useState, useCallback } from "react";

export function useAudioPlayer() {
  const { audioUrl } = useTranscriptionUploadStore();
  // Local play state for isolation
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasValidUrl = useRef(false);
  const isInitialized = useRef(false);

  // Initialize audio element
  useEffect(() => {
    if (isInitialized.current) return;
    audioRef.current = new Audio();
    isInitialized.current = true;
    const audio = audioRef.current;
    audio.addEventListener("loadstart", () => {
      setIsLoading(true);
      setIsReady(false);
      setError(null);
    });
    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      setIsReady(true);
      setDuration(audio.duration);
    });
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    });
    audio.addEventListener("error", (e) => {
      if (hasValidUrl.current) {
        setIsLoading(false);
        setIsReady(false);
        setError("Audio playback error");
      }
    });
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch {}
      }
    };
  }, []);

  // Update audio source when URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isInitialized.current) return;
    setIsLoading(false);
    setIsReady(false);
    setDuration(0);
    setCurrentTime(0);
    setError(null);
    setIsPlaying(false);
    const isValidUrl = !!(audioUrl && audioUrl.trim() !== "");
    hasValidUrl.current = isValidUrl;
    if (isValidUrl) {
      setIsLoading(true);
      setTimeout(() => {
        if (audio) {
          try {
            audio.src = audioUrl;
            audio.load();
          } catch {
            setError("Failed to load audio source");
            setIsLoading(false);
          }
        }
      }, 50);
    } else {
      try {
        audio.src = "";
        hasValidUrl.current = false;
      } catch {}
    }
    return () => {
      if (audio) {
        try {
          audio.pause();
        } catch {}
      }
    };
  }, [audioUrl]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady || !hasValidUrl.current) return;
    if (isPlaying) {
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setIsPlaying(false);
            setError("Could not play audio. Try clicking play again.");
          });
        }
      } catch {
        setIsPlaying(false);
      }
    } else {
      try {
        audio.pause();
      } catch {}
    }
  }, [isPlaying, isReady]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!isReady || isLoading || !hasValidUrl.current) return;
    setIsPlaying((prev) => !prev);
  }, [isReady, isLoading]);

  // Seek to a specific time
  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio || !isReady || !hasValidUrl.current) return;
      try {
        if (isFinite(time) && time >= 0 && time <= (audio.duration || 0)) {
          audio.currentTime = time;
          setCurrentTime(time);
        }
      } catch {}
    },
    [isReady]
  );

  // Format time as MM:SS
  const formatTime = useCallback((timeInSeconds: number): string => {
    if (!isFinite(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return {
    isPlaying,
    duration: isFinite(duration) ? duration : 0,
    currentTime: isFinite(currentTime) ? currentTime : 0,
    isLoading,
    isReady,
    error,
    togglePlayPause,
    seekTo,
    formatTime,
    hasAudio: hasValidUrl.current && !error,
  };
}
