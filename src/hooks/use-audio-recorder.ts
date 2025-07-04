"use client";

import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUploadStore } from "@/features/transcibe-upload/store/upload-store";

export function useAudioRecorder() {
  const { toast } = useToast();
  const {
    isRecording,
    recordingTime,
    startRecording: storeStartRecording,
    stopRecording: storeStopRecording,
    updateRecordingTime,
    setRecordedAudio,
    setError,
  } = useUploadStore();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        updateRecordingTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, updateRecordingTime]);

  // Get supported MIME type for recording
  const getSupportedMimeType = useCallback(() => {
    // Prioritize formats that are widely supported for playback
    const types = [
      "audio/wav",
      "audio/mp3",
      "audio/mp4",
      "audio/mpeg",
      "audio/webm",
      "audio/ogg",
      "audio/webm;codecs=opus",
      "audio/webm;codecs=pcm",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Browser supports recording in format: ${type}`);
        return type;
      }
    }

    // Fallback to a common type
    console.log("No preferred format supported, falling back to audio/webm");
    return "audio/webm";
  }, []);

  // Convert audio blob to WAV format (if needed)
  const convertToWav = useCallback(async (blob: Blob): Promise<Blob> => {
    // If already WAV or MP3, return as is
    if (
      blob.type.includes("wav") ||
      blob.type.includes("mp3") ||
      blob.type.includes("mpeg")
    ) {
      return blob;
    }

    try {
      // Create an audio context
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();

      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create a new buffer for WAV data
      const wavBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Copy the decoded data to the new buffer
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        wavBuffer.copyToChannel(channelData, channel);
      }

      // Create an offline audio context for rendering
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Create a buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = wavBuffer;
      source.connect(offlineContext.destination);
      source.start(0);

      // Render the audio
      const renderedBuffer = await offlineContext.startRendering();

      // Convert to WAV format
      const wavBlob = audioBufferToWav(renderedBuffer);

      console.log("Successfully converted audio to WAV format");
      return wavBlob;
    } catch (error) {
      console.error("Error converting audio format:", error);
      // Return original blob if conversion fails
      return blob;
    }
  }, []);

  // Helper function to convert AudioBuffer to WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    // Create the buffer
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    // Calculate the size of the WAV file
    const dataSize = buffer.length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    // Create a DataView to write the WAV header
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // Write the WAV header
    // "RIFF" chunk descriptor
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, "WAVE");

    // "fmt " sub-chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true); // audio format (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // byte rate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // "data" sub-chunk
    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // Write the PCM samples
    const offset = 44;
    let pos = offset;

    // Get the channel data
    const channelData = [];
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i));
    }

    // Interleave the channel data and convert to 16-bit PCM
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, int16, true);
        pos += 2;
      }
    }

    // Create a Blob from the buffer
    return new Blob([arrayBuffer], { type: "audio/wav" });
  };

  // Helper function to write a string to a DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const startRecording = useCallback(async () => {
    try {
      // Reset any previous recording
      chunksRef.current = [];

      // Get media stream with audio constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Get supported MIME type
      const mimeType = getSupportedMimeType();

      // Create media recorder with options
      const options = { mimeType };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Only proceed if we have data
        if (chunksRef.current.length === 0) {
          setError("No audio data was recorded. Please try again.");
          return;
        }

        try {
          // Create blob from chunks with the same MIME type
          const originalBlob = new Blob(chunksRef.current, { type: mimeType });

          // Verify blob is valid
          if (originalBlob.size === 0) {
            setError("Recorded audio is empty. Please try again.");
            return;
          }

          // Convert to WAV if needed for better compatibility
          const finalBlob = await convertToWav(originalBlob);

          // Set the recorded audio
          setRecordedAudio(finalBlob);

          // Log success for debugging
          console.log("Recording completed successfully:", {
            originalFormat: mimeType,
            finalFormat: finalBlob.type,
            blobSize: finalBlob.size,
            chunkCount: chunksRef.current.length,
          });
        } catch (error) {
          console.error("Error processing recording:", error);
          setError("Failed to process the recording. Please try again.");
        }

        // Clean up recording resources
        cleanup();
      };

      // Start recording with smaller timeslice for more frequent chunks
      mediaRecorder.start(100); // Collect data every 100ms
      storeStartRecording();

      // Log for debugging
      console.log("Recording started with MIME type:", mimeType);
    } catch (error) {
      console.error("Error starting recording:", error);
      setError(
        "Could not access microphone. Please check your browser permissions."
      );
      toast({
        title: "Recording Error",
        description:
          "Could not access microphone. Please check your browser permissions.",
        variant: "destructive",
      });
      cleanup();
    }
  }, [
    storeStartRecording,
    setRecordedAudio,
    setError,
    cleanup,
    toast,
    getSupportedMimeType,
    convertToWav,
  ]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
        console.log("Recording stopped");
      } catch (error) {
        console.error("Error stopping recording:", error);
        setError("Error stopping recording. Please try again.");
      }
      storeStopRecording();
    }
  }, [storeStopRecording, setError]);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
  };
}
