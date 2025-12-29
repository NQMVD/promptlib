import React, { useState, useMemo, useEffect } from "react";
import { X, ArrowLeftRight, ChevronUp, ChevronDown, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ComparisonView = ({ leftPrompt: initialLeft, allPrompts, onClose }) => {
    // 1. Identify the Stack
    const stack = useMemo(() => {
        if (!initialLeft) return [];

        // Find absolute root
        let current = initialLeft;
        while (current.parentId && allPrompts.find(p => p.id === current.parentId)) {
            const parent = allPrompts.find(p => p.id === current.parentId);
            if (parent) current = parent;
            else break;
        }
        const rootId = current.id;

        const s = allPrompts.filter(p => {
            let trace = p;
            while (trace.parentId && trace.parentId !== rootId && allPrompts.find(x => x.id === trace.parentId)) {
                trace = allPrompts.find(x => x.id === trace.parentId);
            }
            return trace.id === rootId || p.id === rootId;
        });

        // Sort: Newest first
        return s.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [initialLeft, allPrompts]);

    const [leftId, setLeftId] = useState(initialLeft?.id);
    const [rightId, setRightId] = useState(null);

    // Default rightId to the second newest if available, or the same as left
    useEffect(() => {
        if (stack.length > 1 && !rightId) {
            const other = stack.find(p => p.id !== initialLeft.id);
            setRightId(other ? other.id : initialLeft.id);
        } else if (!rightId && stack.length > 0) {
            setRightId(stack[0].id);
        }
    }, [stack, initialLeft, rightId]);

    const leftPrompt = stack.find(p => p.id === leftId) || initialLeft;
    const rightPrompt = stack.find(p => p.id === rightId) || stack[0] || initialLeft;

    const VersionSelector = ({ selectedId, onSelect, side }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="relative z-20">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all min-w-[200px]"
                >
                    <div className="flex flex-col items-start mr-auto">
                        <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                            {side === 'left' ? 'Baseline' : 'Comparison'}
                        </span>
                        <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[160px]">
                            {stack.find(p => p.id === selectedId)?.timestamp || "Select Version"}
                        </span>
                    </div>
                    {isOpen ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full mt-2 w-64 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar"
                            style={{ [side === 'left' ? 'left' : 'right']: 0 }}
                        >
                            {stack.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        onSelect(p.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-surface)] transition-all ${selectedId === p.id ? "bg-[var(--bg-surface)]" : ""}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{p.timestamp}</span>
                                        {selectedId === p.id && <Check size={12} className="text-[var(--accent-primary)]" />}
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                                        {p.content}
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] relative z-30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
                        <ArrowLeftRight size={16} className="text-[var(--text-secondary)]" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-[var(--text-primary)]">Comparison Mode</h2>
                        <p className="text-xs text-[var(--text-muted)]">Select versions to compare</p>
                    </div>
                </div>
                <button onClick={onClose} className="btn-ghost p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <X size={20} />
                </button>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane */}
                <div className="flex-1 border-r border-[var(--border-subtle)] flex flex-col min-w-0 bg-[var(--bg-surface)]/30">
                    <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-primary)]/50 backdrop-blur-sm">
                        <VersionSelector selectedId={leftId} onSelect={setLeftId} side="left" />
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">
                            {leftPrompt?.content?.length || 0} chars
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 text-[var(--text-primary)] text-lg leading-relaxed whitespace-pre-wrap font-sans max-w-2xl mx-auto">
                            {leftPrompt?.content}
                        </div>
                    </div>
                </div>

                {/* Right Pane */}
                <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
                    <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-primary)]">
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">
                            {rightPrompt?.content?.length || 0} chars
                        </div>
                        <VersionSelector selectedId={rightId} onSelect={setRightId} side="right" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-8 text-[var(--text-primary)] text-lg leading-relaxed whitespace-pre-wrap font-sans max-w-2xl mx-auto">
                            {rightPrompt?.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonView;
