import { Node, Edge } from "@xyflow/react";
import { 
  Database, 
  FileJson, 
  Activity, 
  BarChart3, 
  ClipboardCheck, 
  Search,
  LayoutDashboard,
  Zap,
  Gauge,
  FileCode
} from "lucide-react";

export const BENCHMARK_NODES: Node[] = [
  // Column 1: Initialization
  { 
    id: "bn-profiler", 
    type: "custom", 
    position: { x: 50, y: 150 }, 
    data: { label: "System Profiler", icon: Gauge, type: "client", description: "Hardware Discovery" } 
  },
  { 
    id: "bn-loader", 
    type: "custom", 
    position: { x: 50, y: 320 }, 
    data: { label: "Dataset Loader", icon: ClipboardCheck, type: "storage", description: "GT Mapping" } 
  },
  
  // Column 2: Model Evaluation Pool (Tight Spacing)
  { 
    id: "bp-models", 
    type: "group", 
    position: { x: 350, y: 50 }, 
    data: { label: "Whisper Model Pool" }, 
    style: { width: 280, height: 480, backgroundColor: "transparent", border: "none" } 
  },
  { id: "bn-m-tiny", parentId: "bp-models", type: "custom", position: { x: 40, y: 50 }, data: { label: "Whisper Tiny", icon: Zap, type: "worker", description: "Fastest" } },
  { id: "bn-m-base", parentId: "bp-models", type: "custom", position: { x: 40, y: 105 }, data: { label: "Whisper Base", icon: Zap, type: "worker", description: "Standard" } },
  { id: "bn-m-small", parentId: "bp-models", type: "custom", position: { x: 40, y: 160 }, data: { label: "Whisper Small", icon: Zap, type: "worker", description: "Efficient" } },
  { id: "bn-m-medium", parentId: "bp-models", type: "custom", position: { x: 40, y: 215 }, data: { label: "Whisper Medium", icon: Zap, type: "worker", description: "Balanced" } },
  { id: "bn-m-large-v2", parentId: "bp-models", type: "custom", position: { x: 40, y: 270 }, data: { label: "Whisper Large V2", icon: Zap, type: "worker", description: "Legacy High" } },
  { id: "bn-m-turbo", parentId: "bp-models", type: "custom", position: { x: 40, y: 325 }, data: { label: "Whisper Turbo", icon: Zap, type: "worker", description: "Optimized High" } },
  { id: "bn-m-large", parentId: "bp-models", type: "custom", position: { x: 40, y: 380 }, data: { label: "Whisper Large V3", icon: Zap, type: "worker", description: "Ultimate" } },

  // Column 3: Metrics & Analysis
  { 
    id: "bn-jiwer", 
    type: "custom", 
    position: { x: 800, y: 100 }, 
    data: { label: "jiwer Evaluator", icon: BarChart3, type: "server", description: "Accuracy (WER/CER)" } 
  },
  { 
    id: "bn-analyzer", 
    type: "custom", 
    position: { x: 800, y: 270 }, 
    data: { label: "Linguistic Prep", icon: Search, type: "server", description: "Complexity / WPM" } 
  },
  { 
    id: "bn-monitor", 
    type: "custom", 
    position: { x: 800, y: 440 }, 
    data: { label: "Resource Monitor", icon: Activity, type: "server", description: "VRAM / CPU / RSS" } 
  },

  // Column 4: Storage
  { 
    id: "bn-exporter", 
    type: "custom", 
    position: { x: 1100, y: 150 }, 
    data: { label: "JSON Exporter", icon: FileJson, type: "db", description: "Metric Archiving" } 
  },
  { 
    id: "bn-result-file", 
    type: "custom", 
    position: { x: 1100, y: 250 }, 
    data: { label: "results.json", icon: FileCode, type: "storage", description: "Benchmark Report" } 
  },
  { 
    id: "bn-dashboard", 
    type: "custom", 
    position: { x: 1100, y: 350 }, 
    data: { label: "Streamlit UI", icon: LayoutDashboard, type: "client", description: "Performance Dash" } 
  }
];

export const BENCHMARK_EDGES: Edge[] = [
  // Init
  { id: "be-1", source: "bn-profiler", target: "bn-loader", type: "packet", sourceHandle: "bottom-out", targetHandle: "top-in", label: "Sys Info", data: { color: "#3b82f6" } },
  
  // Loader -> Models
  { id: "be-l-tiny", source: "bn-loader", target: "bn-m-tiny", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Dataset", data: { color: "#14b8a6" } },
  { id: "be-l-base", source: "bn-loader", target: "bn-m-base", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Dataset", data: { color: "#14b8a6" } },
  { id: "be-l-small", source: "bn-loader", target: "bn-m-small", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Dataset", data: { color: "#14b8a6" } },
  { id: "be-l-medium", source: "bn-loader", target: "bn-m-medium", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Dataset", data: { color: "#14b8a6" } },
  { id: "be-l-v2", source: "bn-loader", target: "bn-m-large-v2", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Dataset", data: { color: "#14b8a6" } },
  { id: "be-l-turbo", source: "bn-loader", target: "bn-m-turbo", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Dataset", data: { color: "#14b8a6" } },
  { id: "be-l-v3", source: "bn-loader", target: "bn-m-large", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", label: "Dataset", data: { color: "#14b8a6" } },

  // Models -> Metrics
  { id: "be-m-tiny-j", source: "bn-m-tiny", target: "bn-jiwer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-tiny-a", source: "bn-m-tiny", target: "bn-analyzer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-tiny-m", source: "bn-m-tiny", target: "bn-monitor", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },

  { id: "be-m-base-j", source: "bn-m-base", target: "bn-jiwer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-base-a", source: "bn-m-base", target: "bn-analyzer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-base-m", source: "bn-m-base", target: "bn-monitor", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },

  { id: "be-m-small-j", source: "bn-m-small", target: "bn-jiwer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-small-a", source: "bn-m-small", target: "bn-analyzer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-small-m", source: "bn-m-small", target: "bn-monitor", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },

  { id: "be-m-medium-j", source: "bn-m-medium", target: "bn-jiwer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-medium-a", source: "bn-m-medium", target: "bn-analyzer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-medium-m", source: "bn-m-medium", target: "bn-monitor", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },

  { id: "be-m-v2-j", source: "bn-m-large-v2", target: "bn-jiwer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-v2-a", source: "bn-m-large-v2", target: "bn-analyzer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-v2-m", source: "bn-m-large-v2", target: "bn-monitor", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },

  { id: "be-m-turbo-j", source: "bn-m-turbo", target: "bn-jiwer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-turbo-a", source: "bn-m-turbo", target: "bn-analyzer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-turbo-m", source: "bn-m-turbo", target: "bn-monitor", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },

  { id: "be-m-v3-j", source: "bn-m-large", target: "bn-jiwer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-v3-a", source: "bn-m-large", target: "bn-analyzer", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },
  { id: "be-m-v3-m", source: "bn-m-large", target: "bn-monitor", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#ec4899" } },

  // Metrics -> Exporter
  { id: "be-j-exp", source: "bn-jiwer", target: "bn-exporter", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#14b8a6" } },
  { id: "be-a-exp", source: "bn-analyzer", target: "bn-exporter", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#14b8a6" } },
  { id: "be-m-exp", source: "bn-monitor", target: "bn-exporter", sourceHandle: "right-out", targetHandle: "left-in", type: "packet", data: { color: "#14b8a6" } },

  // Exporter -> Result File
  { id: "be-exp-file", source: "bn-exporter", target: "bn-result-file", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "Write", data: { color: "#a855f7" } },

  // Result File -> Dashboard
  { id: "be-file-dash", source: "bn-result-file", target: "bn-dashboard", sourceHandle: "bottom-out", targetHandle: "top-in", type: "packet", label: "Render", data: { color: "#f97316" } },
];

export const BENCHMARK_STEPS = [
  { 
    id: "bs-init", 
    title: "Device Discovery", 
    description: "Hardware profiling and system state verification", 
    edges: ["be-1"] 
  },
  { 
    id: "bs-bench", 
    title: "Benchmarking", 
    description: "Sequential evaluation and result generation", 
    subSteps: [
      { id: "tiny", title: "Whisper Tiny", edges: ["be-l-tiny", "be-m-tiny-j", "be-m-tiny-a", "be-m-tiny-m", "be-j-exp", "be-a-exp", "be-m-exp", "be-exp-file"] },
      { id: "base", title: "Whisper Base", edges: ["be-l-base", "be-m-base-j", "be-m-base-a", "be-m-base-m", "be-j-exp", "be-a-exp", "be-m-exp", "be-exp-file"] },
      { id: "small", title: "Whisper Small", edges: ["be-l-small", "be-m-small-j", "be-m-small-a", "be-m-small-m", "be-j-exp", "be-a-exp", "be-m-exp", "be-exp-file"] },
      { id: "medium", title: "Whisper Medium", edges: ["be-l-medium", "be-m-medium-j", "be-m-medium-a", "be-m-medium-m", "be-j-exp", "be-a-exp", "be-m-exp", "be-exp-file"] },
      { id: "v2", title: "Whisper Large V2", edges: ["be-l-v2", "be-m-v2-j", "be-m-v2-a", "be-m-v2-m", "be-j-exp", "be-a-exp", "be-m-exp", "be-exp-file"] },
      { id: "turbo", title: "Whisper Turbo", edges: ["be-l-turbo", "be-m-turbo-j", "be-m-turbo-a", "be-m-turbo-m", "be-j-exp", "be-a-exp", "be-m-exp", "be-exp-file"] },
      { id: "v3", title: "Whisper Large V3", edges: ["be-l-v3", "be-m-v3-j", "be-m-v3-a", "be-m-v3-m", "be-j-exp", "be-a-exp", "be-m-exp", "be-exp-file"] },
    ]
  },
  { 
    id: "bs-save", 
    title: "Result Presentation", 
    description: "Final data visualization and performance dashboard", 
    edges: ["be-file-dash"] 
  },
];
