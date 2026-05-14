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
  INITIAL_NODES, 
  ALL_EDGES, 
  FLOWS 
} from "../const/flow-data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutGrid, Settings2, Play, Pause, FastForward, PlayCircle, Layout } from "lucide-react";

export function ArchitectureDiagram({ 
  defaultFlowId = FLOWS[0].id,
  defaultStepIndex = 0 
}: { 
  defaultFlowId?: string;
  defaultStepIndex?: number | null;
}) {
  const [activeFlowId, setActiveFlowId] = useState(defaultFlowId);
  const [activeStepIndex, setActiveStepIndex] = useState(defaultStepIndex);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const activeFlow = useMemo(() => 
    FLOWS.find(f => f.id === activeFlowId) || FLOWS[0], 
  [activeFlowId]);

  // Auto-cycle logic
  useEffect(() => {
    if (!isAutoPlaying || showAll) return;

    const interval = setInterval(() => {
      setActiveStepIndex((prev) => ((prev ?? 0) + 1) % activeFlow.steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activeFlow.steps.length, showAll]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    group: CustomNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    packet: PacketEdge,
  }), []);

  const activeStepEdges = useMemo(() => {
    if (showAll) return ALL_EDGES.map(e => e.id);
    return (activeStepIndex !== null ? activeFlow.steps[activeStepIndex]?.edges : []) || [];
  }, [activeFlow, activeStepIndex, showAll]);

  const edges = useMemo(() => {
    return ALL_EDGES.map((edge) => {
      const isActive = activeStepEdges.includes(edge.id);
      const isPartOfFlow = showAll || activeFlow.steps.some(s => s.edges.includes(edge.id));
      
      return {
        ...edge,
        animated: isActive,
        hidden: !isPartOfFlow && !isActive,
        data: {
          ...edge.data,
          isActive,
          color: edge.data?.color || activeFlow.color
        }
      };
    });
  }, [activeFlow, activeStepEdges, showAll]);

  const nodes = useMemo(() => {
    const activeNodeIds = new Set<string>();
    ALL_EDGES.forEach(e => {
      if (activeStepEdges.includes(e.id)) {
        activeNodeIds.add(e.source);
        activeNodeIds.add(e.target);
      }
    });

    return INITIAL_NODES.map((node) => {
      const isNodeActive = showAll || node.type === 'group' || activeNodeIds.has(node.id);
      
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
      <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl relative group">
        <div className="absolute inset-0 z-0">
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
                  <PlayCircle className="w-4 h-4 text-teal-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">System Sequence</span>
                  <button 
                    onClick={() => {
                      setIsAutoPlaying(!isAutoPlaying);
                      if (!isAutoPlaying) setShowAll(false);
                    }}
                    className={cn(
                      "ml-2 p-1 rounded-md transition-colors",
                      isAutoPlaying ? "text-teal-400 bg-teal-500/10" : "text-white/20 hover:text-white/40"
                    )}
                  >
                    {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1">
                  {activeFlow.steps.map((step, index) => {
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
                          "relative px-4 py-2 rounded-xl transition-all duration-300 flex flex-col items-start gap-0.5 min-w-[140px]",
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
                            layoutId="step-indicator-sys"
                            className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-teal-500/20 rounded-full"
                          />
                        )}
                        {isActive && isAutoPlaying && (
                          <motion.div 
                            key={`progress-sys-${activeStepIndex}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 4, ease: "linear" }}
                            className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-teal-500 rounded-full origin-left"
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
                    showAll ? "bg-teal-500/20 border-teal-500/40 text-teal-400" : "bg-white/5 border-white/10 text-white/30"
                  )}
                >
                  <Layout className="w-4 h-4" />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">Show All</span>
                </button>
             </div>
          </Panel>

          <Background color="#333" variant={BackgroundVariant.Dots} />
          <Controls className="!bg-white/5 !border-white/10 !fill-white" />
          
          <Panel position="bottom-right" className="p-4">
             <div className="text-[10px] text-teal-400 font-bold font-mono bg-black/60 px-3 py-1.5 rounded-lg border border-teal-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                FLOW: {activeFlow.label.toUpperCase()} // STEP: {activeStepIndex !== null ? `0${activeStepIndex + 1}` : "NONE"}
             </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  </div>
  );
}
