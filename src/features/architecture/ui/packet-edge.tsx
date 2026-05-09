"use client";

import React from "react";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import { motion } from "framer-motion";

export function PacketEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  animated,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
    borderRadius: 16,
  });

  const color = (data?.color as string) || "#2dd4bf";

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          stroke: animated ? color : "rgba(255,255,255,0.1)",
          strokeWidth: animated ? 2 : 1,
          transition: "stroke 0.3s, stroke-width 0.3s"
        }} 
      />
      
      {animated && (
        <circle r="4" fill={color}>
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={edgePath}
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {data?.label && animated && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: "none",
            }}
            className="bg-black/80 text-white/70 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm font-mono whitespace-nowrap"
          >
            {data.label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
