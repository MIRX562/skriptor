import React from "react";
import { motion } from "framer-motion";
import { Mic, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio-player";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useTranscriptionUploadStore } from "@/features/transcibe-upload/store/transcription-upload-store";

export default function TranscriptionUploadRecord({
  isSpeakerDiarized = false,
  numberOfSpeaker = 1,
  onNumberOfSpeakerChange = () => {},
}: {
  isSpeakerDiarized?: boolean;
  numberOfSpeaker?: number;
  onNumberOfSpeakerChange?: (val: number) => void;
}) {
  const { isRecording, recordingTime, audioUrl, reset } =
    useTranscriptionUploadStore();
  const { startRecording, stopRecording } = useAudioRecorder();

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Format time as MM:SS
  const formatTime = (time: number) => {
    if (!isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center gap-4 p-8 border rounded-lg">
        <motion.div
          animate={
            isRecording ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] } : {}
          }
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
          }}
          className={`rounded-full p-6 ${isRecording ? "bg-red-100 dark:bg-red-900/30" : "bg-slate-100 dark:bg-slate-800"}`}
        >
          <Mic
            className={`h-10 w-10 ${isRecording ? "text-red-500 dark:text-red-400" : "text-slate-500"}`}
          />
        </motion.div>

        <div className="text-center">
          <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {isRecording ? "Recording in progress..." : "Ready to record"}
          </p>
        </div>

        <Button
          variant={isRecording ? "destructive" : "default"}
          className="rounded-full w-12 h-12 p-0"
          onClick={handleRecordToggle}
        >
          {isRecording ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
      </div>

      {/* Speaker diarization number input */}
      {isSpeakerDiarized && (
        <div className="flex items-center gap-2">
          <label htmlFor="number-of-speaker" className="text-sm font-medium">
            Number of Speakers:
          </label>
          <input
            id="number-of-speaker"
            type="number"
            min={1}
            max={10}
            value={numberOfSpeaker}
            onChange={(e) => {
              let val = parseInt(e.target.value, 10);
              if (isNaN(val)) val = 1;
              if (val < 1) val = 1;
              if (val > 10) val = 10;
              onNumberOfSpeakerChange(val);
            }}
            className="w-16 border rounded px-2 py-1 text-center"
          />
        </div>
      )}

      {/* Audio player preview with remove button */}
      {audioUrl && !isRecording && (
        <div
          className="border rounded-lg p-4 flex items-center justify-between bg-muted/50"
          key="record-player-container"
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium mb-2">Preview Recording</h4>
            <AudioPlayer />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={reset}
            aria-label="Remove recording"
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
