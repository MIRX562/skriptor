import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, X } from "lucide-react";
import { FileUploader } from "@/components/ui/file-input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AudioPlayer } from "@/components/audio-player";
import { useTranscriptionUploadStore } from "@/features/transcibe-upload/store/transcription-upload-store";

export default function TranscriptionUploadFile() {
  const { files, setFiles, audioUrl, isUploading, uploadProgress, reset } =
    useTranscriptionUploadStore();

  const handleFileChange = (newFiles: File[] | null) => {
    setFiles(newFiles || []);
  };

  return (
    <div className="space-y-4">
      <FileUploader
        value={files}
        onValueChange={handleFileChange}
        dropzoneOptions={{
          accept: {
            "audio/*": [".mp3", ".wav", ".m4a", ".flac"],
          },
          maxFiles: 1,
          maxSize: 500 * 1024 * 1024,
          multiple: false,
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <motion.div whileHover={{ y: -5 }}>
            <FileUp className="h-10 w-10 text-slate-400" />
          </motion.div>
          <h3 className="font-medium">
            Drag and drop your file here or click to browse
          </h3>
          <p className="text-sm text-muted-foreground">
            Supports MP3, WAV, M4A, FLAC (max 500MB)
          </p>
        </div>
      </FileUploader>

      <AnimatePresence>
        {files && files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <FileUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="font-medium text-sm">{files[0].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(files[0].size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={reset}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {audioUrl && (
              <div key="upload-player-container">
                <AudioPlayer />
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
