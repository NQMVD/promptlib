import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight, Brain, Sparkles, Plus, X } from "lucide-react";
import PromptEditor from "./PromptEditor";

const EvolutionSplitView = ({
    prompt,
    onUpdate,
    onEvolve,
    isProcessing
}) => {
    const [thought, setThought] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [prompt.thoughts]);

    const handleEvolve = () => {
        if (!thought.trim()) return;
        onEvolve(thought);
        setThought("");
    };

    return (
        <div className="flex h-full w-full bg-[var(--bg-primary)] overflow-hidden">

            {/* LEFT PANE: The Content */}
            <div className="flex-1 border-r border-[var(--border-subtle)] flex flex-col min-w-0 bg-[var(--bg-primary)]">
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-purple-soft)] flex items-center justify-center text-[var(--accent-purple)]">
                            <Brain size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-[var(--text-primary)]">Evolution Base</h2>
                            <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Current Version</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <PromptEditor
                        key={prompt.id}
                        content={prompt.content}
                        onChange={() => { }} // Read-only
                        onSave={() => { }}
                    />
                </div>
            </div>

            {/* RIGHT PANE: Thoughts & Evolution Control */}
            <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-secondary)]">
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-2 bg-[var(--bg-secondary)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                        <MessageSquare size={16} className="text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-[var(--text-primary)]">Evolution Log</h2>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Thoughts & Iterations</p>
                    </div>
                </div>

                {/* Thoughts List */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {(prompt.thoughts || []).length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                            <Brain size={48} className="mx-auto mb-4 stroke-1" />
                            <p className="text-sm font-medium">No thoughts logged yet.</p>
                            <p className="text-xs">Add your reasoning below to evolve this prompt.</p>
                        </div>
                    ) : (
                        prompt.thoughts.map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={item.id || idx}
                                className="flex gap-4"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-purple-soft)] border border-[var(--accent-purple)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent-purple)] font-mono shadow-[0_0_10px_rgba(166,108,255,0.2)]">
                                        {idx + 1}
                                    </div>
                                    <div className="w-px h-full bg-[var(--border-subtle)] mt-2" />
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-secondary)] leading-relaxed shadow-sm">
                                        {item.text}
                                    </div>
                                    <div className="text-[9px] font-mono text-[var(--text-muted)] mt-1 ml-1">
                                        {item.timestamp}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                    <div className="relative">
                        <textarea
                            value={thought}
                            onChange={(e) => setThought(e.target.value)}
                            placeholder="Describe how to evolve this prompt..."
                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:ring-1 focus:ring-[var(--accent-purple)]/50 focus:outline-none resize-none h-32 transition-all placeholder-[var(--text-muted)]"
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                {thought.length} chars
                            </span>
                            <button
                                onClick={handleEvolve}
                                disabled={!thought.trim() || isProcessing}
                                className="bg-[var(--accent-purple)] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[var(--accent-purple)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--accent-purple)]/20"
                            >
                                {isProcessing ? (
                                    <Sparkles size={14} className="animate-spin" />
                                ) : (
                                    <ArrowRight size={14} />
                                )}
                                Evolve
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EvolutionSplitView;
