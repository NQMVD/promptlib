import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Check, Copy, Trash2 } from "lucide-react";
import PromptEditor from "./PromptEditor";
import ComparisonView from "./ComparisonView";
import EvolutionSplitView from "./EvolutionSplitView";
import FloatingActionBar from "./FloatingActionBar";

const MainView = ({
    prompt,
    allPrompts,
    onUpdate,
    onDelete,
    onEvolve,
    onEnhance,
    onSelectPrompt,
    isProcessing
}) => {
    const [copiedId, setCopiedId] = useState(null);

    // -- Stack Navigation Logic --
    // We must call hooks unconditionally!
    const promptStack = useMemo(() => {
        if (!prompt) return [];

        // Find absolute root
        let current = prompt;
        while (current.parentId && allPrompts.find(p => p.id === current.parentId)) {
            const parent = allPrompts.find(p => p.id === current.parentId);
            if (parent) current = parent;
            else break;
        }
        const rootId = current.id;

        // Get all prompts that trace back to this root
        const stack = allPrompts.filter(p => {
            let trace = p;
            while (trace.parentId && trace.parentId !== rootId && allPrompts.find(x => x.id === trace.parentId)) {
                trace = allPrompts.find(x => x.id === trace.parentId);
            }
            return trace.id === rootId || p.id === rootId;
        });

        // Sort by date desc (newest on top)
        return stack.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [prompt ? prompt.id : null, allPrompts]); // Safe dependency

    const currentIndex = prompt ? promptStack.findIndex(p => p.id === prompt.id) : -1;

    const handleNext = () => {
        if (currentIndex < promptStack.length - 1) {
            onSelectPrompt(promptStack[currentIndex + 1].id);
        }
    };
    const handlePrev = () => {
        if (currentIndex > 0) {
            onSelectPrompt(promptStack[currentIndex - 1].id);
        }
    };

    const updateMode = (newMode) => {
        if (prompt) {
            const updated = { ...prompt, mode: newMode };
            onUpdate(prompt.id, prompt.content, newMode);
        }
    };


    if (!prompt) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)]">
                <div className="text-center opacity-50">
                    <p className="text-lg font-mono">Select a prompt to begin</p>
                </div>
            </div>
        );
    }

    // Render Content based on Mode
    const renderContent = () => {
        if (prompt.mode === "compare") {
            return <ComparisonView
                leftPrompt={prompt}
                allPrompts={allPrompts}
                onClose={() => updateMode("none")}
            />;
        }
        if (prompt.mode === "evolve") {
            return <EvolutionSplitView
                prompt={prompt}
                onUpdate={onUpdate}
                onEvolve={onEvolve}
                isProcessing={isProcessing}
            />;
        }

        // Default: Editor
        return (
            <div className="flex flex-col h-full items-center justify-center p-8 relative">
                <div className="w-full max-w-3xl h-full flex flex-col relative">
                    <PromptEditor
                        key={prompt.id}
                        content={prompt.content}
                        onChange={(val) => onUpdate(prompt.id, val)}
                        onSave={() => console.log("Saved")}
                    />
                </div>
            </div>
        );
    };

    return (
        <main className="flex-1 h-full relative flex flex-col overflow-hidden bg-[var(--bg-primary)]">

            {/* Navigation Arrows (Floating on Right) */}
            {promptStack.length > 1 && prompt.mode === 'none' && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex <= 0}
                        className="p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-lg hover:bg-[var(--bg-surface)] disabled:opacity-30 transition-all text-[var(--text-secondary)]"
                        title="Newer Version"
                    >
                        <ChevronUp size={20} />
                    </button>
                    <div className="text-[10px] font-mono text-center text-[var(--text-muted)] py-1 bg-[var(--bg-primary)]/80 backdrop-blur rounded-md">
                        {promptStack.length - currentIndex} / {promptStack.length}
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex >= promptStack.length - 1}
                        className="p-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-lg hover:bg-[var(--bg-surface)] disabled:opacity-30 transition-all text-[var(--text-secondary)]"
                        title="Older Version"
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>
            )}


            {/* Main Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
                {renderContent()}
            </div>

            {/* Floating Action Bar */}
            <div className="pointer-events-none absolute inset-0 z-50 flex items-end justify-center pb-8">
                <div className="pointer-events-auto">
                    <FloatingActionBar
                        mode={prompt.mode || "none"}
                        setMode={updateMode}
                        onDelete={() => onDelete(prompt.id)}
                        onEnhance={onEnhance}
                        isEnhancing={isProcessing}
                    />
                </div>
            </div>

        </main>
    );
};

export default MainView;
