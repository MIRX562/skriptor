"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  StopCircle, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AudioInputProps = {
  value: File | null;
  onValueChange: (file: File | null) => void;
  className?: string;
};

function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: blob.type });
}

export const AudioInput: React.FC<AudioInputProps> = ({
  onValueChange,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const recordRef = useRef<ReturnType<typeof RecordPlugin.create> | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const onValueChangeRef = useRef(onValueChange);
  const [timer, setTimer] = useState(0);

  // Update ref when onValueChange changes
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  // Initialize WaveSurfer and Record Plugin
  const initWaveSurfer = useCallback(() => {
    if (!containerRef.current) return;
    if (wavesurferRef.current) wavesurferRef.current.destroy();

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
    });

    const record = ws.registerPlugin(RecordPlugin.create({
      scrollingWaveform: true,
      renderRecordedAudio: true,
    }));

    record.on("record-end", (blob: Blob) => {
      const mimeType = blob.type || "audio/wav";
      const file = blobToFile(
        blob,
        `recording_${Date.now()}.${mimeType.includes("webm") ? "webm" : "wav"}`
      );
      onValueChangeRef.current?.(file);
      setIsRecorded(true);

      // Clean up previous URL if it exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      
      // Create new URL and load it into WaveSurfer for playback
      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;
      ws.load(objectUrl).catch((err) => {
        if (err && err.name === "AbortError") return;
        console.error("WaveSurfer load error:", err);
      });
    });

    // We only want to set duration after the audio has been fully loaded into WaveSurfer
    ws.on("ready", () => {
      setDuration(ws.getDuration());
    });

    record.on("record-progress", (time: number) => {
      setTimer(Math.floor(time / 1000));
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("timeupdate", (time) => setCurrentTime(time));
    ws.on("finish", () => setIsPlaying(false));

    wavesurferRef.current = ws;
    recordRef.current = record;
  }, []); // Remove onValueChange from dependencies

  useEffect(() => {
    initWaveSurfer();
    return () => {
      try {
        wavesurferRef.current?.destroy();
      } catch (err) {
        // Ignore AbortError when destroying during fetch
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [initWaveSurfer]);

  const startRecording = async () => {
    try {
      setError(null);
      await recordRef.current?.startRecording();
      setIsRecording(true);
      setIsPaused(false);
      setIsRecorded(false);
      setTimer(0);
    } catch (err) {
      const error = err as Error;
      console.error("Recording error:", error);
      let msg = "Could not start recording.";
      if (error.name === "NotAllowedError") msg = "Microphone access denied.";
      else if (error.name === "NotFoundError") msg = "No microphone found.";
      setError(msg);
      toast.error(msg);
    }
  };

  const stopRecording = () => {
    recordRef.current?.stopRecording();
    setIsRecording(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (isPaused) {
      recordRef.current?.resumeRecording();
      setIsPaused(false);
    } else {
      recordRef.current?.pauseRecording();
      setIsPaused(true);
    }
  };

  const resetRecording = () => {
    setIsRecorded(false);
    setIsRecording(false);
    setIsPlaying(false);
    setTimer(0);
    setCurrentTime(0);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setDuration(0);
    onValueChangeRef.current?.(null);
    initWaveSurfer();
  };

  const togglePlayPause = () => {
    wavesurferRef.current?.playPause();
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex flex-col w-full gap-4", className)}>
      <div className="relative bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-teal-500/50 group">
        
        {/* Waveform View */}
        <div className={cn(
          "w-full transition-opacity duration-300",
          (isRecording || isRecorded) ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        )}>
          <div ref={containerRef} className="w-full" />
        </div>

        {/* Empty State */}
        {!isRecording && !isRecorded && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Mic className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">Click the button below to start recording</p>
            <p className="text-xs">Your audio will be visualized in real-time</p>
          </div>
        )}

        {/* Status Overlay (Recording) */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isPaused ? "Paused" : "Recording"}
            </span>
          </div>
        )}
      </div>

      {/* Info & Timer */}
      {(isRecording || isRecorded) && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formatTime(isRecording ? timer : currentTime)}
                </span>
                {isRecorded && (
                  <>
                    <span className="text-slate-400">/</span>
                    <span className="text-sm font-mono text-slate-500">
                      {formatTime(duration)}
                    </span>
                  </>
                )}
             </div>
             {isRecording && (
               <span className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                 Speaking now...
               </span>
             )}
          </div>
          
          {isRecorded && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={resetRecording}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Discard
            </Button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording && !isRecorded ? (
          <Button
            type="button"
            size="lg"
            className="h-16 w-16 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
            onClick={startRecording}
          >
            <Mic className="w-8 h-8 fill-current" />
          </Button>
        ) : isRecording ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-full border-2 border-slate-200 dark:border-slate-800"
              onClick={togglePause}
            >
              {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="h-16 w-16 rounded-full shadow-xl shadow-red-500/20 animate-in zoom-in duration-300"
              onClick={stopRecording}
            >
              <StopCircle className="w-8 h-8 fill-current" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full hover:bg-background"
              onClick={() => {
                wavesurferRef.current?.setTime(0);
                wavesurferRef.current?.play();
              }}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              size="lg"
              className="h-14 w-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </Button>
            <div className="w-12 h-12 flex items-center justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioInput;
