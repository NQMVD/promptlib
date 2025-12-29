import React, { useState } from "react";
import { Sparkles, ArrowRight, Brain, Zap } from "lucide-react";

/**
 * EvolutionPanel
 * Handles the input for "Thoughts" or constraints and triggering the evolution/enhancement.
 */
const EvolutionPanel = ({ onEvolve, onEnhance, isProcessing }) => {
    const [mode, setMode] = useState("enhance"); // 'enhance' or 'evolve'
    const [thought, setThought] = useState("");

    const handleSubmit = () => {
        if (mode === "enhance") {
            onEnhance();
        } else {
            if (!thought.trim()) return;
            onEvolve(thought);
            setThought("");
        }
    };

    return (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => setMode("enhance")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${mode === "enhance"
                            ? "bg-[var(--accent-orange)] text-white shadow-lg shadow-orange-500/20"
                            : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                >
                    <Sparkles size={12} />
                    Enhance
                </button>
                <button
                    onClick={() => setMode("evolve")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${mode === "evolve"
                            ? "bg-[var(--accent-purple)] text-white shadow-lg shadow-purple-500/20"
                            : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                >
                    <Brain size={12} />
                    Evolve
                </button>
            </div>

            <div className="space-y-4">
                {mode === "enhance" ? (
                    <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dashed)] text-sm text-[var(--text-secondary)]">
                        <p className="flex items-center gap-2 mb-2">
                            <Zap size={14} className="text-[var(--accent-orange)]" />
                            <span>Standard Enhancement</span>
                        </p>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Automatically improves grammar, structure, and clarity while retaining the original intent.
                            Good for quick polish.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <textarea
                            value={thought}
                            onChange={(e) => setThought(e.target.value)}
                            placeholder="What should be changed? (e.g. 'Make it more professional' or 'Add constraints about JSON output')"
                            className="w-full p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-purple)] focus:ring-1 focus:ring-[var(--accent-purple)] outline-none text-sm min-h-[80px] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none"
                        />
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || (mode === "evolve" && !thought.trim())}
                        className={`btn-primary px-6 ${mode === "evolve" ? "bg-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/90" : ""
                            }`}
                    >
                        {isProcessing ? "Processing..." : (
                            <>
                                Run {mode === "enhance" ? "Enhancement" : "Evolution"}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvolutionPanel;
