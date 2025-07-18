"use client";

import { Slider } from "@/components/ui/slider";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { AlertCircle, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranscriptionUploadStore } from "@/features/transcibe-upload/store/transcription-upload-store";

export function AudioPlayer() {
  const { audioUrl } = useTranscriptionUploadStore();
  const {
    isPlaying,
    duration,
    currentTime,
    isLoading,
    isReady,
    error,
    togglePlayPause,
    seekTo,
    formatTime,
    hasAudio,
  } = useAudioPlayer();

  const [sliderValue, setSliderValue] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Update slider when currentTime changes
  useEffect(() => {
    setSliderValue(currentTime);
  }, [currentTime]);

  // Handle errors with a delay to avoid flashing during transitions
  useEffect(() => {
    if (error) {
      // Small delay to avoid showing errors during transitions
      const timer = setTimeout(() => {
        setShowError(true);
        setErrorMessage(error);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
      setErrorMessage("");
    }
  }, [error]);

  // Determine if we should show the player
  useEffect(() => {
    // Only show player if we have a valid audio URL
    const isValidUrl = !!(audioUrl && audioUrl.trim() !== "");
    setShowPlayer(isValidUrl);

    // Reset error state when URL changes
    setShowError(false);
    setErrorMessage("");
  }, [audioUrl]);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    if (isFinite(newValue)) {
      setSliderValue(newValue);
    }
  };

  // Handle slider commit (when user releases slider)
  const handleSliderCommit = (value: number[]) => {
    const newValue = value[0];
    if (isFinite(newValue) && isReady) {
      seekTo(newValue);
    }
  };

  // Reset player
  const handleReset = () => {
    seekTo(0);
  };

  // Don't render anything if we don't have an audio URL
  if (!showPlayer) {
    return null;
  }

  // Show error message
  if (showError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Audio playback error. Please try a different browser or audio format.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg animate-pulse">
        <p className="text-sm text-muted-foreground">Loading audio...</p>
      </div>
    );
  }

  // Don't show player if no audio
  if (!hasAudio) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlayPause}
            disabled={!isReady || isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleReset}
            disabled={!isReady || currentTime === 0}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset</span>
          </Button>
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-xs text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      <Slider
        value={[sliderValue]}
        min={0}
        max={duration || 100}
        step={0.1}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
        disabled={!isReady || duration === 0}
        aria-label="Seek audio"
      />
    </div>
  );
}
