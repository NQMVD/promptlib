import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Copy,
  Trash2,
  Check,
  Archive,
  Search,
  Sparkles,
  CopyPlus,
  Edit3,
  Save,
  X,
  Loader2,
  AlertCircle,
  Settings,
  Download,
  Upload,
} from "lucide-react";

const App = () => {
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isEnhancingId, setIsEnhancingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("openrouter_api_key") ||
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      "",
  );
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newPrompt]);

  useEffect(() => {
    if (editRef.current) {
      editRef.current.style.height = "auto";
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
    }
  }, [editContent]);

  useEffect(() => {
    const saved = localStorage.getItem("prompt_archive_data");
    if (saved) {
      try {
        setPrompts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved prompts");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("prompt_archive_data", JSON.stringify(prompts));
  }, [prompts]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem("openrouter_api_key", key);
  };

  const exportLibrary = () => {
    const data = JSON.stringify(prompts, null, 2);
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promptlib.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importLibrary = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPrompts = JSON.parse(e.target.result);
        if (Array.isArray(importedPrompts)) {
          // Merge or replace? User said "import back into the page and save them into the local browser storage too"
          // Usually better to prepend/merge to avoid deleting existing work, but replacing is simpler for "restore"
          // I'll merge them but filter duplicates if any (by id)
          setPrompts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newOnes = importedPrompts.filter(
              (p) => !existingIds.has(p.id),
            );
            return [...newOnes, ...prev];
          });
          alert("Prompts imported successfully!");
        } else {
          alert("Invalid file format.");
        }
      } catch (err) {
        console.error("Import failed", err);
        alert(
          "Failed to read the file. Make sure it is a valid promptlib.txt file.",
        );
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  const addPrompt = (content = newPrompt) => {
    if (!content.trim()) return;
    const promptObj = {
      id: Date.now() + Math.random(),
      content: content.trim(),
      timestamp: new Date().toLocaleString(),
    };
    setPrompts([promptObj, ...prompts]);
    setNewPrompt("");
  };

  const deletePrompt = (id) => {
    setPrompts(prompts.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
  };

  const duplicatePrompt = (prompt) => {
    const duplicated = {
      ...prompt,
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleString() + " (Copy)",
    };
    setPrompts([duplicated, ...prompts]);
  };

  const startEditing = (prompt) => {
    setEditingId(prompt.id);
    setEditContent(prompt.content);
  };

  const saveEdit = (id) => {
    setPrompts(
      prompts.map((p) => (p.id === id ? { ...p, content: editContent } : p)),
    );
    setEditingId(null);
  };

  const enhancePrompt = async (prompt) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    setIsEnhancingId(prompt.id);

    const systemPrompt =
      'Role: Expert Prompt Architect. Objective: Refine raw user prompts into high-performance instruction sets. Constraints: 1. Preserve Intent: Do not lose any information or context from the original prompt. 2. Concise Expansion: Add only details that clarify the task; avoid "information bloat" or filler. 3. Neutrality & No Premature Optimization: Do not make creative, technical, or stylistic decisions (like tone or format) unless explicitly requested. Leave these variables open for the final model. 4. Dynamic Scaling: Refine simple questions directly; provide a structured framework (Context, Task, Constraints) for complex projects. 5. Clarity: Use unambiguous, professional language. Process: Analyze the core task, clarify vague terms, and structure the output for readability. Output: Provide only the refined prompt. Do not provide a preamble or explanation.';

    let retries = 0;
    const maxRetries = 3;

    const callApi = async () => {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "https://promptlib.local",
              "X-Title": "Prompt Library",
            },
            body: JSON.stringify({
              model: "mistralai/devstral-2512:free",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Original Prompt: ${prompt.content}` },
              ],
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || "API Error");
        }

        const data = await response.json();
        const enhancedText = data.choices?.[0]?.message?.content;

        if (enhancedText) {
          addPrompt(enhancedText);
        }
      } catch (err) {
        console.error("Enhance failed:", err);
        if (retries < maxRetries) {
          const delay = Math.pow(2, retries) * 1000;
          retries++;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return callApi();
        }
        alert(`Failed to enhance prompt: ${err.message}`);
      } finally {
        setIsEnhancingId(null);
      }
    };

    await callApi();
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => {
        console.error("Copy failed", err);
      });
  };

  const filteredPrompts = prompts.filter((p) =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1d1d1] font-sans selection:bg-[#3d3d3d]">
      <header className="border-b border-[#222] bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#d97757] to-[#b95737] flex items-center justify-center">
              <Archive size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-medium tracking-tight text-[#f0f0f0]">
              Prompt Library
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={exportLibrary}
              className="p-2 rounded-lg text-[#666] hover:text-[#f0f0f0] hover:bg-[#161616] transition-colors"
              title="Export Library"
            >
              <Download size={18} />
            </button>
            <label
              className="p-2 rounded-lg text-[#666] hover:text-[#f0f0f0] hover:bg-[#161616] transition-colors cursor-pointer"
              title="Import Library"
            >
              <Upload size={18} />
              <input
                type="file"
                className="hidden"
                accept=".txt"
                onChange={importLibrary}
              />
            </label>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? "bg-[#222] text-[#f0f0f0]" : "text-[#666] hover:text-[#f0f0f0] hover:bg-[#161616]"}`}
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <div className="hidden sm:block text-xs text-[#666] font-mono uppercase tracking-widest">
              {prompts.length} Items
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 p-6 bg-[#111] border border-[#222] rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[#f0f0f0]">
                OpenRouter Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-[#555] hover:text-[#888]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#555] font-mono uppercase mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-or-..."
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-4 py-2 text-sm focus:border-[#444] outline-none transition-colors"
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                />
                <p className="mt-2 text-[10px] text-[#444]">
                  Your key is stored locally in your browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="mb-10 group">
          <div className="relative bg-[#161616] border border-[#262626] rounded-xl transition-all duration-300 focus-within:border-[#444]">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none focus:ring-0 p-4 min-h-[100px] max-h-[70vh] text-[15px] leading-relaxed placeholder-[#444] resize-none focus:outline-none overflow-y-auto"
              placeholder="Paste or type a prompt here..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) addPrompt();
              }}
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#262626]">
              <span className="text-[11px] text-[#555] font-mono">
                CMD + ENTER TO SAVE
              </span>
              <button
                onClick={() => addPrompt()}
                disabled={!newPrompt.trim()}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#f0f0f0] text-[#0a0a0a] rounded-lg text-sm font-medium hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Plus size={16} /> Save
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        {prompts.length > 0 && (
          <div className="relative mb-8">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search library..."
              className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#444] focus:ring-0 transition-colors focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* List Section */}
        <div className="space-y-4">
          {filteredPrompts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-[#222] rounded-2xl">
              <p className="text-[#555] text-sm italic">
                {searchQuery ? "No results found." : "Your archive is empty."}
              </p>
            </div>
          ) : (
            filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`group relative bg-[#111] border rounded-xl transition-all duration-200 overflow-hidden ${
                  editingId === prompt.id
                    ? "border-[#444] bg-[#1a1a1a]"
                    : "border-[#222] hover:border-[#333]"
                }`}
              >
                {/* Delete Confirmation Overlay */}
                {confirmDeleteId === prompt.id && (
                  <div className="absolute inset-0 z-20 bg-[#111]/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                    <AlertCircle className="text-red-500 mb-2" size={24} />
                    <p className="text-sm font-medium text-[#f0f0f0] mb-4">
                      Delete this prompt forever?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium border border-[#333] hover:bg-[#222] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deletePrompt(prompt.id)}
                        className="px-4 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-500 transition-colors"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-5 pb-14 md:pb-5 md:pr-14">
                  {editingId === prompt.id ? (
                    <div className="space-y-3">
                      <textarea
                        ref={editRef}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-[14.5px] text-[#ddd] focus:border-[#555] focus:ring-0 resize-none min-h-[120px] max-h-[60vh] focus:outline-none overflow-y-auto"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-[#888] hover:text-[#f0f0f0] transition-colors"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => saveEdit(prompt.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-[#f0f0f0] text-[#0a0a0a] rounded-md text-xs font-medium"
                        >
                          <Save size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[14.5px] leading-relaxed text-[#bbb] whitespace-pre-wrap break-words">
                        {prompt.content}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-[10px] font-mono text-[#444]">
                        <span className="uppercase tracking-tighter">
                          {prompt.timestamp}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Horizontal Action Bar */}
                {editingId !== prompt.id && !confirmDeleteId && (
                  <div className="absolute bottom-3 right-4 flex flex-row items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#111]/80 backdrop-blur-sm pl-2 py-1 rounded-lg">
                    <button
                      onClick={() => copyToClipboard(prompt.content, prompt.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedId === prompt.id
                          ? "bg-green-900/20 text-green-400"
                          : "bg-transparent text-[#888] hover:text-[#f0f0f0] hover:bg-[#222]"
                      }`}
                      title="Copy"
                    >
                      {copiedId === prompt.id ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => startEditing(prompt)}
                      className="p-2 bg-transparent text-[#888] hover:text-[#f0f0f0] hover:bg-[#222] rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() => enhancePrompt(prompt)}
                      disabled={isEnhancingId === prompt.id}
                      className="p-2 bg-transparent text-[#888] hover:text-purple-400 hover:bg-purple-900/10 rounded-lg transition-colors disabled:opacity-50"
                      title="AI Enhance"
                    >
                      {isEnhancingId === prompt.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => duplicatePrompt(prompt)}
                      className="p-2 bg-transparent text-[#888] hover:text-blue-400 hover:bg-blue-900/10 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <CopyPlus size={16} />
                    </button>

                    <button
                      onClick={() => setConfirmDeleteId(prompt.id)}
                      className="p-2 bg-transparent text-[#888] hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-12 text-center opacity-20">
        <div className="inline-block w-1 h-1 bg-white rounded-full mx-1"></div>
        <div className="inline-block w-1 h-1 bg-white rounded-full mx-1"></div>
        <div className="inline-block w-1 h-1 bg-white rounded-full mx-1"></div>
      </footer>
    </div>
  );
};

export default App;
