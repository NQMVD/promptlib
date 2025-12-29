import React from "react";
import PromptEditor from "./PromptEditor";
import { X, ArrowLeftRight } from "lucide-react";

const ComparisonView = ({ leftPrompt, rightPrompt, onClose }) => {
    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
                        <ArrowLeftRight size={16} className="text-[var(--text-secondary)]" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-[var(--text-primary)]">Comparison Mode</h2>
                        <p className="text-xs text-[var(--text-muted)]">Comparing versions side-by-side</p>
                    </div>
                </div>
                <button onClick={onClose} className="btn-ghost p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <X size={20} />
                </button>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane */}
                <div className="flex-1 border-r border-[var(--border-subtle)] flex flex-col min-w-0">
                    <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                        <span className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                            Revision {leftPrompt?.timestamp || "Original"}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-6 text-[var(--text-primary)] text-lg leading-relaxed whitespace-pre-wrap font-sans">
                            {leftPrompt?.content}
                        </div>
                    </div>
                </div>

                {/* Right Pane */}
                <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
                    <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                        <span className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                            Selected Version {rightPrompt?.timestamp}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-6 text-[var(--text-primary)] text-lg leading-relaxed whitespace-pre-wrap font-sans">
                            {rightPrompt?.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonView;
