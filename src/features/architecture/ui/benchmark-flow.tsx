"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Panel,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "./custom-node";
import { PacketEdge } from "./packet-edge";
import { 
  BENCHMARK_NODES, 
  BENCHMARK_EDGES, 
  BENCHMARK_STEPS 
} from "../const/benchmark-data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Play, Pause, Layout, Activity } from "lucide-react";

export function BenchmarkFlow() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeSubStepIndex, setActiveSubStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [showAll, setShowAll] = useState(false);

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

  useEffect(() => {
    if (!isAutoPlaying || showAll) return;

    const interval = setInterval(() => {
      const activeStep = BENCHMARK_STEPS[activeStepIndex];
      
      if (activeStep.subSteps && activeSubStepIndex < activeStep.subSteps.length - 1) {
        setActiveSubStepIndex(prev => prev + 1);
      } else {
        setActiveSubStepIndex(0);
        setActiveStepIndex((prev) => (prev + 1) % BENCHMARK_STEPS.length);
      }
    }, activeStepIndex === 1 ? 2500 : 4000); // Faster cycling for models

    return () => clearInterval(interval);
  }, [isAutoPlaying, showAll, activeStepIndex, activeSubStepIndex]);

  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    group: CustomNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    packet: PacketEdge,
  }), []);

  const activeStep = BENCHMARK_STEPS[activeStepIndex];
  const activeStepEdges = useMemo(() => {
    if (showAll) return BENCHMARK_EDGES.map(e => e.id);
    if (activeStep.subSteps) {
      return activeStep.subSteps[activeSubStepIndex].edges;
    }
    return activeStep.edges || [];
  }, [activeStep, activeSubStepIndex, showAll]);

  const nodes = useMemo(() => {
    const activeNodeIds = new Set<string>();
    BENCHMARK_EDGES.forEach((edge) => {
      if (activeStepEdges.includes(edge.id)) {
        activeNodeIds.add(edge.source);
        activeNodeIds.add(edge.target);
      }
    });

    return BENCHMARK_NODES.map((node) => {
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

  const edges = useMemo(() => {
    return BENCHMARK_EDGES.map((edge) => ({
      ...edge,
      animated: activeStepEdges.includes(edge.id),
      data: {
        ...edge.data,
        isActive: activeStepEdges.includes(edge.id),
      }
    }));
  }, [activeStepEdges]);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl relative">
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
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Benchmark Sequence</span>
              <button 
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={cn(
                  "ml-2 p-1 rounded-md transition-colors",
                  isAutoPlaying ? "text-purple-400 bg-purple-500/10" : "text-white/20 hover:text-white/40"
                )}
              >
                {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1">
              {BENCHMARK_STEPS.map((step, index) => {
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
                    {isActive && step.subSteps && (
                      <span className="text-[8px] font-mono text-purple-400/80 mt-0.5 uppercase tracking-tighter">
                        Active: {step.subSteps[activeSubStepIndex].title}
                      </span>
                    )}
                    {isActive && (
                      <motion.div 
                        layoutId="step-indicator-bench"
                        className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-purple-500/20 rounded-full"
                      />
                    )}
                    {isActive && isAutoPlaying && (
                      <motion.div 
                        key={`progress-bench-${activeStepIndex}-${activeSubStepIndex}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: activeStepIndex === 1 ? 2.5 : 4, ease: "linear" }}
                        className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-purple-500 rounded-full origin-left"
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
                showAll ? "bg-purple-500/20 border-purple-500/40 text-purple-400" : "bg-white/5 border-white/10 text-white/30"
              )}
            >
              <Layout className="w-4 h-4" />
              <span className="text-[8px] font-bold uppercase tracking-tighter">Show All</span>
            </button>
          </div>
        </Panel>

        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
      </ReactFlow>
    </div>
  );
}
