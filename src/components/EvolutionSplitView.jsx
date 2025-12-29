import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight, Brain, Sparkles, Plus, X, Play } from "lucide-react";
import PromptEditor from "./PromptEditor";

const EvolutionSplitView = ({
    prompt,
    onUpdate,
    onEvolve,
    isProcessing
}) => {
    // Local state for the CURRENT note being typed
    const [currentNote, setCurrentNote] = useState("");
    // Local state for the LIST of notes added
    const [notes, setNotes] = useState([]);

    const scrollRef = useRef(null);
    const textAreaRef = useRef(null);

    // Auto-scroll when notes change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [notes]);

    const handleAddNote = () => {
        if (!currentNote.trim()) return;

        const newNote = {
            id: Date.now(),
            text: currentNote,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setNotes([...notes, newNote]);
        setCurrentNote("");

        // Refocus for rapid entry
        if (textAreaRef.current) textAreaRef.current.focus();
    };

    const handleExecuteEvolution = () => {
        if (notes.length === 0 && !currentNote.trim()) return;

        // If there's text in the input but not added to list, include it
        const finalNotes = [...notes];
        if (currentNote.trim()) {
            finalNotes.push({
                id: Date.now(),
                text: currentNote,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }

        onEvolve(finalNotes);
        setNotes([]);
        setCurrentNote("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleAddNote();
        }
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
            <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-secondary)] relative">
                <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                            <MessageSquare size={16} className="text-[var(--text-tertiary)]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-[var(--text-primary)]">Evolution Log</h2>
                            <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Thoughts & Iterations</p>
                        </div>
                    </div>

                    {/* Main Action Button in Header */}
                    <button
                        onClick={handleExecuteEvolution}
                        disabled={(notes.length === 0 && !currentNote.trim()) || isProcessing}
                        className="bg-[var(--accent-purple)] text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[var(--accent-purple)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--accent-purple)]/20"
                    >
                        {isProcessing ? (
                            <Sparkles size={14} className="animate-spin" />
                        ) : (
                            <Play size={14} fill="currentColor" />
                        )}
                        Run Evolution
                    </button>
                </div>

                {/* Thoughts List */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {notes.length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                            <Brain size={48} className="mx-auto mb-4 stroke-1" />
                            <p className="text-sm font-medium">No notes added.</p>
                            <p className="text-xs">Add notes below to guide the evolution.</p>
                        </div>
                    ) : (
                        notes.map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={item.id}
                                className="flex gap-3 group"
                            >
                                <div className="flex flex-col items-center mt-1">
                                    <div className="w-5 h-5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[9px] font-bold text-[var(--text-muted)] font-mono">
                                        {idx + 1}
                                    </div>
                                    <div className="w-px h-full bg-[var(--border-subtle)] mt-1 group-last:hidden" />
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="relative bg-[var(--bg-primary)] border border-dashed border-[var(--border-default)] rounded-xl p-3 text-sm text-[var(--text-secondary)] leading-relaxed hover:border-[var(--accent-purple)]/30 transition-colors">
                                        {item.text}
                                        <button
                                            onClick={() => setNotes(notes.filter(n => n.id !== item.id))}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-all"
                                        >
                                            <X size={12} />
                                        </button>
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
                            ref={textAreaRef}
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a note (Cmd+Enter to add)..."
                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3 pr-12 text-sm text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:ring-1 focus:ring-[var(--accent-purple)]/50 focus:outline-none resize-none h-24 transition-all placeholder-[var(--text-muted)]"
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={!currentNote.trim()}
                            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-purple)] hover:border-[var(--accent-purple)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Add Note (Cmd+Enter)"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EvolutionSplitView;
