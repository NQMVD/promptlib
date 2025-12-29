import React from "react";
import { Sparkles, Brain, ArrowLeftRight, Trash2, X } from "lucide-react";

const FloatingActionBar = ({
    mode,
    setMode,
    onDelete,
    onEnhance,
    isEnhancing
}) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-subtle)] rounded-full shadow-2xl p-1.5 flex items-center gap-1.5 ring-1 ring-white/5 mx-auto">

                {/* Enhance Button */}
                <button
                    onClick={onEnhance}
                    disabled={isEnhancing}
                    className="group relative px-4 py-2.5 rounded-full flex items-center gap-2 transition-all hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-green)]"
                    title="AI Enhance"
                >
                    {isEnhancing ? (
                        <Sparkles size={18} className="animate-spin text-[var(--accent-green)]" />
                    ) : (
                        <Sparkles size={18} className="transition-transform group-hover:scale-110" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider hidden md:inline-block">Enhance</span>
                </button>

                <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

                {/* Evolve Toggle */}
                <button
                    onClick={() => setMode(mode === "evolve" ? "none" : "evolve")}
                    className={`px-4 py-2.5 rounded-full flex items-center gap-2 transition-all ${mode === "evolve"
                            ? "bg-[var(--accent-purple)] text-white shadow-lg shadow-[var(--accent-purple)]/25"
                            : "hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-purple)]"
                        }`}
                    title="Evolve Mode"
                >
                    <Brain size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider hidden md:inline-block">Evolve</span>
                    {mode === "evolve" && <X size={14} className="ml-1 opacity-50" />}
                </button>

                {/* Compare Toggle */}
                <button
                    onClick={() => setMode(mode === "compare" ? "none" : "compare")}
                    className={`px-4 py-2.5 rounded-full flex items-center gap-2 transition-all ${mode === "compare"
                            ? "bg-[var(--accent-orange)] text-white shadow-lg shadow-[var(--accent-orange)]/25"
                            : "hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-orange)]"
                        }`}
                    title="Compare Mode"
                >
                    <ArrowLeftRight size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider hidden md:inline-block">Compare</span>
                    {mode === "compare" && <X size={14} className="ml-1 opacity-50" />}
                </button>

                <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="px-4 py-2.5 rounded-full flex items-center gap-2 transition-all hover:bg-[rgba(255,82,82,0.1)] text-[var(--text-secondary)] hover:text-[#FF5252]"
                    title="Delete Prompt"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default FloatingActionBar;
