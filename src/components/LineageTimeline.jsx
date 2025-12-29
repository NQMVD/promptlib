import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, Sparkles, History } from "lucide-react";

/**
 * LineageTimeline - Visual timeline for prompt evolution chains
 * Shows Base → Enhanced → Evolved connections with branching support
 */
const LineageTimeline = ({ versions, activeIndex, onSelect }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Build tree structure from flat versions array
  const buildTree = (versions) => {
    const nodeMap = new Map();
    const roots = [];

    // First pass: create all nodes
    versions.forEach((v, idx) => {
      nodeMap.set(v.id, {
        ...v,
        index: idx,
        children: [],
        depth: 0,
        branch: 0,
      });
    });

    // Second pass: link parents to children and find roots
    versions.forEach((v) => {
      const node = nodeMap.get(v.id);
      if (v.parentId && nodeMap.has(v.parentId)) {
        const parent = nodeMap.get(v.parentId);
        parent.children.push(node);
        node.depth = parent.depth + 1;
      } else {
        roots.push(node);
      }
    });

    // Assign branch indices to handle multiple children
    const assignBranches = (node, branchOffset = 0) => {
      node.children.forEach((child, idx) => {
        child.branch = branchOffset + idx;
        assignBranches(child, child.branch);
      });
    };
    roots.forEach((root) => assignBranches(root));

    return { roots, nodeMap };
  };

  const { roots, nodeMap } = buildTree(versions);

  // Flatten tree back to array but preserve tree structure info
  const flattenTree = (nodes, result = []) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children.length > 0) {
        flattenTree(node.children, result);
      }
    });
    return result;
  };

  const treeNodes = flattenTree(roots);

  const getNodeStyle = (type) => {
    if (!type || type === "base" || !type) {
      return {
        borderColor: "#444",
        bgColor: "#111",
        textColor: "#666",
        icon: Circle,
        label: "BASE",
      };
    }
    if (type === "enhanced") {
      return {
        borderColor: "#7FD88F",
        bgColor: "#7FD88F11",
        textColor: "#7FD88F",
        icon: Sparkles,
        label: "ENHANCED",
      };
    }
    return {
      borderColor: "#AAA0FA",
      bgColor: "#AAA0FA11",
      textColor: "#AAA0FA",
      icon: History,
      label: "EVOLVED",
    };
  };

  const getConnectionColor = (fromType, toType) => {
    const from = fromType === "enhanced" ? "#7FD88F" : fromType === "evolved" ? "#AAA0FA" : "#444";
    const to = toType === "enhanced" ? "#7FD88F" : toType === "evolved" ? "#AAA0FA" : "#444";
    return { from, to };
  };

  return (
    <div className="relative">
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden md:flex items-start gap-0 overflow-x-auto pb-2 scrollbar-hide">
        {treeNodes.map((node, idx) => {
          const style = getNodeStyle(node.relationType);
          const Icon = style.icon;
          const isActive = node.index === activeIndex;
          const isHovered = hoveredIndex === idx;
          const parent = node.parentId ? nodeMap.get(node.parentId) : null;
          const hasSiblings = parent && parent.children.length > 1;
          const siblingIndex = parent ? parent.children.findIndex(c => c.id === node.id) : 0;

          return (
            <div key={node.id} className="flex items-start shrink-0">
              {/* Connection Line */}
              {parent && (
                <div className="flex items-center h-10 relative">
                  {/* Horizontal connector */}
                  <div 
                    className="w-8 h-0.5 relative"
                    style={{ 
                      background: `linear-gradient(90deg, ${getConnectionColor(parent.relationType, node.relationType).from}66, ${getConnectionColor(parent.relationType, node.relationType).to}66)` 
                    }}
                  >
                    {/* Animated pulse for active connection */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0"
                        style={{ 
                          background: `linear-gradient(90deg, transparent, ${style.borderColor})` 
                        }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  {/* Branch indicator for siblings */}
                  {hasSiblings && siblingIndex > 0 && (
                    <div 
                      className="absolute -top-4 left-0 w-8 h-4 border-l border-b rounded-bl-lg"
                      style={{ borderColor: `${style.borderColor}44` }}
                    />
                  )}
                </div>
              )}

              {/* Node */}
              <motion.button
                onClick={() => onSelect(node.index)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 ${
                  isActive ? "scale-110 z-10" : "hover:scale-105"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {/* Node Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive ? "shadow-lg" : ""
                  }`}
                  style={{
                    borderColor: style.borderColor,
                    backgroundColor: isActive ? style.bgColor : "#0a0a0a",
                    boxShadow: isActive ? `0 0 20px ${style.borderColor}33` : "none",
                  }}
                >
                  <Icon 
                    size={16} 
                    style={{ color: style.textColor }}
                    className={isActive ? "animate-pulse" : ""}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive ? "opacity-100" : "opacity-50"
                  }`}
                  style={{ color: style.textColor }}
                >
                  {style.label}
                  {node.relationType === "evolved" && node.branch > 0 && ` v${node.branch + 1}`}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: style.borderColor }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Hover Preview */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-64 p-3 bg-[#1a1a1a] border rounded-xl shadow-2xl z-50"
                      style={{ borderColor: style.borderColor + "44" }}
                    >
                      <p className="text-[11px] text-[#999] line-clamp-3 leading-relaxed">
                        {node.content}
                      </p>
                      <div className="mt-2 text-[9px] font-mono text-[#555]">
                        Click to select
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical Timeline */}
      <div className="md:hidden flex flex-col gap-0">
        {treeNodes.map((node, idx) => {
          const style = getNodeStyle(node.relationType);
          const Icon = style.icon;
          const isActive = node.index === activeIndex;
          const parent = node.parentId ? nodeMap.get(node.parentId) : null;

          return (
            <div key={node.id} className="flex items-stretch">
              {/* Vertical connector + Node */}
              <div className="flex flex-col items-center mr-3">
                {/* Top connector */}
                {parent && (
                  <div 
                    className="w-0.5 h-4"
                    style={{ backgroundColor: `${style.borderColor}44` }}
                  />
                )}
                
                {/* Node Circle */}
                <motion.button
                  onClick={() => onSelect(node.index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    isActive ? "shadow-lg" : ""
                  }`}
                  style={{
                    borderColor: style.borderColor,
                    backgroundColor: isActive ? style.bgColor : "#0a0a0a",
                    boxShadow: isActive ? `0 0 15px ${style.borderColor}33` : "none",
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={12} style={{ color: style.textColor }} />
                </motion.button>

                {/* Bottom connector */}
                {idx < treeNodes.length - 1 && (
                  <div 
                    className="w-0.5 flex-1 min-h-[16px]"
                    style={{ backgroundColor: "#222" }}
                  />
                )}
              </div>

              {/* Content Preview */}
              <motion.button
                onClick={() => onSelect(node.index)}
                className={`flex-1 text-left p-3 rounded-xl mb-2 transition-all ${
                  isActive 
                    ? "bg-[#1a1a1a] border" 
                    : "hover:bg-[#161616]"
                }`}
                style={{
                  borderColor: isActive ? style.borderColor + "44" : "transparent",
                }}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: style.textColor }}
                >
                  {style.label}
                </span>
                <p className={`text-[12px] mt-1 line-clamp-2 transition-colors ${
                  isActive ? "text-[#ddd]" : "text-[#666]"
                }`}>
                  {node.content}
                </p>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LineageTimeline;
