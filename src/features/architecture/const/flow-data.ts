import { Node, Edge } from "@xyflow/react";
import { Globe, Database, HardDrive, Zap, Cpu, Workflow } from "lucide-react";

export const NODE_TYPES = {
  custom: "custom",
  group: "group",
};

export const EDGE_TYPES = {
  packet: "packet",
};

export const INITIAL_NODES: Node[] = [
  {
    id: "n-web",
    type: "custom",
    position: { x: 600, y: 260 },
    data: {
      label: "Web Server",
      icon: Globe,
      type: "server",
      description: "Next.js API + UI",
    },
  },
  {
    id: "n-postgres",
    type: "custom",
    position: { x: 950, y: 110 },
    data: {
      label: "PostgreSQL",
      icon: Database,
      type: "db",
      description: "users, transcriptions, segments",
    },
  },
  {
    id: "n-redis",
    type: "custom",
    position: { x: 950, y: 260 },
    data: {
      label: "Redis",
      icon: Zap,
      type: "queue",
      description: "BullMQ queue + Pub/Sub progress",
    },
  },
  {
    id: "n-minio",
    type: "custom",
    position: { x: 950, y: 410 },
    data: {
      label: "MinIO",
      icon: HardDrive,
      type: "storage",
      description: "S3-compatible audio objects",
    },
  },
  {
    id: "n-worker",
    type: "custom",
    position: { x: 300, y: 260 },
    data: {
      label: "Worker",
      icon: Cpu,
      type: "worker",
      description: "Python WhisperX processor",
    },
  },
];

export const ALL_EDGES: Edge[] = [
  {
    id: "s-1",
    source: "n-web",
    target: "n-minio",
    sourceHandle: "bottom-out",
    targetHandle: "top-in",
    type: "packet",
    label: "Presigned upload / audio read",
    data: { color: "#14b8a6" },
  },
  {
    id: "s-2",
    source: "n-web",
    target: "n-postgres",
    sourceHandle: "top-out",
    targetHandle: "left-in",
    type: "packet",
    label: "Create/update transcription rows",
    data: { color: "#8b5cf6" },
  },
  {
    id: "s-3",
    source: "n-web",
    target: "n-redis",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    type: "packet",
    label: "Enqueue job",
    data: { color: "#f97316" },
  },
  {
    id: "s-4",
    source: "n-redis",
    target: "n-worker",
    sourceHandle: "left-out",
    targetHandle: "right-in",
    type: "packet",
    label: "Worker consumes job",
    data: { color: "#f97316" },
  },
  {
    id: "s-5",
    source: "n-worker",
    target: "n-minio",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    type: "packet",
    label: "Download audio via URL",
    data: { color: "#eab308" },
  },
  {
    id: "s-6",
    source: "n-worker",
    target: "n-redis",
    sourceHandle: "top-out",
    targetHandle: "bottom-in",
    type: "packet",
    label: "Publish progress",
    data: { color: "#ec4899" },
  },
  {
    id: "s-7",
    source: "n-worker",
    target: "n-web",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    type: "packet",
    label: "Signed callback",
    data: { color: "#ec4899" },
  },
];

export const FLOWS = [
  {
    id: "overall",
    label: "Overall Architecture",
    icon: Workflow,
    color: "#2dd4bf",
    steps: [
      {
        id: "step-1",
        title: "Persist + Queue",
        description:
          "Web writes transcription metadata and enqueues a BullMQ job.",
        edges: ["s-2", "s-3"],
      },
      {
        id: "step-2",
        title: "Storage I/O",
        description:
          "Web/worker interact with MinIO for audio upload and retrieval.",
        edges: ["s-1", "s-5"],
      },
      {
        id: "step-3",
        title: "Worker Execution",
        description:
          "Worker consumes queue jobs from Redis and processes audio.",
        edges: ["s-4"],
      },
      {
        id: "step-4",
        title: "Progress + Completion",
        description:
          "Worker pushes progress to Redis and final callback to web.",
        edges: ["s-6", "s-7"],
      },
    ],
  },
];
