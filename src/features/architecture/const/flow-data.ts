import { Node, Edge } from "@xyflow/react";
import {
  Globe,
  Database,
  HardDrive,
  Zap,
  PlayCircle,
  Edit3,
  Download,
  LogIn,
  RefreshCw,
  Search,
  Lock,
  FileUp,
  FileAudio,
  BrainCircuit,
  Fingerprint,
} from "lucide-react";

export const NODE_TYPES = {
  custom: "custom",
  group: "group"
};

export const EDGE_TYPES = {
  packet: "packet"
};

// Compact staircase layout center-aligned with groups
export const INITIAL_NODES: Node[] = [
  // Column 1: Infrastructure & Entry (Left - Compact Staircase)
  { id: "n-browser", type: "custom", position: { x: 530, y: 150 }, data: { label: "Client Layer", icon: Globe, type: "client", description: "React 19" } },
  { id: "n-redis-queue", type: "custom", position: { x: 530, y: 260 }, data: { label: "Job Queue / Cache", icon: Zap, type: "queue", description: "Redis + BullMQ" } },
  { id: "n-s3", type: "custom", position: { x: 530, y: 370 }, data: { label: "Object Storage", icon: HardDrive, type: "storage", description: "Garage / MinIO" } },
  { id: "n-postgres", type: "custom", position: { x: 530, y: 480 }, data: { label: "Database", icon: Database, type: "db", description: "Postgresql" } },

  // Column 2: Application Logic (Center - Center Aligned)
  { id: "p-api", type: "group", position: { x: 850, y: 130 }, data: { label: "Backend Server" }, style: { width: 360, height: 420, backgroundColor: "transparent", border: "none" } },
  { id: "n-auth-proxy", parentId: "p-api", type: "custom", position: { x: 80, y: 80 }, data: { label: "Auth Proxy", icon: Lock, type: "server", description: "Ownership" } },
  { id: "n-validator", parentId: "p-api", type: "custom", position: { x: 80, y: 180 }, data: { label: "Validator", icon: Search, type: "server", description: "Zod" } },
  { id: "n-uploader", parentId: "p-api", type: "custom", position: { x: 80, y: 280 }, data: { label: "Backend", icon: FileUp, type: "server", description: "Next.JS" } },

  // Column 3: AI Engine (Right - Center Aligned)
  { id: "p-worker", type: "group", position: { x: 50, y: 130 }, data: { label: "AI Engine" }, style: { width: 360, height: 420, backgroundColor: "transparent", border: "none" } },
  { id: "n-job-fetcher", parentId: "p-worker", type: "custom", position: { x: 80, y: 80 }, data: { label: "Job Fetcher", icon: FileAudio, type: "worker", description: "BLPOP" } },
  { id: "n-whisper", parentId: "p-worker", type: "custom", position: { x: 80, y: 170 }, data: { label: "WhisperX Engine", icon: BrainCircuit, type: "worker", description: "AI Processing" } },
  { id: "n-callback", parentId: "p-worker", type: "custom", position: { x: 80, y: 260 }, data: { label: "Callback Signer", icon: Fingerprint, type: "worker", description: "HMAC" } },
];

export const ALL_EDGES: Edge[] = [
  // Transcription Flow
  { id: "t-1", source: "n-browser", target: "n-auth-proxy", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Request", data: { color: "#3b82f6" } },
  { id: "t-2", source: "n-auth-proxy", target: "n-validator", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "Check", data: { color: "#14b8a6" } },
  { id: "t-3", source: "n-validator", target: "n-uploader", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "Process", data: { color: "#14b8a6" } },

  { id: "t-4", source: "n-browser", target: "n-s3", sourceHandle: "left-out", targetHandle: "left-in", type: "packet", label: "Audio Put", data: { color: "#3b82f6" } },
  { id: "t-5", source: "n-uploader", target: "n-postgres", sourceHandle: "bottom-out", targetHandle: "bottom-in", type: "packet", label: "Insert Row", data: { color: "#14b8a6" } },
  { id: "t-6", source: "n-uploader", target: "n-redis-queue", sourceHandle: "left-out", targetHandle: "right-in", type: "packet", label: "Enqueue", data: { color: "#14b8a6" } },

  { id: "t-7", source: "n-redis-queue", target: "n-job-fetcher", sourceHandle: "left-out", targetHandle: "top-in", type: "packet", label: "Pop", data: { color: "#f97316" } },
  { id: "t-8", source: "n-s3", target: "n-job-fetcher", sourceHandle: "left-out", targetHandle: "right-in", type: "packet", label: "Fetch Audio", data: { color: "#fbbf24" } },
  { id: "t-9", source: "n-job-fetcher", target: "n-whisper", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "Transcribe", data: { color: "#ec4899" } },

  { id: "t-10", source: "n-whisper", target: "n-redis-queue", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Progress", data: { color: "#ec4899" } },
  { id: "t-11", source: "n-redis-queue", target: "n-auth-proxy", sourceHandle: "right-out", targetHandle: "bottom-in", type: "packet", label: "SSE Stream", data: { color: "#f97316" } },
  { id: "t-12", source: "n-auth-proxy", target: "n-browser", sourceHandle: "left-out", targetHandle: "right-in", type: "packet", label: "UI Pulse", data: { color: "#14b8a6" } },

  { id: "t-13", source: "n-whisper", target: "n-callback", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "Finalize", data: { color: "#ec4899" } },
  { id: "t-14", source: "n-callback", target: "n-auth-proxy", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "HTTP POST", data: { color: "#ec4899" } },
  { id: "t-15", source: "n-auth-proxy", target: "n-validator", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "Update Result", data: { color: "#14b8a6" } },
  { id: "t-16", source: "n-validator", target: "n-postgres", sourceHandle: "left-out", targetHandle: "right-in", type: "packet", label: "Persist", data: { color: "#14b8a6" } },


  // Edit Flow
  { id: "e-1", source: "n-browser", target: "n-auth-proxy", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "PATCH Request", data: { color: "#3b82f6" } },
  { id: "e-2", source: "n-auth-proxy", target: "n-postgres", sourceHandle: "right-out", targetHandle: "top-in", type: "packet", label: "Batch Update", data: { color: "#14b8a6" } },

  // Download Flow
  { id: "d-1", source: "n-browser", target: "n-auth-proxy", sourceHandle: "right-out", targetHandle: "top-in", type: "packet", label: "GET Export", data: { color: "#3b82f6" } },
  { id: "d-2", source: "n-auth-proxy", target: "n-postgres", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "Fetch Segments", data: { color: "#14b8a6" } },
  { id: "d-3", source: "n-auth-proxy", target: "n-browser", sourceHandle: "top-out", targetHandle: "bottom-in", type: "packet", label: "File Stream", data: { color: "#14b8a6" } },

  // Login Flow
  { id: "l-1", source: "n-browser", target: "n-auth-proxy", sourceHandle: "right-out", targetHandle: "top-in", type: "packet", label: "Login POST", data: { color: "#3b82f6" } },
  { id: "l-2", source: "n-auth-proxy", target: "n-postgres", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "DB Verify", data: { color: "#14b8a6" } },
  { id: "l-3", source: "n-auth-proxy", target: "n-redis-queue", sourceHandle: "right-out", targetHandle: "right-in", type: "packet", label: "Session Cache", data: { color: "#14b8a6" } },
  { id: "l-4", source: "n-auth-proxy", target: "n-browser", sourceHandle: "top-out", targetHandle: "bottom-in", type: "packet", label: "Set Cookie", data: { color: "#14b8a6" } },

  // Retry Flow
  { id: "r-1", source: "n-browser", target: "n-auth-proxy", sourceHandle: "right-out", targetHandle: "top-in", type: "packet", label: "Retry POST", data: { color: "#3b82f6" } },
  { id: "r-2", source: "n-auth-proxy", target: "n-redis-queue", sourceHandle: "right-out", targetHandle: "right-in", type: "packet", label: "Re-enqueue", data: { color: "#14b8a6" } },
];


export const FLOWS = [
  {
    id: "transcription",
    label: "Full Transcription",
    icon: PlayCircle,
    color: "#2dd4bf",
    steps: [
      { id: "t-upload", title: "Handshake & Upload", description: "Validation and storage upload", edges: ["t-1", "t-2", "t-3", "t-4", "t-5", "t-6"] },
      { id: "t-process", title: "AI Processing", description: "Worker engine running WhisperX", edges: ["t-7", "t-8", "t-9"] },
      { id: "t-progress", title: "Live Updates", description: "SSE feed relaying progress", edges: ["t-10", "t-11", "t-12"] },
      { id: "t-finish", title: "Result Verification", description: "Signed callback persisting data", edges: ["t-13", "t-14", "t-15","t-16"] },
    ]
  },
  {
    id: "edit",
    label: "Edit Segments",
    icon: Edit3,
    color: "#fbbf24",
    steps: [
      { id: "e-save", title: "Segment Update", description: "Persistence of edited segments", edges: ["e-1", "e-2"] },
    ]
  },
  {
    id: "download",
    label: "Export Results",
    icon: Download,
    color: "#60a5fa",
    steps: [
      { id: "d-fetch", title: "Data Retrieval", description: "Fetching segments for generation", edges: ["d-1", "d-2"] },
      { id: "d-stream", title: "File Delivery", description: "Streaming generated file to client", edges: ["d-3"] },
    ]
  },
  {
    id: "login",
    label: "Auth Lifecycle",
    icon: LogIn,
    color: "#34d399",
    steps: [
      { id: "l-verify", title: "Credential Check", description: "Authentication against PostgreSQL", edges: ["l-1", "l-2"] },
      { id: "l-session", title: "Session Cache", description: "Storing session state in Redis", edges: ["l-3", "l-4"] },
    ]
  },
  {
    id: "retry",
    label: "Retry Logic",
    icon: RefreshCw,
    color: "#f87171",
    steps: [
      { id: "r-enqueue", title: "Restoration", description: "Resetting status and re-queuing", edges: ["r-1", "r-2"] },
      { id: "r-pickup", title: "Worker Catch", description: "Reprocessing through AI engine", edges: ["t-7", "t-8", "t-9"] },
    ]
  },
];
