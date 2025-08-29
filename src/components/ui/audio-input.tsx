"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type AudioInputProps = {
  value: File | null;
  onValueChange: (file: File | null) => void;
  className?: string;
};

function padWithLeadingZeros(num: number, length: number): string {
  return String(num).padStart(length, "0");
}

function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: blob.type });
}

export const AudioInput: React.FC<AudioInputProps> = ({
  onValueChange,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecorded, setIsRecorded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs for recording data to avoid state timing issues
  const recordingChunksRef = useRef<BlobPart[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setTimeout(() => setTimer((t) => t + 1), 1000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRecording, timer]);

  // Visualizer logic
  useEffect(() => {
    if (!isRecording) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx)
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
      }
      return;
    }
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const centerY = HEIGHT / 2;

    // Increase FFT size for more frequency resolution and sensitivity
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6; // Reduce smoothing for more sensitivity

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      if (ctx) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Draw the center line first (behind the bars)
        ctx.strokeStyle = "#64748b"; // Tailwind slate-500 for subtle line
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(WIDTH, centerY);
        ctx.stroke();

        ctx.fillStyle = "#14b8a6"; // Tailwind teal-500 for bars

        // Use more bars for denser visualization
        const numBars = Math.min(bufferLength, 80); // Limit to 80 bars for performance
        const barWidth = WIDTH / numBars;

        for (let i = 0; i < numBars; i++) {
          // Apply amplification and bias for more sensitivity
          const amplitude = (dataArray[i] / 255) * 1.7; // Amplify by 3x
          const barHeight = Math.min(amplitude * (HEIGHT / 2), HEIGHT / 2); // Limit to half height

          // Draw bars both upward and downward from center
          // Upward bar
          ctx.fillRect(
            i * barWidth,
            centerY - barHeight,
            barWidth - 1, // Thinner bars
            barHeight
          );

          // Downward bar (mirror)
          ctx.fillRect(
            i * barWidth,
            centerY,
            barWidth - 1, // Thinner bars
            barHeight
          );
        }
      }
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording]);

  // Clean up blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setIsRecorded(false);
    recordingChunksRef.current = []; // Reset chunks
    setTimer(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new window.AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mimeType = MediaRecorder.isTypeSupported("audio/wav")
        ? "audio/wav"
        : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordingChunksRef.current.push(e.data); // Use ref instead of state
        }
      };

      mediaRecorder.onstop = async () => {
        // Clean up old audio URL
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        const blob = new Blob(recordingChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        // Create a temporary audio element to load metadata
        const tempAudio = new Audio(url);

        try {
          await new Promise((resolve, reject) => {
            tempAudio.addEventListener("loadedmetadata", resolve);
            tempAudio.addEventListener("error", reject);
            tempAudio.load();
          });

          setAudioUrl(url);
          setIsRecorded(true);

          const file = blobToFile(
            blob,
            `recording_${Date.now()}.${mimeType === "audio/webm" ? "webm" : "wav"}`
          );
          onValueChange(file);
        } catch (error) {
          console.error("Failed to load audio metadata:", error);
          // Fallback - still set the URL even if metadata loading fails
          setAudioUrl(url);
          setIsRecorded(true);

          const file = blobToFile(
            blob,
            `recording_${Date.now()}.${mimeType === "audio/webm" ? "webm" : "wav"}`
          );
          onValueChange(file);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);

      // More specific error messages
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Microphone access denied. Please allow microphone access and try again."
          );
        } else if (err.name === "NotFoundError") {
          setError("No microphone found on this device.");
        } else if (err.name === "NotSupportedError") {
          setError("Your browser doesn't support audio recording.");
        } else if (err.name === "SecurityError") {
          setError(
            "Security error: Please use HTTPS or localhost to access the microphone."
          );
        } else {
          setError(`Error accessing microphone: ${err.message}`);
        }
      } else {
        setError("Microphone access denied or unavailable.");
      }
    }
  }, [onValueChange, audioUrl]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsRecorded(false);
    recordingChunksRef.current = [];
    setTimer(0);
    onValueChange(null);
  }, [onValueChange, audioUrl]);

  const downloadRecording = useCallback(() => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `recording_${Date.now()}.webm`;
    a.click();
  }, [audioUrl]);

  // Timer display
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timerDisplay = `${padWithLeadingZeros(minutes, 2)}:${padWithLeadingZeros(seconds, 2)}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full",
        className
      )}
    >
      <div className="bg-card rounded-xl p-4 w-full flex flex-col items-center gap-6 border-2 border-dashed hover:border-teal-400">
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="text-4xl font-bold text-card-foreground">
            {timerDisplay}
          </div>
          <div className="text-sm text-muted-foreground">Recording Time</div>
        </div>
        <canvas
          ref={canvasRef}
          width={240}
          height={50}
          className={cn("w-md h-fit rounded", isRecording ? "block" : "hidden")}
          style={{ background: "none" }}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex items-center gap-4">
          {!isRecording && !isRecorded && (
            <Button
              size="lg"
              variant="ghost"
              className="bg-primary text-primary-foreground rounded-full w-20 h-20 flex items-center justify-center hover:bg-primary/80"
              onClick={startRecording}
              aria-label="Start recording"
            >
              <Mic className="w-12 h-12" />
            </Button>
          )}
          {isRecording && (
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full w-20 h-20 flex items-center justify-center"
              onClick={stopRecording}
              aria-label="Stop recording"
            >
              <StopCircle className="w-12 h-12" />
            </Button>
          )}
          {isRecorded && audioUrl && (
            <div className="flex flex-col items-center gap-2 w-full">
              <audio
                controls
                src={audioUrl}
                className="w-md"
                key={audioUrl}
                preload="metadata"
              />
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={downloadRecording}
                  aria-label="Download recording"
                >
                  <Download className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetRecording}
                  aria-label="Delete recording"
                >
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioInput;
