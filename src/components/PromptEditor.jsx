import React from "react";
import { Copy, Check, Save } from "lucide-react";

const PromptEditor = ({ content, onChange, onSave, isEditing_DEPRECATED_PROP }) => {
    // We will make this always editable for simplicity in this new design, 
    // or auto-save. For now, let's keep it simple: It's a textarea.

    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group min-h-[200px] flex flex-col">
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all"
                    title="Copy to clipboard"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            <textarea
                className="p-6 w-full h-full min-h-[300px] bg-transparent resize-none focus:outline-none text-lg leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-muted)] font-sans"
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter your prompt here..."
                spellCheck={false}
            />

            {/* Optionally putting a save indicator or button if we want manual save */}
            <div className="px-6 pb-4 flex justify-end">
                <button onClick={onSave} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors">
                    <Save size={12} />
                    <span>Save changes</span>
                </button>
            </div>
        </div>
    );
};

export default PromptEditor;
