import { Node, Edge } from "@xyflow/react";
import {
  Gauge,
  FolderSearch,
  Cpu,
  BarChart3,
  Activity,
  FileJson,
  LayoutDashboard,
  Repeat,
} from "lucide-react";

export const BENCHMARK_NODES: Node[] = [
  {
    id: "b-system",
    type: "custom",
    position: { x: 40, y: 220 },
    data: {
      label: "Device Probe",
      icon: Gauge,
      type: "client",
      description: "CPU/RAM/GPU discovery",
    },
  },
  {
    id: "b-dataset",
    type: "custom",
    position: { x: 320, y: 220 },
    data: {
      label: "Dataset Loader",
      icon: FolderSearch,
      type: "storage",
      description: "audio + TSV ground truth",
    },
  },
  {
    id: "b-loop",
    type: "custom",
    position: { x: 600, y: 220 },
    data: {
      label: "Model Loop",
      icon: Repeat,
      type: "worker",
      description: "tiny → base → ... → turbo",
    },
  },
  {
    id: "b-transcriber",
    type: "custom",
    position: { x: 880, y: 220 },
    data: {
      label: "Transcriber",
      icon: Cpu,
      type: "worker",
      description: "worker.transcriber.process()",
    },
  },
  {
    id: "b-accuracy",
    type: "custom",
    position: { x: 1160, y: 120 },
    data: {
      label: "Accuracy Metrics",
      icon: BarChart3,
      type: "server",
      description: "WER/CER via jiwer",
    },
  },
  {
    id: "b-resource",
    type: "custom",
    position: { x: 1160, y: 320 },
    data: {
      label: "Resource Monitor",
      icon: Activity,
      type: "server",
      description: "peak CPU/RAM/VRAM + RTF",
    },
  },
  {
    id: "b-json",
    type: "custom",
    position: { x: 1440, y: 220 },
    data: {
      label: "benchmark_results.json",
      icon: FileJson,
      type: "storage",
      description: "device_info + results[]",
    },
  },
  {
    id: "b-dashboard",
    type: "custom",
    position: { x: 1720, y: 220 },
    data: {
      label: "Streamlit Dashboard",
      icon: LayoutDashboard,
      type: "client",
      description: "visual analysis",
    },
  },
];

export const BENCHMARK_EDGES: Edge[] = [
  {
    id: "be-1",
    source: "b-system",
    target: "b-dataset",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "env + runtime",
    data: { color: "#3b82f6" },
  },
  {
    id: "be-2",
    source: "b-dataset",
    target: "b-loop",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "audio/ground-truth map",
    data: { color: "#14b8a6" },
  },
  {
    id: "be-3",
    source: "b-loop",
    target: "b-transcriber",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "run current model",
    data: { color: "#f97316" },
  },
  {
    id: "be-4",
    source: "b-transcriber",
    target: "b-accuracy",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "hypothesis text",
    data: { color: "#ec4899" },
  },
  {
    id: "be-5",
    source: "b-transcriber",
    target: "b-resource",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "timing + memory",
    data: { color: "#ec4899" },
  },
  {
    id: "be-6",
    source: "b-accuracy",
    target: "b-json",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "WER/CER stats",
    data: { color: "#8b5cf6" },
  },
  {
    id: "be-7",
    source: "b-resource",
    target: "b-json",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "RTF/CPU/RAM/VRAM",
    data: { color: "#8b5cf6" },
  },
  {
    id: "be-8",
    source: "b-json",
    target: "b-dashboard",
    type: "packet",
    sourceHandle: "right-out",
    targetHandle: "left-in",
    label: "load & visualize",
    data: { color: "#a855f7" },
  },
];

export const BENCHMARK_STEPS = [
  {
    id: "bs-1",
    title: "Initialize",
    description: "Collect host/GPU metadata and load dataset + references.",
    edges: ["be-1", "be-2"],
  },
  {
    id: "bs-2",
    title: "Model iteration",
    description:
      "Run each selected Whisper model against each benchmark audio sample.",
    subSteps: [
      {
        id: "tiny",
        title: "tiny",
        edges: ["be-3", "be-4", "be-5", "be-6", "be-7"],
      },
      {
        id: "base",
        title: "base",
        edges: ["be-3", "be-4", "be-5", "be-6", "be-7"],
      },
      {
        id: "small",
        title: "small",
        edges: ["be-3", "be-4", "be-5", "be-6", "be-7"],
      },
      {
        id: "medium",
        title: "medium",
        edges: ["be-3", "be-4", "be-5", "be-6", "be-7"],
      },
      {
        id: "large-v2",
        title: "large-v2",
        edges: ["be-3", "be-4", "be-5", "be-6", "be-7"],
      },
      {
        id: "large-v3",
        title: "large-v3",
        edges: ["be-3", "be-4", "be-5", "be-6", "be-7"],
      },
      {
        id: "turbo",
        title: "turbo",
        edges: ["be-3", "be-4", "be-5", "be-6", "be-7"],
      },
    ],
  },
  {
    id: "bs-3",
    title: "Publish",
    description: "Write JSON output and render comparative dashboard.",
    edges: ["be-8"],
  },
];
