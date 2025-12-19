import React, { useState } from "react";
import { 
  ArrowDown, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  History, 
  Circle, 
  ArrowRight,
  Layers,
  Layout,
  MessageSquare,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_CHAIN = [
  {
    id: "base",
    content: "Write a short story about a cat in space.",
    type: "base",
    timestamp: "10:00 AM",
    version: 1,
  },
  {
    id: "enhanced",
    parentId: "base",
    content: "Craft a compelling short story centered on a feline astronaut navigating a zero-gravity environment within a high-tech spacecraft. Focus on sensory details like the hum of the life support and the view of distant nebulae.",
    type: "enhanced",
    timestamp: "10:05 AM",
    version: 1,
  },
  {
    id: "evolved-1",
    parentId: "enhanced",
    content: "Craft a compelling short story centered on a feline astronaut navigating a zero-gravity environment. The cat should have a robotic prosthetic tail. Focus on sensory details like the metallic clink of the tail and the smell of ozone in the cockpit.",
    type: "evolved",
    timestamp: "10:15 AM",
    version: 1,
  },
  {
    id: "evolved-2",
    parentId: "enhanced",
    content: "Craft a compelling short story centered on a feline astronaut named Orion. Orion is on a mission to deliver a package to a lonely space station. Emphasize the bond between Orion and the ship's AI.",
    type: "evolved",
    timestamp: "10:20 AM",
    version: 2,
  }
];

const VariantsGallery = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1d1d1] p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Lineage UI Variants</h1>
            <p className="text-[#666] text-sm">Comparing 4 ways to visualize Base ↔ Enhanced ↔ Evolved connections</p>
          </div>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm transition-colors"
          >
            Back to Library
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Variant 1: Threaded Pipeline */}
          <section className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#444] border-b border-[#222] pb-2">
              Variant 1: Threaded Pipeline
            </h2>
            <div className="space-y-0">
              {MOCK_CHAIN.filter(p => p.id !== 'evolved-2').map((item, idx) => (
                <div key={item.id} className="relative pl-8 group">
                  {/* Vertical Line */}
                  {idx < 2 && (
                    <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${
                      item.id === 'base' ? 'bg-emerald-500/30' : 'bg-violet-500/30'
                    }`} />
                  )}
                  
                  {/* Icon Node */}
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 ${
                    item.type === 'base' ? 'bg-[#0a0a0a] border-gray-600' :
                    item.type === 'enhanced' ? 'bg-[#0a0a0a] border-emerald-500' :
                    'bg-[#0a0a0a] border-violet-500'
                  }`}>
                    {item.type === 'base' ? <Circle size={10} className="text-gray-400" /> :
                     item.type === 'enhanced' ? <Sparkles size={10} className="text-emerald-500" /> :
                     <History size={10} className="text-violet-500" />}
                  </div>

                  <div className={`mb-8 p-4 rounded-xl border transition-all ${
                    item.type === 'base' ? 'bg-[#111] border-[#222]' :
                    item.type === 'enhanced' ? 'bg-emerald-500/5 border-emerald-500/20' :
                    'bg-violet-500/5 border-violet-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        item.type === 'base' ? 'text-[#666]' :
                        item.type === 'enhanced' ? 'text-emerald-500' :
                        'text-violet-500'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-[#444]">{item.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#aaa]">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Variant 2: Ancestry Breadcrumbs */}
          <section className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#444] border-b border-[#222] pb-2">
              Variant 2: Ancestry Breadcrumbs
            </h2>
            <div className="space-y-4">
              <div className="p-5 bg-[#111] border border-[#222] rounded-2xl">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-[#555]">
                  <span>BASE</span>
                  <ChevronRight size={10} />
                  <span className="text-emerald-500/70">ENHANCED</span>
                  <ChevronRight size={10} />
                  <span className="text-violet-500">EVOLVED V2</span>
                </div>
                <p className="text-sm leading-relaxed text-[#bbb] mb-4">
                  {MOCK_CHAIN[3].content}
                </p>
                <div className="flex items-center justify-between border-t border-[#222] pt-3">
                  <div className="flex items-center gap-2">
                    <History size={12} className="text-violet-500" />
                    <span className="text-[10px] font-bold text-violet-500 uppercase">Evolved Prompt</span>
                  </div>
                  <button className="text-[10px] text-[#444] hover:text-[#888] underline">View Source</button>
                </div>
              </div>
              
              <div className="p-5 bg-[#111] border border-[#222] rounded-2xl opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-[#555]">
                  <span>BASE</span>
                  <ChevronRight size={10} />
                  <span className="text-emerald-500">ENHANCED</span>
                </div>
                <p className="text-sm leading-relaxed text-[#888]">
                  {MOCK_CHAIN[1].content}
                </p>
              </div>
            </div>
          </section>

          {/* Variant 3: Nested Containment */}
          <section className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#444] border-b border-[#222] pb-2">
              Variant 3: Nested Containment
            </h2>
            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
              {/* Base */}
              <div className="p-4 border-b border-[#222]">
                <div className="text-[10px] font-bold text-[#666] mb-1">BASE</div>
                <p className="text-sm text-[#888]">{MOCK_CHAIN[0].content}</p>
              </div>
              {/* Enhanced Child */}
              <div className="bg-[#161616] p-4 border-b border-[#222] ml-4 border-l-2 border-emerald-500/30">
                <div className="text-[10px] font-bold text-emerald-500 mb-1 flex items-center gap-2">
                  <Sparkles size={10} /> ENHANCED
                </div>
                <p className="text-sm text-[#999]">{MOCK_CHAIN[1].content}</p>
                
                {/* Evolved Children */}
                <div className="mt-4 space-y-3">
                  <div className="bg-[#1a1a1a] p-3 rounded-lg border border-violet-500/20 ml-4 border-l-2 border-violet-500/50">
                    <div className="text-[9px] font-bold text-violet-500 mb-1">EVOLVED V1</div>
                    <p className="text-[13px] text-[#aaa]">{MOCK_CHAIN[2].content}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-lg border border-violet-500/20 ml-4 border-l-2 border-violet-500/50">
                    <div className="text-[9px] font-bold text-violet-500 mb-1">EVOLVED V2</div>
                    <p className="text-[13px] text-[#aaa]">{MOCK_CHAIN[3].content}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Variant 4: Version Slider */}
          <section className="space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#444] border-b border-[#222] pb-2">
              Variant 4: Version Slider (Chains)
            </h2>
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 relative h-[300px] flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-violet-500" />
                    <span className="text-xs font-bold text-[#f0f0f0]">Evolution Chain</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#444]">v2 of 2</div>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key="v2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <p className="text-sm leading-relaxed text-[#bbb]">
                      {MOCK_CHAIN[3].content}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-auto pt-6 border-t border-[#222] flex items-center justify-between">
                <div className="flex items-center gap-1 bg-[#0a0a0a] rounded-lg p-1 border border-[#222]">
                  <button className="p-1.5 hover:bg-[#222] rounded text-[#444] hover:text-[#888]">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex gap-1 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  </div>
                  <button className="p-1.5 hover:bg-[#222] rounded text-[#444] hover:text-[#888]">
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="text-[10px] font-mono text-[#444] flex items-center gap-2">
                  <span>PARENT:</span>
                  <span className="text-emerald-500/50">ENHANCED #832</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default VariantsGallery;
