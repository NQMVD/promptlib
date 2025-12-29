import React from "react";
import { Plus, Search, Archive, ChevronRight } from "lucide-react";

/**
 * Sidebar Component
 * Displays a list of prompt lineages (grouping variants).
 */
const Sidebar = ({ prompts, selectedId, onSelect, onAdd, onSearch, searchQuery }) => {
    // Group prompts by "lineage" or concept. 
    // For now, we will just list all prompts but we could group them by parentId in the future if needed.
    // The plan mentioned showing "Basic" list items.

    // We want to show only "root" or distinct ideas, but the current data model makes everything a prompt.
    // We'll filter to show only prompts that are either roots (no parent) OR
    // if we want a flat list, we can just show them all. 
    // Given the "clean list" requirement, let's try to group them conceptually if possible, 
    // or just show the latest modified ones.

    // Simple approach first: Show all, but styled nicely.

    return (
        <div className="w-80 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-orange)] to-[#CE9160] flex items-center justify-center shadow-lg">
                        <Archive size={16} className="text-white" />
                    </div>
                    <h1 className="font-semibold text-[var(--text-primary)] tracking-tight">Prompt Library</h1>
                </div>

                <button
                    onClick={onAdd}
                    className="btn-primary w-full justify-center"
                >
                    <Plus size={16} />
                    New Prompt
                </button>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                    <input
                        type="text"
                        placeholder="Search prompts..."
                        className="input-base w-full pl-9 py-2 text-sm"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {prompts.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <p className="text-xs text-[var(--text-muted)]">No prompts found.</p>
                    </div>
                ) : (
                    prompts.map((prompt) => (
                        <button
                            key={prompt.id}
                            onClick={() => onSelect(prompt.id)}
                            className={`w-full text-left p-3 rounded-lg transition-all group relative border ${selectedId === prompt.id
                                    ? "bg-[var(--bg-surface)] border-[var(--border-strong)] shadow-xs"
                                    : "border-transparent hover:bg-[var(--bg-surface)] hover:border-[var(--border-subtle)]"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium line-clamp-2 ${selectedId === prompt.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                                    }`}>
                                    {prompt.content || "Untitled Prompt"}
                                </p>
                                {selectedId === prompt.id && (
                                    <ChevronRight size={14} className="text-[var(--accent-primary)] shrink-0 mt-1" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-[var(--text-muted)] font-mono">{prompt.timestamp}</span>
                                {prompt.mode !== "none" && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] uppercase tracking-wider">
                                        {prompt.mode}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Footer / User Info could go here */}
            <div className="p-3 border-t border-[var(--border-subtle)] text-center">
                <p className="text-[10px] text-[var(--text-muted)]">v2.0 Refactor</p>
            </div>
        </div>
    );
};

export default Sidebar;
