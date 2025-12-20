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
  MoreVertical,
  Zap,
  Brain,
  Search,
  Maximize2,
  Split
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_CHAIN = [
  {
    id: "base",
    content: "Write a short story about a cat in space.",
    type: "base",
    timestamp: "10:00 AM",
    version: 1,
    complexity: 20,
  },
  {
    id: "enhanced",
    parentId: "base",
    content: "Craft a compelling short story centered on a feline astronaut navigating a zero-gravity environment within a high-tech spacecraft. Focus on sensory details like the hum of the life support and the view of distant nebulae.",
    type: "enhanced",
    timestamp: "10:05 AM",
    version: 1,
    complexity: 65,
    thought: "Expanding scope and adding sensory constraints."
  },
  {
    id: "evolved-1",
    parentId: "enhanced",
    content: "Craft a compelling short story centered on a feline astronaut navigating a zero-gravity environment. The cat should have a robotic prosthetic tail. Focus on sensory details like the metallic clink of the tail and the smell of ozone in the cockpit.",
    type: "evolved",
    timestamp: "10:15 AM",
    version: 1,
    complexity: 72,
    thought: "Add a cybernetic element to create unique conflict."
  },
  {
    id: "evolved-2",
    parentId: "enhanced",
    content: "Craft a compelling short story centered on a feline astronaut named Orion. Orion is on a mission to deliver a package to a lonely space station. Emphasize the bond between Orion and the ship's AI.",
    type: "evolved",
    timestamp: "10:20 AM",
    version: 2,
    complexity: 80,
    thought: "Shift focus to narrative purpose and AI relationship."
  }
];

const VariantsGallery = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1d1d1] p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Lineage UI Variants</h1>
            <p className="text-[#666] text-sm">Comparing 6 ways to visualize Base ↔ Enhanced ↔ Evolved connections</p>
          </div>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm transition-colors"
          >
            Back to Library
          </button>
        </header>

        {/* Section 1: Refined Classics */}
        <div className="mb-20">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#444] mb-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-[#222]"></span>
            Generation 1: Refined Classics
            <span className="h-px flex-1 bg-[#222]"></span>
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Variant 1: Threaded Pipeline */}
            <section className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#666] border-b border-[#222] pb-2">
                Variant 1: Threaded Pipeline
              </h3>
              <div className="space-y-0">
                {MOCK_CHAIN.filter(p => p.id !== 'evolved-2').map((item, idx) => (
                  <div key={item.id} className="relative pl-8 group">
                    {/* Vertical Line */}
                    {idx < 2 && (
                      <div 
                        className="absolute left-[11px] top-6 bottom-0 w-0.5"
                        style={{ backgroundColor: item.id === 'base' ? '#7FD88F4D' : '#AAA0FA4D' }}
                      />
                    )}
                    
                    {/* Icon Node */}
                    <div 
                      className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10"
                      style={{ 
                        backgroundColor: '#0a0a0a',
                        borderColor: item.type === 'base' ? '#444' : item.type === 'enhanced' ? '#7FD88F' : '#AAA0FA'
                      }}
                    >
                      {item.type === 'base' ? <Circle size={10} style={{ color: '#666' }} /> :
                       item.type === 'enhanced' ? <Sparkles size={10} style={{ color: '#7FD88F' }} /> :
                       <History size={10} style={{ color: '#AAA0FA' }} />}
                    </div>

                    <div 
                      className="mb-8 p-4 rounded-xl border transition-all"
                      style={{
                        backgroundColor: item.type === 'base' ? '#111' : item.type === 'enhanced' ? '#7FD88F0D' : '#AAA0FA0D',
                        borderColor: item.type === 'base' ? '#222' : item.type === 'enhanced' ? '#7FD88F33' : '#AAA0FA33'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="text-[10px] font-bold uppercase tracking-widest"
                          style={{
                            color: item.type === 'base' ? '#666' : item.type === 'enhanced' ? '#7FD88F' : '#AAA0FA'
                          }}
                        >
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

            {/* Variant 4: Version Slider */}
            <section className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#666] border-b border-[#222] pb-2">
                Variant 4: Version Slider (Chains)
              </h3>
              <div className="bg-[#111] border border-[#222] rounded-2xl p-6 relative h-[300px] flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <History size={16} style={{ color: '#AAA0FA' }} />
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
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#AAA0FA' }} />
                    </div>
                    <button className="p-1.5 hover:bg-[#222] rounded text-[#444] hover:text-[#888]">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div className="text-[10px] font-mono text-[#444] flex items-center gap-2">
                    <span>PARENT:</span>
                    <span style={{ color: '#7FD88F80' }}>ENHANCED #832</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Section 2: Experimental Divergence */}
        <div>
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#444] mb-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-[#222]"></span>
            Generation 2: Experimental Divergence
            <span className="h-px flex-1 bg-[#222]"></span>
          </h2>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            
            {/* Variant 5: The Synapse Bridge */}
            <section className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#666] border-b border-[#222] pb-2">
                Variant 5: The Synapse Bridge
              </h3>
              <div className="space-y-4">
                <div className="bg-[#111] border border-[#222] rounded-3xl p-6 relative overflow-hidden">
                   {/* Background Gradient */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#AAA0FA]/5 blur-3xl -mr-16 -mt-16" />
                   
                   <div className="flex flex-col gap-6">
                      <div className="flex items-start gap-3">
                         <div className="w-6 h-6 rounded-lg bg-[#222] flex items-center justify-center shrink-0">
                            <Circle size={12} className="text-[#666]" />
                         </div>
                         <div className="flex-1">
                            <span className="text-[9px] font-mono text-[#444] block mb-1">ORIGIN</span>
                            <p className="text-xs text-[#666] line-clamp-2 italic">"{MOCK_CHAIN[0].content}"</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 py-2">
                         <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#AAA0FA33] to-[#AAA0FA]" />
                         <div className="px-3 py-1 rounded-full bg-[#AAA0FA]/10 border border-[#AAA0FA22] flex items-center gap-2">
                            <Brain size={10} style={{ color: '#AAA0FA' }} />
                            <span className="text-[9px] font-bold text-[#AAA0FA] uppercase tracking-wider">Evolutionary Shift</span>
                         </div>
                         <div className="h-px flex-1 bg-linear-to-r from-[#AAA0FA] via-[#AAA0FA33] to-transparent" />
                      </div>

                      <div className="flex items-start gap-4">
                         <div className="w-10 h-10 rounded-xl bg-[#AAA0FA]/10 border border-[#AAA0FA33] flex items-center justify-center shrink-0 shadow-lg shadow-[#AAA0FA11]">
                            <History size={18} style={{ color: '#AAA0FA' }} />
                         </div>
                         <div>
                            <span className="text-[10px] font-bold text-[#AAA0FA] block mb-2 tracking-widest uppercase">Evolved Prompt</span>
                            <p className="text-sm leading-relaxed text-[#ddd]">{MOCK_CHAIN[2].content}</p>
                            
                            <div className="mt-4 p-3 bg-[#0a0a0a] rounded-xl border border-[#222] flex items-start gap-3">
                               <MessageSquare size={12} className="text-[#444] mt-0.5" />
                               <p className="text-[11px] text-[#888] italic leading-snug">
                                  "{MOCK_CHAIN[2].thought}"
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Variant 6: The Morph Grid */}
            <section className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#666] border-b border-[#222] pb-2">
                Variant 6: The Morph Grid
              </h3>
              <div className="bg-[#111] border border-[#222] rounded-3xl p-6">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-[#7FD88F]" />
                       <div className="w-2 h-2 rounded-full bg-[#222]" />
                       <div className="w-2 h-2 rounded-full bg-[#222]" />
                    </div>
                    <span className="text-[10px] font-mono text-[#444]">DIFF ANALYSIS</span>
                 </div>
                 
                 <div className="relative p-5 bg-[#0a0a0a] rounded-2xl border border-[#222] overflow-hidden">
                    <div className="absolute top-4 right-4 text-[10px] font-bold text-[#7FD88F] bg-[#7FD88F11] px-2 py-0.5 rounded border border-[#7FD88F22]">
                       +45% CONTENT GROWTH
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-xs text-[#444] leading-relaxed">
                          Write a short story about a <span className="text-[#666] line-through">cat</span> <span className="text-[#7FD88F] font-bold underline">feline astronaut</span> in space.
                       </p>
                       <p className="text-sm text-[#bbb] leading-relaxed">
                          <span className="opacity-50 italic">Craft a compelling short story centered on a feline astronaut navigating a zero-gravity environment within a high-tech spacecraft.</span> Focus on <span className="text-[#7FD88F] bg-[#7FD88F11] px-1 rounded">sensory details</span> like the <span className="text-[#7FD88F] bg-[#7FD88F11] px-1 rounded">hum of the life support</span> and the <span className="text-[#7FD88F] bg-[#7FD88F11] px-1 rounded">view of distant nebulae</span>.
                       </p>
                    </div>
                 </div>

                 <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl border border-[#222] bg-[#161616]">
                       <div className="text-[9px] font-mono text-[#555] uppercase mb-1">Precision</div>
                       <div className="text-lg font-bold text-[#f0f0f0]">+24%</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#222] bg-[#161616]">
                       <div className="text-[9px] font-mono text-[#555] uppercase mb-1">Complexity</div>
                       <div className="text-lg font-bold text-[#7FD88F]">+65%</div>
                    </div>
                 </div>
              </div>
            </section>

            {/* Variant 7: The Isometric Stack */}
            <section className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#666] border-b border-[#222] pb-2">
                Variant 7: The Isometric Stack
              </h3>
              <div className="h-[400px] flex items-center justify-center relative perspective-[1000px]">
                 {/* Back Layer (Base) */}
                 <div 
                    className="absolute w-[300px] p-4 bg-[#111] border border-[#222] rounded-2xl shadow-2xl transition-all duration-500 opacity-20"
                    style={{ transform: 'rotateX(40deg) rotateZ(-20deg) translateZ(-100px) translateY(-50px)' }}
                 >
                    <div className="text-[8px] font-bold text-[#444] mb-2 uppercase">Base Layer</div>
                    <p className="text-[10px] text-[#444] line-clamp-3">{MOCK_CHAIN[0].content}</p>
                 </div>

                 {/* Middle Layer (Enhanced) */}
                 <div 
                    className="absolute w-[320px] p-5 bg-[#161616] border border-[#7FD88F44] rounded-2xl shadow-2xl transition-all duration-500 opacity-40"
                    style={{ transform: 'rotateX(40deg) rotateZ(-20deg) translateZ(-50px) translateY(-25px)' }}
                 >
                    <div className="flex items-center gap-2 mb-2">
                       <Sparkles size={10} style={{ color: '#7FD88F' }} />
                       <span className="text-[8px] font-bold text-[#7FD88F] uppercase">Enhanced</span>
                    </div>
                    <p className="text-[11px] text-[#666] line-clamp-3">{MOCK_CHAIN[1].content}</p>
                 </div>

                 {/* Top Layer (Evolved) */}
                 <div 
                    className="absolute w-[340px] p-6 bg-[#1a1a1a] border border-[#AAA0FA] rounded-3xl shadow-[0_20px_50px_rgba(170,160,250,0.1)] transition-all duration-500 z-10 hover:scale-105 cursor-pointer"
                    style={{ transform: 'rotateX(40deg) rotateZ(-20deg) translateZ(0px)' }}
                 >
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <History size={14} style={{ color: '#AAA0FA' }} />
                          <span className="text-[10px] font-bold text-[#AAA0FA] uppercase tracking-widest">Evolved v2</span>
                       </div>
                       <Maximize2 size={12} className="text-[#444]" />
                    </div>
                    <p className="text-sm leading-relaxed text-[#ddd] line-clamp-5">
                       {MOCK_CHAIN[3].content}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                       <div className="flex -space-x-2">
                          <div className="w-5 h-5 rounded-full bg-[#333] border border-[#0a0a0a]" />
                          <div className="w-5 h-5 rounded-full bg-[#444] border border-[#0a0a0a]" />
                          <div className="w-5 h-5 rounded-full bg-[#AAA0FA22] border border-[#AAA0FA44] flex items-center justify-center">
                             <span className="text-[8px] text-[#AAA0FA]">+2</span>
                          </div>
                       </div>
                       <span className="text-[9px] font-mono text-[#444]">DEPTH: GEN 3</span>
                    </div>
                 </div>
                 
                 {/* Connection Threads (Abstract) */}
                 <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-linear-to-b from-transparent via-[#AAA0FA22] to-transparent rotate-[20deg]" />
                 </div>
              </div>
            </section>

            {/* Variant 8: The Codex Navigator */}
            <section className="space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#666] border-b border-[#222] pb-2">
                Variant 8: The Codex Navigator
              </h3>
              <div className="bg-[#111] border border-[#222] rounded-3xl h-[400px] flex overflow-hidden">
                 {/* Sidebar: Lineage Map */}
                 <div className="w-16 border-r border-[#222] flex flex-col items-center py-6 gap-6 bg-[#0d0d0d]">
                    <div className="w-8 h-8 rounded-full border border-[#444] flex items-center justify-center text-[10px] text-[#444] hover:bg-[#222] cursor-pointer">B</div>
                    <div className="w-px h-4 bg-[#222]" />
                    <div className="w-8 h-8 rounded-full border border-[#7FD88F] bg-[#7FD88F11] flex items-center justify-center text-[10px] text-[#7FD88F] hover:bg-[#7FD88F22] cursor-pointer">EN</div>
                    <div className="w-px h-4 bg-[#222]" />
                    <div className="flex flex-col gap-2">
                       <div className="w-8 h-8 rounded-full border-2 border-[#AAA0FA] bg-[#AAA0FA22] flex items-center justify-center text-[10px] text-[#AAA0FA] shadow-[0_0_10px_rgba(170,160,250,0.2)]">E1</div>
                       <div className="w-8 h-8 rounded-full border border-[#AAA0FA44] flex items-center justify-center text-[10px] text-[#AAA0FA44] hover:bg-[#AAA0FA11] cursor-pointer">E2</div>
                    </div>
                 </div>

                 {/* Main: Focus View */}
                 <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#161616]">
                       <div className="flex items-center gap-3">
                          <Split size={14} className="text-[#AAA0FA]" />
                          <span className="text-[10px] font-bold text-[#f0f0f0] uppercase tracking-tighter">Branch: Cybernetic Tail</span>
                       </div>
                       <span className="text-[9px] font-mono text-[#555]">TIMESTAMP: 10:15 AM</span>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-linear-to-b from-[#111] to-[#0a0a0a]">
                       <div className="space-y-6">
                          <div>
                             <h4 className="text-[10px] font-bold text-[#444] uppercase mb-3 tracking-widest">Instruction Set</h4>
                             <div className="p-4 bg-[#0d0d0d] rounded-2xl border border-[#222]">
                                <p className="text-sm leading-relaxed text-[#ddd]">
                                   {MOCK_CHAIN[2].content}
                                </p>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <h4 className="text-[10px] font-bold text-[#444] uppercase mb-2">Delta (From Parent)</h4>
                                <div className="text-[11px] text-[#7FD88F] bg-[#7FD88F08] p-3 rounded-xl border border-[#7FD88F11]">
                                   Added cybernetic tail, ozone scent, metallic clink.
                                </div>
                             </div>
                             <div>
                                <h4 className="text-[10px] font-bold text-[#444] uppercase mb-2">Constraint Weight</h4>
                                <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden mt-2">
                                   <div className="h-full bg-[#AAA0FA] w-3/4" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="p-4 border-t border-[#222] flex items-center gap-2">
                       <Zap size={14} className="text-[#EEB180]" />
                       <span className="text-[10px] text-[#666]">Suggested Next Action: Evolve for Character Dialogue</span>
                    </div>
                 </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};

export default VariantsGallery;
