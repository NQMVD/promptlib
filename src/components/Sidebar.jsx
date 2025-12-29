import React, { useMemo, useState, useEffect } from "react";
import { Search, Plus, Sparkles, History, MoreVertical, Copy, Trash2, Edit3, CornerDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ prompts, selectedId, onSelect, onAdd, onSearch, searchQuery }) => {
    const [contextMenu, setContextMenu] = useState(null);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    // 1. Group prompts by lineage
    const groupedPrompts = useMemo(() => {
        if (!prompts || prompts.length === 0) return [];

        // Helper to find root ID
        const findRoot = (id, all) => {
            let current = all.find(p => p.id === id);
            const visited = new Set();
            while (current && current.parentId && !visited.has(current.id)) {
                visited.add(current.id);
                const parent = all.find(p => p.id === current.parentId);
                // If parent doesn't exist, current is effectively root relative to known universe
                if (!parent) break;
                current = parent;
            }
            return current ? current.id : id;
        };

        const groups = {};

        // Group prompts by their root
        prompts.forEach(p => {
            const rootId = findRoot(p.id, prompts);
            if (!groups[rootId]) {
                groups[rootId] = [];
            }
            groups[rootId].push(p);
        });

        // Filter out empty groups and sort stacks
        return Object.values(groups)
            .filter(stack => stack.length > 0)
            .map(stack => {
                // Sort variants in stack by date desc (newest first)
                return stack.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            })
            .sort((stackA, stackB) => {
                // Sort stacks by the newest item in them
                const latestA = stackA[0];
                const latestB = stackB[0];
                return new Date(latestB.timestamp) - new Date(latestA.timestamp);
            });
    }, [prompts]); // Re-compute when prompts change

    const handleContextMenu = (e, stack) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            stack
        });
    };

    return (
        <aside className="w-80 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col h-full flex-shrink-0 z-20 relative">
            <div className="p-4 border-b border-[var(--border-subtle)]">
                <button
                    onClick={onAdd}
                    className="w-full bg-[var(--accent-primary)] text-white h-10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[var(--accent-primary)]/90 transition-all shadow-lg shadow-[var(--accent-primary)]/20 mb-4"
                >
                    <Plus size={16} /> New Prompt
                </button>
                <div className="relative group">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-primary)] transition-colors"
                        size={14}
                    />
                    <input
                        type="text"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] h-9 pl-9 pr-4 rounded-lg text-sm border border-transparent focus:border-[var(--border-strong)] focus:outline-none transition-all placeholder-[var(--text-muted)]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6 pt-6 custom-scrollbar">
                {groupedPrompts.length === 0 ? (
                    <div className="text-center py-10 opacity-40">
                        <p className="text-xs font-mono uppercase">No prompts found</p>
                    </div>
                ) : (
                    groupedPrompts.map((stack) => {
                        const topPrompt = stack[0];
                        const isStackSelected = stack.some(p => p.id === selectedId);
                        const variantCount = stack.length;

                        return (
                            <div
                                key={topPrompt.id}
                                className="relative group perspective select-none mb-6"
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setContextMenu({
                                        x: rect.right - 10,  // Overlap slightly
                                        y: rect.top,
                                        stack
                                    });
                                }}
                            >
                                {/* Stack Depth Effect Layers (Visible & Upwards) */}
                                {variantCount > 1 && (
                                    <>
                                        <div
                                            className="absolute top-0 left-0 w-full h-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl z-0"
                                            style={{ transform: "translateY(-6px) scale(0.96)" }}
                                        />
                                        {variantCount > 2 && (
                                            <div
                                                className="absolute top-0 left-0 w-full h-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl z-[-1]"
                                                style={{ transform: "translateY(-12px) scale(0.92)" }}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Main Card */}
                                <div
                                    onClick={() => onSelect(topPrompt.id)}
                                    className={`relative z-10 w-full text-left p-4 rounded-xl border cursor-pointer transition-colors duration-200 ${isStackSelected
                                            ? "bg-[var(--bg-surface)] border-[var(--border-default)] shadow-lg"
                                            : "bg-[var(--bg-primary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2 pointer-events-none">
                                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wide">
                                            {topPrompt.timestamp.split(" ")[0]}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {topPrompt.mode === "evolved" || topPrompt.parentId ? (
                                                <div className={`p-1 rounded-md ${topPrompt.relationType === 'enhanced'
                                                        ? 'bg-[var(--accent-green-soft)] text-[var(--accent-green)]'
                                                        : 'bg-[var(--accent-purple-soft)] text-[var(--accent-purple)]'
                                                    }`}>
                                                    {topPrompt.relationType === 'enhanced' ? <Sparkles size={10} /> : <History size={10} />}
                                                </div>
                                            ) : null}

                                            {variantCount > 1 && (
                                                <span className="text-[9px] font-bold bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                                                    {variantCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-relaxed pointer-events-none">
                                        {topPrompt.content || <span className="italic opacity-50">Empty prompt</span>}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Context Menu Portal */}
            <AnimatePresence>
                {contextMenu && (
                    <div
                        className="fixed inset-0 z-50"
                        onClick={() => setContextMenu(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: -10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: -10 }}
                            transition={{ duration: 0.1 }}
                            className="fixed bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-2xl p-3 w-72 max-h-[60vh] overflow-y-auto flex flex-col gap-2 backdrop-blur-3xl"
                            style={{
                                top: Math.min(contextMenu.y, window.innerHeight - 300),
                                left: contextMenu.x
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-3 py-2 text-[10px] font-bold uppercase text-[var(--text-muted)] border-b border-[var(--border-subtle)] mb-1">
                                Version History
                            </div>
                            {contextMenu.stack.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        onSelect(p.id);
                                        setContextMenu(null);
                                    }}
                                    className={`text-left p-2 rounded-lg text-xs transition-colors group flex items-start gap-2 ${p.id === selectedId
                                        ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                                        : "hover:bg-[var(--bg-primary)] text-[var(--text-secondary)]"
                                        }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {p.mode === "evolved" || p.parentId ? (
                                            <div className={`${p.relationType === 'enhanced'
                                                ? 'text-[var(--accent-green)]'
                                                : 'text-[var(--accent-purple)]'
                                                }`}>
                                                {p.relationType === 'enhanced' ? <Sparkles size={12} /> : <History size={12} />}
                                            </div>
                                        ) : (
                                            <div className="w-3 h-3 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate font-medium">{p.content.substring(0, 40)}...</div>
                                        <div className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">{p.timestamp}</div>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </aside>
    );
};

export default Sidebar;
