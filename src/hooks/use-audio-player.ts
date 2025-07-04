"use client";

import { useUploadStore } from "@/features/transcibe-upload/store/upload-store";
import { useEffect, useRef, useState, useCallback } from "react";

export function useAudioPlayer() {
  const {
    audioUrl,
    isPlaying: storeIsPlaying,
    setIsPlaying,
  } = useUploadStore();
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
    // Only initialize once
    if (isInitialized.current) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      isInitialized.current = true;

      // Add event listeners
      const audio = audioRef.current;

      audio.addEventListener("loadstart", () => {
        console.log("Audio loading started");
        setIsLoading(true);
        setIsReady(false);
        setError(null);
      });

      audio.addEventListener("canplaythrough", () => {
        console.log("Audio can play through");
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
        // Only log and set error if we have a valid URL and are not in cleanup
        if (hasValidUrl.current) {
          const errorMessage = audio.error
            ? `Error: ${audio.error.code} - ${audio.error.message}`
            : "Unknown error";
          console.error("Audio error:", e, errorMessage);
          setIsLoading(false);
          setIsReady(false);
          setError(errorMessage);
        }
      });
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        try {
          const audio = audioRef.current;
          audio.pause();
          audio.src = "";

          // We don't actually remove the event listeners to avoid memory leaks
          // with anonymous functions, but we do clean up the audio element
        } catch (e) {
          console.error("Error cleaning up audio:", e);
        }
      }
    };
  }, [setIsPlaying]);

  // Update audio source when URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isInitialized.current) return;

    // Reset state
    setIsLoading(false);
    setIsReady(false);
    setDuration(0);
    setCurrentTime(0);
    setError(null);

    // If playing, pause first
    if (storeIsPlaying) {
      audio.pause();
      setIsPlaying(false);
    }

    // Check if we have a valid URL
    const isValidUrl = !!(audioUrl && audioUrl.trim() !== "");
    hasValidUrl.current = isValidUrl;

    // Set new source if available
    if (isValidUrl) {
      console.log("Setting audio source:", audioUrl);
      setIsLoading(true);

      // Use a timeout to ensure clean state transition
      setTimeout(() => {
        if (audio) {
          try {
            audio.src = audioUrl;
            audio.load();
          } catch (err) {
            console.error("Error setting audio source:", err);
            setError("Failed to load audio source");
            setIsLoading(false);
          }
        }
      }, 50);
    } else {
      // Clear the source if URL is invalid
      try {
        audio.src = "";
        hasValidUrl.current = false;
      } catch (e) {
        console.error("Error clearing audio source:", e);
      }
    }

    // Cleanup function for this effect
    return () => {
      if (audio) {
        try {
          audio.pause();
          // Don't clear src here as it causes the error
          // We'll handle src changes in the main effect body
        } catch (e) {
          console.error("Error pausing audio:", e);
        }
      }
    };
  }, [audioUrl, storeIsPlaying, setIsPlaying]);

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isReady || !hasValidUrl.current) return;

    if (storeIsPlaying) {
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            setError("Could not play audio. Try clicking play again.");
          });
        }
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      }
    } else {
      try {
        audio.pause();
      } catch (e) {
        console.error("Error pausing audio:", e);
      }
    }
  }, [storeIsPlaying, isReady, setIsPlaying]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!isReady || isLoading || !hasValidUrl.current) return;
    setIsPlaying(!storeIsPlaying);
  }, [storeIsPlaying, isReady, isLoading, setIsPlaying]);

  // Seek to a specific time
  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio || !isReady || !hasValidUrl.current) return;

      try {
        // Validate time is a finite number and within bounds
        if (isFinite(time) && time >= 0 && time <= (audio.duration || 0)) {
          audio.currentTime = time;
          setCurrentTime(time);
        }
      } catch (error) {
        console.error("Error seeking audio:", error);
      }
    },
    [isReady]
  );

  // Format time as MM:SS
  const formatTime = useCallback((timeInSeconds: number): string => {
    if (!isFinite(timeInSeconds)) return "00:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    isPlaying: storeIsPlaying,
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
