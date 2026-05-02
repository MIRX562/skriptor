"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.js";
import HoverPlugin from "wavesurfer.js/dist/plugins/hover.js";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  RotateCcw, 
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WaveformPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export interface WaveformPlayerRef {
  jumpToTime: (timeInSeconds: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
}

export const WaveformPlayer = forwardRef<WaveformPlayerRef, WaveformPlayerProps>(
  function WaveformPlayer(
    {
      audioUrl,
      onTimeUpdate,
      onPlay,
      onPause,
      className,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const onTimeUpdateRef = useRef(onTimeUpdate);
    const onPlayRef = useRef(onPlay);
    const onPauseRef = useRef(onPause);
    
    useEffect(() => {
      onTimeUpdateRef.current = onTimeUpdate;
      onPlayRef.current = onPlay;
      onPauseRef.current = onPause;
    });

    // Handle volume changes without re-initializing WaveSurfer
    useEffect(() => {
      wavesurferRef.current?.setVolume(volume);
    }, [volume]);

    // Initialize WaveSurfer
    useEffect(() => {
      if (!containerRef.current) return;

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#94a3b8", // slate-400
        progressColor: "#0d9488", // teal-600
        cursorColor: "#0d9488",
        cursorWidth: 2,
        barWidth: 2,
        barGap: 1,
        barRadius: 30,
        height: 80,
        normalize: true,
        plugins: [
          // Timeline plugin
          TimelinePlugin.create({
            container: timelineRef.current!,
            style: {
              color: "#64748b",
              fontFamily: "Geist Mono, monospace",
              fontSize: "10px",
            },
          }),
          // Hover plugin for a nice preview effect
          HoverPlugin.create({
            lineColor: "#0d9488",
            lineWidth: 2,
            labelBackground: "#0d9488",
            labelColor: "#fff",
            labelSize: "10px",
          }),
        ],
      });

      wavesurferRef.current = ws;

      // Load audio
      ws.load(audioUrl).catch((err) => {
        if (err && err.name === "AbortError") return;
        console.error("WaveSurfer load error:", err);
      });

      // Event listeners
      ws.on("ready", () => {
        setDuration(ws.getDuration());
        setIsLoading(false);
      });

      ws.on("timeupdate", (time) => {
        setCurrentTime(time);
        onTimeUpdateRef.current?.(time);
      });

      ws.on("play", () => {
        setIsPlaying(true);
        onPlayRef.current?.();
      });

      ws.on("pause", () => {
        setIsPlaying(false);
        onPauseRef.current?.();
      });

      ws.on("error", (e: Error | any) => {
        if (e && e.name === "AbortError") return;
        console.error("WaveSurfer error:", e);
        setError("Failed to load audio");
        setIsLoading(false);
      });

      ws.on("finish", () => {
        setIsPlaying(false);
        ws.setTime(0);
      });

      return () => {
        try {
          ws.destroy();
        } catch (err) {
          // Ignore AbortError when destroying during fetch
        }
      };
    }, [audioUrl]); // Only re-initialize if audioUrl changes

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      jumpToTime: (timeInSeconds: number) => {
        if (!wavesurferRef.current || !isFinite(timeInSeconds)) return;
        wavesurferRef.current.setTime(timeInSeconds);
      },
      play: () => wavesurferRef.current?.play(),
      pause: () => wavesurferRef.current?.pause(),
      togglePlay: () => wavesurferRef.current?.playPause(),
    }));

    const togglePlayPause = () => {
      wavesurferRef.current?.playPause();
    };

    const handleVolumeChange = (value: number[]) => {
      const newVolume = value[0];
      setVolume(newVolume);
      wavesurferRef.current?.setVolume(newVolume);
    };

    const skipForward = () => {
      if (!wavesurferRef.current) return;
      wavesurferRef.current.setTime(Math.min(wavesurferRef.current.getCurrentTime() + 5, duration));
    };

    const skipBackward = () => {
      if (!wavesurferRef.current) return;
      wavesurferRef.current.setTime(Math.max(wavesurferRef.current.getCurrentTime() - 5, 0));
    };

    // Format time as MM:SS
    const formatTime = (timeInSeconds: number): string => {
      if (!isFinite(timeInSeconds)) return "00:00";
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
      <div className={cn("flex flex-col space-y-4 w-full", className)}>
        {/* Waveform Container */}
        <div className="relative bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 transition-all duration-300">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                <span className="text-xs font-medium text-teal-600">Generating waveform...</span>
              </div>
            </div>
          )}
          
          <div ref={containerRef} className="w-full" />
          <div ref={timelineRef} className="w-full mt-1" />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 dark:hover:text-teal-400 border-slate-200 dark:border-slate-800"
              onClick={skipBackward}
              disabled={isLoading || !!error}
              title="Skip back 5s"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg shadow-teal-500/20 bg-teal-600 hover:bg-teal-700 text-white"
              onClick={togglePlayPause}
              disabled={isLoading || !!error}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 fill-current ml-1" />
              )}
              <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 dark:hover:text-teal-400 border-slate-200 dark:border-slate-800"
              onClick={skipForward}
              disabled={isLoading || !!error}
              title="Skip forward 5s"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Time Display */}
          <div className="flex items-center space-x-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner">
            <span className="text-sm font-mono font-medium text-teal-600 dark:text-teal-400">
              {formatTime(currentTime)}
            </span>
            <span className="text-slate-400 dark:text-slate-500">/</span>
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3 min-w-[140px]">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-teal-600"
              onClick={() => handleVolumeChange([volume === 0 ? 0.8 : 0])}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-md border border-red-200 dark:border-red-900 text-center">
            {error}
          </div>
        )}
      </div>
    );
  }
);
