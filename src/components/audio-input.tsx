import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import AudioPlayer from "./audio-player";

interface AudioInputProps {
  onFileChange?: (file: File | null) => void;
  className?: string;
}

export default function AudioInput({
  onFileChange,
  className,
}: AudioInputProps) {
  // --- State and refs for recording ---
  const [isRecording, setIsRecording] = useState(false);
  // Removed isRecordingFinished (unused)
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  // removed audioFile (unused)
  const [showConfirm, setShowConfirm] = useState(false);
  // removed audioDuration, playing (handled by AudioPlayer)
  // Removed duration (unused)
  // removed unused audioRef
  const mediaRecorderRef = useRef<{
    stream: MediaStream | null;
    analyser: AnalyserNode | null;
    mediaRecorder: MediaRecorder | null;
    audioContext: AudioContext | null;
  }>({
    stream: null,
    analyser: null,
    mediaRecorder: null,
    audioContext: null,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  let recordingChunks: BlobPart[] = [];
  const timerTimeout = useRef<NodeJS.Timeout | null>(null);

  // Timer formatting
  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;
  const [hourLeft, hourRight] = useMemo(
    () => String(hours).padStart(2, "0").split(""),
    [hours]
  );
  const [minuteLeft, minuteRight] = useMemo(
    () => String(minutes).padStart(2, "0").split(""),
    [minutes]
  );
  const [secondLeft, secondRight] = useMemo(
    () => String(seconds).padStart(2, "0").split(""),
    [seconds]
  );

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerTimeout.current = setTimeout(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerTimeout.current) clearTimeout(timerTimeout.current);
    };
  }, [isRecording, timer]);

  // Visualizer effect
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const drawWaveform = (dataArray: Uint8Array) => {
      if (!canvasCtx) return;
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.fillStyle = "#0d9488";
      const barWidth = 8;
      const spacing = 8;
      const maxBarHeight = HEIGHT * 0.8;
      const numBars = 56;
      for (let i = 0; i < numBars; i++) {
        const barHeight = Math.pow(dataArray[i] / 128.0, 2.5) * maxBarHeight;
        const x =
          (barWidth + spacing) * i +
          (WIDTH - (barWidth + spacing) * numBars) / 2;
        const y = HEIGHT / 2 - barHeight / 2;
        canvasCtx.fillRect(x, y, barWidth, barHeight);
      }
    };

    const visualizeVolume = () => {
      if (!mediaRecorderRef.current?.analyser) return;
      const analyser = mediaRecorderRef.current.analyser;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const draw = () => {
        if (!isRecording) {
          cancelAnimationFrame(animationRef.current || 0);
          return;
        }
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        drawWaveform(dataArray);
      };
      draw();
    };

    if (isRecording) {
      visualizeVolume();
    } else {
      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      }
      cancelAnimationFrame(animationRef.current || 0);
    }
    return () => {
      cancelAnimationFrame(animationRef.current || 0);
    };
  }, [isRecording]);

  // Recording logic
  function startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setIsRecording(true);
          setTimer(0);
          setAudioUrl(null);
          // removed setAudioDuration(null)
          // Visualizer
          const AudioContext = window.AudioContext;
          const audioCtx = new AudioContext();
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          mediaRecorderRef.current = {
            stream,
            analyser,
            mediaRecorder: null,
            audioContext: audioCtx,
          };
          // Recording
          const mimeType = MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "audio/wav";
          const options = { mimeType };
          const mediaRecorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current.mediaRecorder = mediaRecorder;
          recordingChunks = [];
          mediaRecorder.start();
          mediaRecorder.ondataavailable = (e) => {
            recordingChunks.push(e.data);
          };
        })
        .catch((error) => {
          alert(error);
          console.log(error);
        });
    }
  }

  function stopRecording() {
    const { mediaRecorder, stream, analyser, audioContext } =
      mediaRecorderRef.current;
    if (mediaRecorder) {
      mediaRecorder.onstop = () => {
        // Only proceed if there is data
        if (recordingChunks.length === 0) {
          setAudioUrl(null);
          setAudioFile(null);
          if (onFileChange) onFileChange(null);
          return;
        }
        // Try both webm and wav for compatibility
        let audioBlob = new Blob(recordingChunks, { type: "audio/webm" });
        if (audioBlob.size === 0) {
          audioBlob = new Blob(recordingChunks, { type: "audio/wav" });
        }
        if (audioBlob.size === 0) {
          setAudioUrl(null);
          setAudioFile(null);
          if (onFileChange) onFileChange(null);
          return;
        }
        const url = URL.createObjectURL(audioBlob);
        const file = new File([audioBlob], "recording.webm", {
          type: audioBlob.type,
        });
        setAudioUrl(url);
        setAudioFile(file);
        if (onFileChange) onFileChange(file);
        recordingChunks = [];
      };
      mediaRecorder.stop();
      // Stop the web audio context and the analyser node
      if (analyser) {
        analyser.disconnect();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
      setIsRecording(false);
      setTimer(0);
      // Clear the animation frame and canvas
      cancelAnimationFrame(animationRef.current || 0);
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasCtx = canvas.getContext("2d");
        if (canvasCtx) {
          const WIDTH = canvas.width;
          const HEIGHT = canvas.height;
          canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        }
      }
    }
  }

  // removed playback logic (handled by AudioPlayer)

  // UI
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full bg-background",
        className
      )}
    >
      <div className="bg-card rounded-xl shadow-lg p-8 w-full relative flex flex-col items-center border-dashed border-2 border-teal-400">
        {/* Visualizer behind button */}
        <canvas
          ref={canvasRef}
          width={340}
          height={120}
          className="absolute left-0 right-0 top-0 bottom-0 mx-auto my-auto z-0 w-full"
          style={{ pointerEvents: "none" }}
        />
        <div className="flex flex-col items-center justify-center gap-6 z-10 w-full">
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            <div className="text-4xl font-bold text-card-foreground">
              {hourLeft}
              {hourRight}:{minuteLeft}
              {minuteRight}:{secondLeft}
              {secondRight}
            </div>
            <div className="text-sm text-muted-foreground">
              {isRecording
                ? "Recording..."
                : audioUrl
                  ? "Recorded"
                  : "Ready to record"}
            </div>
            {audioUrl && audioFile && (
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded bg-teal-100 text-teal-800 text-xs font-semibold">
                  <svg
                    className="w-4 h-4 mr-1 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Audio selected
                </span>
              </div>
            )}
          </div>
          <Button
            size="lg"
            variant="ghost"
            className="bg-primary text-primary-foreground rounded-full w-24 h-24 flex items-center justify-center hover:bg-primary/80 relative z-10"
            type="button"
            onClick={() => {
              if (audioUrl && !isRecording) {
                setShowConfirm(true);
              } else if (isRecording) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            aria-label={isRecording ? "Stop Recording" : "Start Recording"}
          >
            <Mic className="w-12 h-12" />
          </Button>
          {/* Settings button placeholder */}
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="text-card-foreground hover:bg-muted/50 rounded-full w-10 h-10"
              aria-label="Settings"
              tabIndex={-1}
              disabled
              type="button"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        </div>
        {/* Audio player below recorder */}
        {audioUrl && audioFile && (
          <AudioPlayer
            url={audioUrl}
            fileName={audioFile.name}
            onRemove={() => {
              setAudioUrl(null);
              setAudioFile(null);
              if (onFileChange) onFileChange(null);
            }}
          />
        )}
        {/* Confirmation dialog for overwrite */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Overwrite existing recording?</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              You already have a recorded audio. Do you want to record a new
              one? This will replace the current audio.
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setShowConfirm(false);
                  startRecording();
                }}
              >
                Record New Audio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
