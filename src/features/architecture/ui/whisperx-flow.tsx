"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "./custom-node";
import { PacketEdge } from "./packet-edge";
import { 
  WHISPERX_NODES, 
  WHISPERX_EDGES, 
  WHISPERX_STEPS 
} from "../const/whisperx-data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Play, Pause, Layout, Cpu } from "lucide-react";

export function WhisperXFlow() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Auto-cycle logic
  useEffect(() => {
    if (!isAutoPlaying || showAll) return;

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % WHISPERX_STEPS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, WHISPERX_STEPS.length, showAll]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    packet: PacketEdge,
  }), []);

  const activeStepEdges = useMemo(() => {
    if (showAll) return WHISPERX_EDGES.map(e => e.id);
    return WHISPERX_STEPS[activeStepIndex]?.edges || [];
  }, [activeStepIndex, showAll]);

  const edges = useMemo(() => {
    return WHISPERX_EDGES.map((edge) => {
      const isActive = activeStepEdges.includes(edge.id);
      const isPartOfFlow = showAll || WHISPERX_STEPS.some(s => s.edges.includes(edge.id));
      
      return {
        ...edge,
        animated: isActive,
        hidden: !isPartOfFlow && !isActive,
        data: {
          ...edge.data,
          isActive,
          color: edge.data?.color || "#3b82f6"
        }
      };
    });
  }, [activeStepEdges, showAll]);

  const nodes = useMemo(() => {
    const activeNodeIds = new Set<string>();
    WHISPERX_EDGES.forEach(e => {
      if (activeStepEdges.includes(e.id)) {
        activeNodeIds.add(e.source);
        activeNodeIds.add(e.target);
      }
    });

    return WHISPERX_NODES.map((node) => {
      const isNodeActive = showAll || activeNodeIds.has(node.id);
      
      return {
        ...node,
        data: {
          ...node.data,
          isActive: isNodeActive
        }
      };
    });
  }, [activeStepEdges, showAll]);

  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => (e.key === "Control" || e.key === "Meta") && setIsCtrlPressed(true);
    const up = (e: KeyboardEvent) => (e.key === "Control" || e.key === "Meta") && setIsCtrlPressed(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return (
    <div className="w-full h-[600px] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden relative group/flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: "packet" }}
        zoomOnScroll={isCtrlPressed}
        panOnScroll={false}
        preventScrolling={isCtrlPressed}
      >
        <Panel position="top-center" className="w-full flex justify-center pt-6 pointer-events-none">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl pointer-events-auto max-w-[90%] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-3 py-1.5 border-r border-white/10 shrink-0">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">AI Pipeline</span>
              <button 
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={cn(
                  "ml-2 p-1 rounded-md transition-colors",
                  isAutoPlaying ? "text-blue-400 bg-blue-500/10" : "text-white/20 hover:text-white/40"
                )}
              >
                {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1">
              {WHISPERX_STEPS.map((step, index) => {
                const isActive = !showAll && activeStepIndex === index;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveStepIndex(index);
                      setIsAutoPlaying(false);
                      setShowAll(false);
                    }}
                    className={cn(
                      "relative px-4 py-2 rounded-xl transition-all duration-300 flex flex-col items-start gap-0.5 min-w-[120px]",
                      isActive 
                        ? "bg-white/10 text-white" 
                        : "text-white/30 hover:bg-white/5 hover:text-white/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono opacity-50">0{index + 1}</span>
                      <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">{step.title}</span>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="step-indicator-whisperx"
                        className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-blue-500/20 rounded-full"
                      />
                    )}
                    {isActive && isAutoPlaying && (
                      <motion.div 
                        key={`progress-wx-${activeStepIndex}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 4, ease: "linear" }}
                        className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-blue-500 rounded-full origin-left"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="h-10 w-[1px] bg-white/10 mx-1" />

            <button 
              onClick={() => {
                setShowAll(!showAll);
                if (!showAll) setIsAutoPlaying(false);
              }}
              className={cn(
                "p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 min-w-[80px]",
                showAll ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-white/5 border-white/10 text-white/30"
              )}
            >
              <Layout className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-tighter">Show All</span>
            </button>
          </div>
        </Panel>

        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="rgba(255,255,255,0.05)" 
        />
        <Controls 
          className="bg-neutral-900 border-white/10" 
          showInteractive={false}
        />
      </ReactFlow>

      {/* Info Overlay */}
      <div className="absolute bottom-6 left-6 p-4 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl max-w-sm pointer-events-none opacity-0 group-hover/flow:opacity-100 transition-opacity">
        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">{WHISPERX_STEPS[activeStepIndex]?.title}</h4>
        <p className="text-[11px] text-white/60 leading-relaxed">
          {WHISPERX_STEPS[activeStepIndex]?.description}
        </p>
      </div>
    </div>
  );
}
