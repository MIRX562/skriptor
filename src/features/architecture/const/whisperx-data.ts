import { Node, Edge } from "@xyflow/react";
import { 
  FileAudio, 
  Scissors, 
  BrainCircuit, 
  Binary, 
  Users, 
  Combine, 
  FileCode,
  Waves,
  Clock,
  Settings2
} from "lucide-react";

export const WHISPERX_NODES: Node[] = [
  // Input
  { 
    id: "wx-input", 
    type: "custom", 
    position: { x: 50, y: 250 }, 
    data: { label: "Raw Audio Input", icon: FileAudio, type: "storage", description: "WAV / MP3 / FLAC" } 
  },

  // Phase 1: VAD
  { 
    id: "wx-vad", 
    type: "custom", 
    position: { x: 300, y: 250 }, 
    data: { label: "Silero VAD", icon: Scissors, type: "worker", description: "Voice Activity Detection" } 
  },
  { 
    id: "wx-segments", 
    type: "custom", 
    position: { x: 550, y: 250 }, 
    data: { label: "Audio Segments", icon: Waves, type: "storage", description: "Silence-Filtered Chunks" } 
  },

  // Phase 2: Transcription (Primary Loop)
  { 
    id: "wx-whisper", 
    type: "custom", 
    position: { x: 800, y: 250 }, 
    data: { label: "faster-whisper", icon: BrainCircuit, type: "server", description: "Batched CTranslate2" } 
  },

  // Phase 3: Alignment & Diarization (Parallel)
  { 
    id: "wx-aligner", 
    type: "custom", 
    position: { x: 1050, y: 100 }, 
    data: { label: "wav2vec2 Aligner", icon: Binary, type: "worker", description: "Forced Phoneme Alignment" } 
  },
  { 
    id: "wx-diarizer", 
    type: "custom", 
    position: { x: 1050, y: 400 }, 
    data: { label: "pyannote.audio", icon: Users, type: "worker", description: "Speaker Diarization" } 
  },

  // Phase 4: Synthesis
  { 
    id: "wx-merger", 
    type: "custom", 
    position: { x: 1300, y: 250 }, 
    data: { label: "Synthesis Engine", icon: Combine, type: "server", description: "Metadata Consolidation" } 
  },

  // Output
  { 
    id: "wx-output", 
    type: "custom", 
    position: { x: 1550, y: 250 }, 
    data: { label: "Final Transcript", icon: FileCode, type: "storage", description: "Word-level JSON / SRT" } 
  }
];

export const WHISPERX_EDGES: Edge[] = [
  // Step 1: VAD
  { id: "we-1", source: "wx-input", target: "wx-vad", type: "packet", sourceHandle: "right-out", targetHandle: "left-in", label: "Load", data: { color: "#f97316" } },
  { id: "we-2", source: "wx-vad", target: "wx-segments", type: "packet", sourceHandle: "right-out", targetHandle: "left-in", label: "Cut", data: { color: "#ec4899" } },

  // Step 2: Transcription
  { id: "we-3", source: "wx-segments", target: "wx-whisper", type: "packet", sourceHandle: "right-out", targetHandle: "left-in", label: "Batch", data: { color: "#14b8a6" } },

  // Step 3: Refinement (Parallel)
  { id: "we-4a", source: "wx-whisper", target: "wx-aligner", type: "packet", sourceHandle: "right-out", targetHandle: "bottom-in", label: "Text", data: { color: "#14b8a6" } },
  { id: "we-4b", source: "wx-segments", target: "wx-aligner", type: "packet", sourceHandle: "top-out", targetHandle: "left-in", label: "Wave", data: { color: "#f97316" } },
  { id: "we-5", source: "wx-segments", target: "wx-diarizer", type: "packet", sourceHandle: "bottom-out", targetHandle: "left-in", label: "Embedding", data: { color: "#f97316" } },

  // Step 4: Synthesis
  { id: "we-6a", source: "wx-aligner", target: "wx-merger", type: "packet", sourceHandle: "right-out", targetHandle: "top-in", label: "Timestamps", data: { color: "#ec4899" } },
  { id: "we-6b", source: "wx-diarizer", target: "wx-merger", type: "packet", sourceHandle: "right-out", targetHandle: "bottom-in", label: "Labels", data: { color: "#ec4899" } },

  // Step 5: Export
  { id: "we-7", source: "wx-merger", target: "wx-output", type: "packet", sourceHandle: "right-out", targetHandle: "left-in", label: "Serialize", data: { color: "#14b8a6" } },
];

export const WHISPERX_STEPS = [
  { 
    id: "wx-s1", 
    title: "Segmentation", 
    description: "VAD-based speech detection and chunking", 
    edges: ["we-1", "we-2"] 
  },
  { 
    id: "wx-s2", 
    title: "Transcription", 
    description: "Batched inference via faster-whisper", 
    edges: ["we-3"] 
  },
  { 
    id: "wx-s3", 
    title: "Alignment", 
    description: "Word-level timestamp mapping via wav2vec2", 
    edges: ["we-4a", "we-4b", "we-6a"] 
  },
  { 
    id: "wx-s4", 
    title: "Diarization", 
    description: "Speaker identifying via pyannote.audio", 
    edges: ["we-5", "we-6b"] 
  },
  { 
    id: "wx-s5", 
    title: "Synthesis", 
    description: "Consolidating timestamps and speaker tags", 
    edges: ["we-7"] 
  }
];
