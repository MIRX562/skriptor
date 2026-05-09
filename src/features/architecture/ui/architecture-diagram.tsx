"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  INITIAL_NODES, 
  ALL_EDGES, 
  NODE_TYPES, 
  EDGE_TYPES,
  FLOWS 
} from "../const/flow-data";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutGrid, Layers, Settings2, Play, Pause, FastForward } from "lucide-react";

export function ArchitectureDiagram() {
  const [activeFlowId, setActiveFlowId] = useState(FLOWS[0].id);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activeFlow = useMemo(() => 
    FLOWS.find(f => f.id === activeFlowId) || FLOWS[0], 
  [activeFlowId]);

  // Auto-cycle logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev === null) return 0;
        const next = prev + 1;
        return next >= activeFlow.steps.length ? 0 : next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activeFlow.steps.length]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    group: CustomNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    packet: PacketEdge,
  }), []);

  const edges = useMemo(() => {
    const activeStepEdges = activeStepIndex !== null 
      ? activeFlow.steps[activeStepIndex].edges 
      : [];

    return ALL_EDGES.map((edge) => {
      const isActive = activeStepEdges.includes(edge.id);
      const isPartOfFlow = activeFlow.steps.some(s => s.edges.includes(edge.id));
      
      return {
        ...edge,
        animated: isActive,
        hidden: !isPartOfFlow && !isActive,
        data: {
          ...edge.data,
          color: edge.data?.color || activeFlow.color
        }
      };
    });
  }, [activeFlow, activeStepIndex]);

  const nodes = useMemo(() => INITIAL_NODES, []);

  return (
    <div className="w-full h-[850px] flex gap-4">
      {/* Left Sidebar: Flow Selector */}
      <aside className="w-64 flex flex-col gap-3 p-4 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl overflow-y-auto shrink-0">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Flows</h3>
          </div>
          <button 
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={cn(
              "p-1.5 rounded-lg border transition-all",
              isAutoPlaying ? "bg-teal-500/20 border-teal-500/50 text-teal-400" : "bg-white/5 border-white/10 text-white/30"
            )}
          >
            {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>
        
        {FLOWS.map((flow) => {
          const Icon = flow.icon;
          const isActive = activeFlowId === flow.id;
          
          return (
            <button
              key={flow.id}
              onClick={() => {
                setActiveFlowId(flow.id);
                setActiveStepIndex(0);
                setIsAutoPlaying(true);
              }}
              className={cn(
                "group relative w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 overflow-hidden",
                isActive 
                  ? "bg-white/10 border-white/20 text-white" 
                  : "bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white/60"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-bg"
                  className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-purple-500/10 -z-10"
                />
              )}
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isActive ? "bg-white/10" : "bg-white/5"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/20")} />
              </div>
              <span className="text-sm font-bold tracking-tight">{flow.label}</span>
            </button>
          );
        })}

        <div className="mt-auto pt-4 border-t border-white/5 px-2 space-y-3">
           <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
              <FastForward className="w-3 h-3" />
              AUTO_CYCLE: {isAutoPlaying ? "ON" : "OFF"}
           </div>
           <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono">
              <Settings2 className="w-3 h-3" />
              DETAILED_MODE: ACTIVE
           </div>
        </div>
      </aside>

      {/* Center: Main Flow Area */}
      <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl relative">
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
        >
          <Background color="#333" variant={BackgroundVariant.Dots} />
          <Controls className="!bg-white/5 !border-white/10 !fill-white" />
          
          <Panel position="bottom-right" className="p-4">
             <div className="text-[10px] text-teal-400 font-bold font-mono bg-black/60 px-3 py-1.5 rounded-lg border border-teal-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                FLOW: {activeFlow.label.toUpperCase()} // STEP: {activeStepIndex !== null ? `0${activeStepIndex + 1}` : "NONE"}
             </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Sidebar: Execution Steps */}
      <aside className="w-80 flex flex-col p-4 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl overflow-y-auto shrink-0">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 px-2">
          <Layers className="w-4 h-4 text-teal-400" />
          Execution Steps
        </h3>
        
        <div className="space-y-3">
          {activeFlow.steps.map((step, index) => {
            const isActive = activeStepIndex === index;
            
            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStepIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-500 relative overflow-hidden",
                  isActive 
                    ? "bg-white/10 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                    : "bg-white/5 border-white/5 text-white/30 hover:bg-white/5 hover:border-white/10"
                )}
              >
                {isActive && (
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"
                    layoutId="active-step-bar"
                  />
                )}
                
                {isActive && isAutoPlaying && (
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-0.5 bg-teal-500/30"
                  />
                )}

                <div className="text-xs font-black uppercase tracking-widest mb-1 opacity-50">Step 0{index + 1}</div>
                <div className="text-sm font-bold leading-none mb-2">{step.title}</div>
                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-[11px] opacity-70 leading-relaxed overflow-hidden"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAutoPlaying(true)}
          className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest h-8 text-white/30 hover:text-white hover:bg-white/5"
        >
          Resume Auto-cycle
        </Button>
      </aside>
    </div>
  );
}
