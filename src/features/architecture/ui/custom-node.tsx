"use client";

import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface CustomNodeProps {
  data: {
    label: string;
    icon?: LucideIcon;
    description?: string;
    type?: "client" | "server" | "db" | "queue" | "storage" | "worker" | "group";
  };
  selected?: boolean;
}

const typeStyles = {
  client: "border-blue-500/50 bg-blue-500/10 text-blue-400",
  server: "border-teal-500/50 bg-teal-500/10 text-teal-400",
  db: "border-purple-500/50 bg-purple-500/10 text-purple-400",
  queue: "border-orange-500/50 bg-orange-500/10 text-orange-400",
  storage: "border-amber-500/50 bg-amber-500/10 text-amber-400",
  worker: "border-pink-500/50 bg-pink-500/10 text-pink-400",
  group: "border-white/5 bg-white/[0.02] text-white/20",
};

export function CustomNode({ data, selected, type }: CustomNodeProps & { type: string }) {
  const Icon = data.icon;
  const isGroup = type === "group";
  const style = typeStyles[data.type || "server"];

  if (isGroup) {
    return (
      <div className={cn(
        "w-full h-full rounded-3xl border-2 border-teal-500/40 bg-teal-500/5 backdrop-blur-xl transition-all duration-500",
        selected ? "border-teal-500/60 bg-teal-500/10 shadow-[0_0_30px_rgba(20,184,166,0.1)]" : ""
      )}>
        <div className="absolute top-6 left-8 text-xs font-black uppercase tracking-[0.2em] text-teal-400">
          {data.label}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "relative px-4 py-2.5 rounded-2xl border-2 backdrop-blur-xl shadow-2xl w-[200px] transition-all duration-300",
        style,
        selected ? "ring-2 ring-white/50 border-white/50" : ""
      )}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-current !border-none !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Left} id="left-in" className="!bg-current !border-none !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Right} id="right-in" className="!bg-current !border-none !w-1.5 !h-1.5" />
      
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-white/10 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="overflow-hidden">
          <div className="text-xs font-bold tracking-tight truncate">{data.label}</div>
          {data.description && (
            <div className="text-[9px] opacity-60 leading-none mt-0.5 uppercase tracking-wider font-bold truncate">
              {data.description}
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Top} id="top-in" className="!bg-current !border-none !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Top} id="top-out" className="!bg-current !border-none !w-1.5 !h-1.5 opacity-0" />
      
      <Handle type="target" position={Position.Bottom} id="bottom-in" className="!bg-current !border-none !w-1.5 !h-1.5 opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom-out" className="!bg-current !border-none !w-1.5 !h-1.5" />
      
      <Handle type="target" position={Position.Left} id="left-in" className="!bg-current !border-none !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Left} id="left-out" className="!bg-current !border-none !w-1.5 !h-1.5" />
      
      <Handle type="target" position={Position.Right} id="right-in" className="!bg-current !border-none !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Right} id="right-out" className="!bg-current !border-none !w-1.5 !h-1.5" />
    </motion.div>
  );
}
