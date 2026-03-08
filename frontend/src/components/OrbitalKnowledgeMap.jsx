import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Link, Zap, Target, BookOpen, Layers, Lightbulb, Compass } from "lucide-react";

// Mapping status to styles
const STATUS_STYLES = {
    completed: 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_25px_rgba(52,211,153,0.4)]',
    in_progress: 'bg-blue-600 border-blue-400 text-white shadow-[0_0_25px_rgba(59,130,246,0.4)]',
    recommended_next: 'bg-purple-600 border-purple-400 text-white shadow-[0_0_30px_rgba(167,139,250,0.5)]',
    not_started: 'bg-gray-800/80 border-gray-700 text-gray-400 opacity-40',
};

const BLOOM_ICONS = {
    'Remember': BookOpen,
    'Understand': Lightbulb,
    'Apply': Target,
    'Analyze': Layers,
    'Evaluate': Compass,
    'Create': Zap,
};

export default function OrbitalKnowledgeMap({ mapData, selectedNode, onNodeSelect }) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef(null);

  // Process mapData
  const processedNodes = useMemo(() => {
    if (!mapData?.nodes) return [];
    
    return mapData.nodes.map(node => {
        const relatedIds = (mapData.edges || [])
            .filter(edge => edge.source === node.id || edge.target === node.id)
            .map(edge => edge.source === node.id ? edge.target : edge.source);
            
        return {
            ...node,
            relatedIds: [...new Set(relatedIds)],
            energy: node.status === 'completed' ? 100 : node.status === 'in_progress' ? 60 : node.status === 'recommended_next' ? 80 : 20
        };
    });
  }, [mapData]);

  // Handle auto-rotation
  useEffect(() => {
    let rotationTimer;
    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => (prev + 0.1) % 360);
      }, 30);
    }
    return () => clearInterval(rotationTimer);
  }, [autoRotate]);

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radiusX = 260; 
    const radiusY = 180; // Elliptical orbit
    const radian = (angle * Math.PI) / 180;

    const x = radiusX * Math.cos(radian);
    const y = radiusY * Math.sin(radian);

    // Depth effect
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.2, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    const scale = 0.7 + 0.5 * ((1 + Math.sin(radian)) / 2);

    return { x, y, angle, zIndex, opacity, scale };
  };

  if (!processedNodes.length) return null;

  return (
    <div
      className="w-full h-full min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden select-none font-sans"
      ref={containerRef}
      onMouseDown={() => setAutoRotate(false)}
      onMouseUp={() => !selectedNode && setAutoRotate(true)}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Connection Lines (SVGs) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
            <defs>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                    <stop offset="100%" stopColor="rgba(167,139,250,0.3)" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            {/* Draw all connections subtly, but highlight selected ones */}
            {(mapData.edges || []).map((edge, i) => {
                const startIdx = processedNodes.findIndex(n => n.id === edge.source);
                const endIdx = processedNodes.findIndex(n => n.id === edge.target);
                if (startIdx === -1 || endIdx === -1) return null;
                
                const startPos = calculateNodePosition(startIdx, processedNodes.length);
                const endPos = calculateNodePosition(endIdx, processedNodes.length);
                const isHighlighted = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
                
                return (
                    <motion.line
                        key={`edge-${i}`}
                        x1={`calc(50% + ${startPos.x}px)`}
                        y1={`calc(50% + ${startPos.y}px)`}
                        x2={`calc(50% + ${endPos.x}px)`}
                        y2={`calc(50% + ${endPos.y}px)`}
                        stroke={isHighlighted ? "url(#edgeGradient)" : "rgba(255,255,255,0.05)"}
                        strokeWidth={isHighlighted ? "2" : "1"}
                        filter={isHighlighted ? "url(#glow)" : "none"}
                        initial={false}
                        animate={{ opacity: isHighlighted ? 0.8 : 0.2 }}
                    />
                );
            })}
        </svg>

        {/* Orbital Atom Rings */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
            {[1, 1.2, 1.5].map((s, i) => (
                <div 
                    key={i}
                    className="absolute border border-white/5 rounded-full"
                    style={{
                        width: `${520 * s}px`,
                        height: `${360 * s}px`,
                        transform: `rotate(${i * 30}deg)`,
                    }}
                />
            ))}
        </div>

        {/* Central Host Node (The Atom Core) */}
        <motion.div 
            className="absolute z-20 flex flex-col items-center justify-center"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-32 h-32 rounded-full flex items-center justify-center p-6">
            {/* Core Glow Layers */}
            <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-2xl animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-[0_0_60px_rgba(79,70,229,0.5)] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-white/10" />
                <div className="flex flex-col items-center">
                    <span className="text-white text-[12px] font-black uppercase tracking-tighter leading-none mb-1">Mesh</span>
                    <span className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">Core</span>
                </div>
            </div>
            {/* Orbital Rings around core */}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
            <div className="absolute -inset-4 rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
          </div>
          <div className="mt-8 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl group">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] group-hover:text-blue-400 transition-colors">
                {mapData.map_title || "Neural Lattice"}
            </span>
          </div>
        </motion.div>

        {/* Orbiting Nodes (The Electrons) */}
        {processedNodes.map((node, index) => {
          const position = calculateNodePosition(index, processedNodes.length);
          const isSelected = selectedNode?.id === node.id;
          const isRelated = selectedNode && node.relatedIds.includes(selectedNode.id);
          const statusStyle = STATUS_STYLES[node.status] || STATUS_STYLES.not_started;
          const Icon = BLOOM_ICONS[node.bloom_level] || Compass;

          return (
            <div
              key={node.id}
              className="absolute transition-all duration-700 cursor-pointer group"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${isSelected ? 1.4 : position.scale})`,
                zIndex: isSelected ? 400 : position.zIndex,
                opacity: isSelected ? 1 : position.opacity,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onNodeSelect?.(node);
              }}
            >
              {/* Interaction Glow */}
              <AnimatePresence>
                {(isSelected || isRelated) && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute -inset-6 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" 
                    />
                )}
              </AnimatePresence>

              {/* Node Bead Visual */}
              <div
                className={`
                  w-14 h-14 rounded-full flex flex-col items-center justify-center
                  border-2 transition-all duration-300 transform relative z-10
                  ${statusStyle}
                  ${isSelected ? "ring-8 ring-white/10 border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]" : "group-hover:scale-110 group-hover:border-white/40 shadow-xl"}
                `}
              >
                {/* Inner Depth Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-transparent" />
                <Icon size={isSelected ? 20 : 18} className={isSelected ? "text-white" : "opacity-90"} />
                
                {/* High-Fidelity Labels */}
                <div className={`
                    absolute top-full mt-4 left-1/2 -translate-x-1/2 
                    whitespace-nowrap px-4 py-2 rounded-xl bg-black/60 backdrop-blur-2xl border border-white/10
                    shadow-2xl transition-all duration-500 font-outfit
                    ${isSelected || isRelated ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 text-white/50"}
                `}>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-black uppercase tracking-tight text-white">{node.label}</span>
                        {isSelected && (
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{node.bloom_level}</span>
                        )}
                    </div>
                </div>
              </div>

              {/* Advanced Status Pips */}
              {node.status === 'completed' && (
                 <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center z-20 shadow-lg shadow-emerald-500/20"
                 >
                    <Zap size={10} className="text-white fill-white" />
                 </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
