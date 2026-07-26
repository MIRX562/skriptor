import { Node, Edge } from "@xyflow/react";
import { Globe, HardDrive, Database, Zap, Cpu, ShieldCheck } from "lucide-react";

export const JOB_QUEUE_NODES: Node[] = [
  {
    id: "j-browser",
    type: "custom",
    position: { x: 40, y: 260 },
    data: { label: "Browser", icon: Globe, type: "client", description: "Upload + progress UI" },
  },
  {
    id: "j-web",
    type: "custom",
    position: { x: 320, y: 260 },
    data: { label: "Web API", icon: ShieldCheck, type: "server", description: "/api/transcribe-upload (+callback/SSE)" },
  },
  {
    id: "j-minio",
    type: "custom",
    position: { x: 600, y: 420 },
    data: { label: "MinIO", icon: HardDrive, type: "storage", description: "audio object storage" },
  },
  {
    id: "j-postgres",
    type: "custom",
    position: { x: 600, y: 110 },
    data: { label: "PostgreSQL", icon: Database, type: "db", description: "transcriptions + segments" },
  },
  {
    id: "j-redis",
    type: "custom",
    position: { x: 880, y: 260 },
    data: { label: "Redis/BullMQ", icon: Zap, type: "queue", description: "queue + progress pub/sub" },
  },
  {
    id: "j-worker",
    type: "custom",
    position: { x: 1160, y: 260 },
    data: { label: "Worker", icon: Cpu, type: "worker", description: "consume, transcribe, callback" },
  },
];

export const JOB_QUEUE_EDGES: Edge[] = [
  { id: "je-1", source: "j-browser", target: "j-web", type: "packet", sourceHandle: "right-out", targetHandle: "left-in", label: "request upload URL / create job", data: { color: "#3b82f6" } },
  { id: "je-2", source: "j-browser", target: "j-minio", type: "packet", sourceHandle: "bottom-out", targetHandle: "left-in", label: "PUT audio (presigned)", data: { color: "#14b8a6" } },
  { id: "je-3", source: "j-web", target: "j-postgres", type: "packet", sourceHandle: "top-out", targetHandle: "left-in", label: "insert status=queued", data: { color: "#8b5cf6" } },
  { id: "je-4", source: "j-web", target: "j-redis", type: "packet", sourceHandle: "right-out", targetHandle: "left-in", label: "enqueue transcription job", data: { color: "#f97316" } },
  { id: "je-5", source: "j-redis", target: "j-worker", type: "packet", sourceHandle: "right-out", targetHandle: "left-in", label: "worker consumes job", data: { color: "#f97316" } },
  { id: "je-6", source: "j-worker", target: "j-minio", type: "packet", sourceHandle: "bottom-out", targetHandle: "right-in", label: "download audio URL", data: { color: "#eab308" } },
  { id: "je-7", source: "j-worker", target: "j-redis", type: "packet", sourceHandle: "left-out", targetHandle: "right-in", label: "publish progress events", data: { color: "#ec4899" } },
  { id: "je-8", source: "j-web", target: "j-browser", type: "packet", sourceHandle: "left-out", targetHandle: "top-in", label: "SSE progress stream", data: { color: "#14b8a6" } },
  { id: "je-9", source: "j-worker", target: "j-web", type: "packet", sourceHandle: "left-out", targetHandle: "right-in", label: "signed callback (HMAC)", data: { color: "#ec4899" } },
  { id: "je-10", source: "j-web", target: "j-postgres", type: "packet", sourceHandle: "top-out", targetHandle: "right-in", label: "persist segments + completed", data: { color: "#8b5cf6" } },
  { id: "je-11", source: "j-web", target: "j-redis", type: "packet", sourceHandle: "right-out", targetHandle: "top-in", label: "clear progress:last key", data: { color: "#f97316" } },
];

export const JOB_QUEUE_STEPS = [
  {
    id: "jq-s1",
    title: "Create",
    description: "Client uploads audio with presigned URL and asks web API to create a transcription.",
    edges: ["je-1", "je-2", "je-3"],
  },
  {
    id: "jq-s2",
    title: "Queue",
    description: "Web enqueues a BullMQ job in Redis for async processing.",
    edges: ["je-4", "je-5"],
  },
  {
    id: "jq-s3",
    title: "Process",
    description: "Worker downloads audio from MinIO and runs transcription.",
    edges: ["je-6"],
  },
  {
    id: "jq-s4",
    title: "Progress",
    description: "Worker publishes progress to Redis and browser receives it via web SSE endpoint.",
    edges: ["je-7", "je-8"],
  },
  {
    id: "jq-s5",
    title: "Finalize",
    description: "Worker sends signed callback; web verifies HMAC, saves output, and cleans progress cache.",
    edges: ["je-9", "je-10", "je-11"],
  },
];
