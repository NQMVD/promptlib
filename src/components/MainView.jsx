import React, { useState } from "react";
import PromptEditor from "./PromptEditor";
import EvolutionPanel from "./EvolutionPanel";
import ComparisonView from "./ComparisonView";
import { Trash2, Copy, History, GitCompare } from "lucide-react";

/**
 * MainView
 * The container for the detail/editing area. 
 * Manages the "Active" prompt and switching between Edit/Compare modes.
 */
const MainView = ({
    prompt,
    allPrompts,
    onUpdate,
    onDelete,
    onEvolve,
    onEnhance,
    isProcessing
}) => {
    const [comparisonTargetId, setComparisonTargetId] = useState(null);

    if (!prompt) {
        return (
            <div className="flex-1 bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)]">
                <div className="text-center">
                    <p>Select a prompt to view details</p>
                </div>
            </div>
        );
    }

    // Get other versions (mock logic or real logic depending on data structure)
    // Assuming 'allPrompts' contains everything and we can find related ones if we had lineage data.
    // For now, let's just show *all* prompts in the history dropdown for comparison for simplicity, 
    // or filtered if we had grouping.

    // Actually, we need to respect the request "remove lineage visualization" but we still need 
    // to be able to "compare variants". So we need a simple list of "Related" or "History".
    // Let's assume for this refactor that we just list other prompts as potential comparison targets.
    const otherPrompts = allPrompts.filter(p => p.id !== prompt.id);

    if (comparisonTargetId) {
        const target = allPrompts.find(p => p.id === comparisonTargetId);
        return (
            <ComparisonView
                leftPrompt={target}
                rightPrompt={prompt}
                onClose={() => setComparisonTargetId(null)}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-[var(--bg-primary)] overflow-hidden">

            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-primary)]">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[var(--text-muted)]">ID: {prompt.id.toString().slice(-6)}</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">{prompt.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">

                    {/* Compare Button - Popover or simple toggle for now */}
                    <div className="relative group">
                        <button className="btn-ghost p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" title="Compare">
                            <GitCompare size={18} />
                        </button>
                        {/* Simple dropdown on hover for prototype */}
                        <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
                            <div className="px-3 py-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)] mb-1">
                                Compare with...
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {otherPrompts.length === 0 && <div className="p-3 text-xs text-[var(--text-muted)]">No other prompts</div>}
                                {otherPrompts.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setComparisonTargetId(p.id)}
                                        className="w-full text-left px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] rounded-lg truncate"
                                    >
                                        {p.content.slice(0, 40)}...
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onDelete(prompt.id)}
                        className="btn-ghost p-2 text-red-400 hover:text-red-300 hover:bg-red-900/10" title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto w-full">
                    <PromptEditor
                        content={prompt.content}
                        onChange={(newContent) => onUpdate(prompt.id, newContent)}
                        onSave={() => { }} // Auto-save usually, or distinct save
                    />
                </div>
            </div>

            {/* Evolution/Enhancement Panel - Sticky Bottom */}
            <div className="shrink-0 z-20">
                <EvolutionPanel
                    onEvolve={onEvolve}
                    onEnhance={onEnhance}
                    isProcessing={isProcessing}
                />
            </div>
        </div>
    );
};

export default MainView;
