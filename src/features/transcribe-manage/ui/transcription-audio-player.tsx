"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptionAudioPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export const TranscriptionAudioPlayer = forwardRef(
  function TranscriptionAudioPlayer(
    {
      audioUrl,
      onTimeUpdate,
      onPlay,
      onPause,
      className,
    }: TranscriptionAudioPlayerProps,
    ref
  ) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isInitialized = useRef(false);
    const isSeeking = useRef(false);

    // Expose `jumpToTime` via a ref
    useImperativeHandle(ref, () => ({
      jumpToTime: (timeInSeconds: number) => {
        if (!audioRef.current || !isFinite(timeInSeconds)) return;

        audioRef.current.currentTime = timeInSeconds;
        setCurrentTime(timeInSeconds);
        onTimeUpdate?.(timeInSeconds);
      },
    }));

    // Log the audioUrl to debug the path
    useEffect(() => {
      console.log("Audio URL:", audioUrl);
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        isInitialized.current = true;

        const audio = audioRef.current;
        audio.volume = volume;

        // Add event listeners
        audio.addEventListener("loadedmetadata", () => {
          setDuration(audio.duration);
          setIsLoading(false);
        });

        audio.addEventListener("timeupdate", () => {
          if (!isSeeking.current) {
            setCurrentTime(audio.currentTime);
            onTimeUpdate?.(audio.currentTime);
          }
        });

        audio.addEventListener("ended", () => {
          setIsPlaying(false);
          setCurrentTime(0);
          audio.currentTime = 0;
        });

        audio.addEventListener("play", () => {
          setIsPlaying(true);
          onPlay?.();
        });

        audio.addEventListener("pause", () => {
          setIsPlaying(false);
          onPause?.();
        });

        audio.addEventListener("error", (e) => {
          console.error("Audio error:", e);
          setError("Failed to load audio");
          setIsLoading(false);
        });

        // Start loading
        audio.load();
      }

      // Cleanup function
      return () => {
        if (audioRef.current) {
          const audio = audioRef.current;
          audio.pause();
          audio.src = "";
          // We don't remove event listeners to avoid memory leaks
        }
      };
    }, [audioUrl, onTimeUpdate, onPlay, onPause, volume]);

    // Handle play/pause
    const togglePlayPause = () => {
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err);
          setError("Failed to play audio");
        });
      }
    };

    // Handle seeking
    const handleSeek = (value: number[]) => {
      if (!audioRef.current || !isFinite(value[0])) return;

      isSeeking.current = true;
      setCurrentTime(value[0]);
    };

    const handleSeekCommit = (value: number[]) => {
      if (!audioRef.current || !isFinite(value[0])) return;

      audioRef.current.currentTime = value[0];
      isSeeking.current = false;
      onTimeUpdate?.(value[0]);
    };

    // Handle volume change
    const handleVolumeChange = (value: number[]) => {
      if (!audioRef.current || !isFinite(value[0])) return;

      const newVolume = value[0];
      setVolume(newVolume);
      audioRef.current.volume = newVolume;
    };

    // Format time as MM:SS
    const formatTime = (timeInSeconds: number): string => {
      if (!isFinite(timeInSeconds)) return "00:00";

      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlayPause}
            disabled={isLoading || !!error}
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

          <div className="flex-1 flex items-center space-x-2">
            <span className="text-xs font-mono w-10">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              onValueCommit={handleSeekCommit}
              disabled={isLoading || !!error || duration === 0}
              className="flex-1"
            />
            <span className="text-xs font-mono w-10">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleVolumeChange([volume === 0 ? 0.5 : 0])}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="sr-only">Volume</span>
            </Button>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
