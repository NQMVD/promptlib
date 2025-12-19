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
  BarChart2,
  History,
  Star,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Brain,
  Zap,
  Layout,
  Layers,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const App = () => {
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isEnhancingId, setIsEnhancingId] = useState(null);
  const [isEvolvingId, setIsEvolvingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("openrouter_api_key") ||
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      "",
  );
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);
  const editRef = useRef(null);

  // Escape key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selectedPromptId) {
          // Check if any input/textarea is focused
          if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
            document.activeElement.blur();
          } else {
            setSelectedPromptId(null);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPromptId]);

  // Auto-resize textareas
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

  // Persistence
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
        alert("Failed to read the file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const addPrompt = (content = newPrompt) => {
    if (!content.trim()) return;
    const promptObj = {
      id: Date.now() + Math.random(),
      content: content.trim(),
      timestamp: new Date().toLocaleString(),
      mode: "none", // none, compare, iterate
      models: [], // [{ id, name, rating, note, timestamp }]
      thoughts: [], // [{ id, text, timestamp }]
    };
    setPrompts([promptObj, ...prompts]);
    setNewPrompt("");
  };

  const deletePrompt = (id) => {
    setPrompts(prompts.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    if (selectedPromptId === id) setSelectedPromptId(null);
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

  const updatePromptMode = (id, mode) => {
    setPrompts(prompts.map((p) => (p.id === id ? { ...p, mode } : p)));
  };

  const addModelResult = (id, modelData) => {
    setPrompts(
      prompts.map((p) =>
        p.id === id
          ? {
              ...p,
              models: [
                ...p.models,
                {
                  ...modelData,
                  id: Date.now() + Math.random(),
                  timestamp: new Date().toLocaleString(),
                },
              ],
            }
          : p,
      ),
    );
  };

  const removeModelResult = (promptId, modelId) => {
    setPrompts(
      prompts.map((p) =>
        p.id === promptId
          ? {
              ...p,
              models: p.models.filter((m) => m.id !== modelId),
            }
          : p,
      ),
    );
  };

  const addIterationThought = (id, text) => {
    if (!text.trim()) return;
    setPrompts(
      prompts.map((p) =>
        p.id === id
          ? {
              ...p,
              thoughts: [
                ...p.thoughts,
                {
                  id: Date.now(),
                  text,
                  timestamp: new Date().toLocaleString(),
                },
              ],
            }
          : p,
      ),
    );
  };

  const enhancePrompt = async (prompt) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    setIsEnhancingId(prompt.id);

    const systemPrompt =
      "Role: Expert Prompt Architect. Objective: Refine raw user prompts into high-performance instruction sets. Output: Provide only the refined prompt. Do not provide a preamble or explanation.";

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

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      const enhancedText = data.choices?.[0]?.message?.content;
      if (enhancedText) addPrompt(enhancedText);
    } catch (err) {
      console.error("Enhance failed:", err);
      alert("Failed to enhance prompt.");
    } finally {
      setIsEnhancingId(null);
    }
  };

  const evolvePrompt = async (prompt) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    setIsEvolvingId(prompt.id);

    const thoughtsList = prompt.thoughts.map((t) => `- ${t.text}`).join("\n");
    const systemPrompt =
      "You are an expert prompt engineer. Your task is to take a base prompt and evolve it based on the provided user thoughts, corrections, and feedback. Integrate all the feedback into a single, highly optimized new version of the prompt. Return ONLY the new prompt text.";

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
              {
                role: "user",
                content: `Base Prompt: ${prompt.content}\n\nUser Feedback/Thoughts:\n${thoughtsList}`,
              },
            ],
          }),
        },
      );

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      const evolvedText = data.choices?.[0]?.message?.content;
      if (evolvedText) {
        addPrompt(evolvedText);
        alert("New evolved prompt created!");
      }
    } catch (err) {
      console.error("Evolve failed:", err);
      alert("Failed to evolve prompt.");
    } finally {
      setIsEvolvingId(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
  const filteredPrompts = prompts.filter((p) =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d1d1d1] font-sans selection:bg-[#3d3d3d]">
      <header className="border-b border-[#222] bg-[#0d0d0d]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#d97757] to-[#b95737] flex items-center justify-center shadow-lg shadow-orange-500/10">
              <Archive size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-medium tracking-tight text-[#f0f0f0]">
              Prompt Library
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={exportLibrary}
              className="p-2 rounded-lg text-[#666] hover:text-[#f0f0f0] hover:bg-[#161616] transition-all"
              title="Export Library"
            >
              <Download size={18} />
            </button>
            <label
              className="p-2 rounded-lg text-[#666] hover:text-[#f0f0f0] hover:bg-[#161616] transition-all cursor-pointer"
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
              className={`p-2 rounded-lg transition-all ${showSettings ? "bg-[#222] text-[#f0f0f0]" : "text-[#666] hover:text-[#f0f0f0] hover:bg-[#161616]"}`}
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <div className="hidden sm:block text-xs text-[#666] font-mono uppercase tracking-widest bg-[#161616] px-3 py-1.5 rounded-full border border-[#222]">
              {prompts.length} Items
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 bg-[#111] border border-[#222] rounded-xl">
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="mb-10 group">
          <div className="relative bg-[#161616] border border-[#262626] rounded-xl transition-all duration-300 focus-within:border-[#444] shadow-xl">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-none focus:ring-0 p-5 min-h-[120px] max-h-[70vh] text-[15px] leading-relaxed placeholder-[#444] resize-none focus:outline-none overflow-y-auto scrollbar-hide"
              placeholder="Paste or type a prompt here..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) addPrompt();
              }}
            />
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#262626] bg-[#1a1a1a]/50">
              <span className="text-[10px] text-[#555] font-mono tracking-widest">
                CMD + ENTER TO SAVE
              </span>
              <button
                onClick={() => addPrompt()}
                disabled={!newPrompt.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-[#f0f0f0] text-[#0a0a0a] rounded-lg text-sm font-medium hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
              >
                <Plus size={16} /> Save Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        {prompts.length > 0 && (
          <div className="relative mb-8">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search library..."
              className="w-full bg-[#111] border border-[#222] rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#444] focus:ring-0 transition-all focus:outline-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* List Section */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPrompts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-[#222] rounded-3xl bg-[#0d0d0d]">
              <div className="w-12 h-12 rounded-full bg-[#161616] flex items-center justify-center mx-auto mb-4 border border-[#222]">
                <Archive size={20} className="text-[#333]" />
              </div>
              <p className="text-[#555] text-sm italic font-medium">
                {searchQuery
                  ? "No results found for your search."
                  : "Your archive is empty. Start by saving a prompt."}
              </p>
            </div>
          ) : (
            filteredPrompts.map((prompt) => (
              <motion.div
                layout
                key={prompt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative bg-[#111] border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden shadow-md hover:shadow-xl ${
                  editingId === prompt.id
                    ? "border-[#444] bg-[#1a1a1a]"
                    : "border-[#222] hover:border-[#333]"
                }`}
                onClick={() => {
                  if (editingId !== prompt.id) setSelectedPromptId(prompt.id);
                }}
              >
                {/* Delete Confirmation Overlay */}
                <AnimatePresence>
                  {confirmDeleteId === prompt.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-[#0a0a0a]/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AlertCircle className="text-red-500 mb-3" size={28} />
                      <p className="text-sm font-medium text-[#f0f0f0] mb-5">
                        Delete this prompt forever?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-6 py-2 rounded-xl text-xs font-medium border border-[#333] hover:bg-[#222] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deletePrompt(prompt.id)}
                          className="px-6 py-2 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      {prompt.mode === "compare" && (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                          <BarChart2 size={10} /> Compare
                        </span>
                      )}
                      {prompt.mode === "iterate" && (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                          <History size={10} /> Iterate
                        </span>
                      )}
                    </div>
                  </div>

                  {editingId === prompt.id ? (
                    <div
                      className="space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <textarea
                        ref={editRef}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-[14.5px] text-[#ddd] focus:border-[#555] focus:ring-0 resize-none min-h-[140px] max-h-[60vh] focus:outline-none overflow-y-auto"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-[#888] hover:text-[#f0f0f0] transition-colors"
                        >
                          <X size={20} />
                        </button>
                        <button
                          onClick={() => saveEdit(prompt.id)}
                          className="flex items-center gap-2 px-4 py-1.5 bg-[#f0f0f0] text-[#0a0a0a] rounded-lg text-xs font-bold shadow-md"
                        >
                          <Save size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[15px] leading-relaxed text-[#bbb] whitespace-pre-wrap break-words line-clamp-4 group-hover:text-[#ddd] transition-colors">
                      {prompt.content}
                    </p>
                  )}

                  {/* Indicators for stats */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#222]/50 pt-4">
                    <div className="flex items-center gap-4">
                      {prompt.mode === "compare" && prompt.models.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#666]">
                          <Zap size={12} className="text-blue-500" />
                          {prompt.models.length} Models
                        </div>
                      )}
                      {prompt.mode === "iterate" &&
                        prompt.thoughts.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#666]">
                            <Brain size={12} className="text-purple-500" />
                            {prompt.thoughts.length} Thoughts
                          </div>
                        )}
                    </div>
                    <div className="text-[10px] font-mono text-[#444] uppercase tracking-tighter">
                      {prompt.timestamp}
                    </div>
                  </div>
                </div>

                {/* Horizontal Action Bar */}
                {editingId !== prompt.id && !confirmDeleteId && (
                  <div
                    className="absolute bottom-4 right-4 flex flex-row items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-[#1a1a1a] border border-[#333] p-1 rounded-xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => copyToClipboard(prompt.content, prompt.id)}
                      className={`p-2.5 rounded-lg transition-all ${
                        copiedId === prompt.id
                          ? "text-green-400 bg-green-400/10"
                          : "text-[#888] hover:text-[#f0f0f0] hover:bg-[#262626]"
                      }`}
                      title="Copy"
                    >
                      {copiedId === prompt.id ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => startEditing(prompt)}
                      className="p-2.5 text-[#888] hover:text-[#f0f0f0] hover:bg-[#262626] rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => enhancePrompt(prompt)}
                      disabled={isEnhancingId === prompt.id}
                      className="p-2.5 text-[#888] hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-all disabled:opacity-50"
                      title="AI Enhance"
                    >
                      {isEnhancingId === prompt.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => duplicatePrompt(prompt)}
                      className="p-2.5 text-[#888] hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                      title="Duplicate"
                    >
                      <CopyPlus size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(prompt.id)}
                      className="p-2.5 text-[#888] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* OVERHAUL MODAL */}
      <AnimatePresence>
        {selectedPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setSelectedPromptId(null)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#111] border border-[#222] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#161616]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center">
                    <Archive size={16} className="text-[#888]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#f0f0f0]">
                      Prompt Detail
                    </h3>
                    <p className="text-[10px] text-[#555] font-mono">
                      {selectedPrompt.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-[#0a0a0a] rounded-xl p-1 border border-[#222] mr-4">
                    <button
                      onClick={() =>
                        updatePromptMode(selectedPrompt.id, "none")
                      }
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${selectedPrompt.mode === "none" ? "bg-[#222] text-white" : "text-[#555] hover:text-[#888]"}`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() =>
                        updatePromptMode(selectedPrompt.id, "compare")
                      }
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${selectedPrompt.mode === "compare" ? "bg-blue-500/20 text-blue-400" : "text-[#555] hover:text-blue-400/50"}`}
                    >
                      <BarChart2 size={12} /> Compare
                    </button>
                    <button
                      onClick={() =>
                        updatePromptMode(selectedPrompt.id, "iterate")
                      }
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${selectedPrompt.mode === "iterate" ? "bg-purple-500/20 text-purple-400" : "text-[#555] hover:text-purple-400/50"}`}
                    >
                      <History size={12} /> Iterate
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedPromptId(null)}
                    className="p-2 rounded-xl text-[#555] hover:text-[#f0f0f0] hover:bg-[#222] transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Base Prompt Display */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-[#444]" />
                    <span className="text-[11px] font-bold text-[#444] uppercase tracking-widest">
                      Base Prompt
                    </span>
                  </div>
                  <div className="bg-[#0d0d0d] border border-[#222] rounded-2xl p-6 relative group">
                    <p className="text-[16px] leading-relaxed text-[#ddd] whitespace-pre-wrap">
                      {selectedPrompt.content}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selectedPrompt.content,
                          selectedPrompt.id,
                        )
                      }
                      className="absolute top-4 right-4 p-2 rounded-lg bg-[#161616] border border-[#222] text-[#555] hover:text-[#f0f0f0] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      {copiedId === selectedPrompt.id ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* MODE DEPENDENT CONTENT */}
                {selectedPrompt.mode === "compare" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-blue-500" />
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                          Model Benchmarks
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPrompt.models.map((m) => (
                        <div
                          key={m.id}
                          className="group/item bg-[#161616] border border-[#222] rounded-2xl p-5 shadow-sm relative"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-[#f0f0f0] flex items-center gap-2">
                              <Zap size={14} className="text-blue-400" />{" "}
                              {m.name}
                            </h4>
                            <div className="flex items-center gap-3">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={12}
                                    className={
                                      s <= m.rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-[#333]"
                                    }
                                  />
                                ))}
                              </div>
                              <button
                                onClick={() => removeModelResult(selectedPrompt.id, m.id)}
                                className="opacity-0 group-hover/item:opacity-100 p-1 text-[#444] hover:text-red-500 transition-all"
                                title="Remove benchmark"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-[#888] leading-relaxed italic">
                            "{m.note}"
                          </p>
                          <div className="mt-4 text-[9px] font-mono text-[#333] uppercase">
                            {m.timestamp}
                          </div>
                        </div>
                      ))}


                      {/* Add Model Form */}
                      <AddModelForm
                        onAdd={(data) =>
                          addModelResult(selectedPrompt.id, data)
                        }
                      />
                    </div>
                  </div>
                )}

                {selectedPrompt.mode === "iterate" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain size={14} className="text-purple-500" />
                        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">
                          Evolution Log
                        </span>
                      </div>
                      <button
                        onClick={() => evolvePrompt(selectedPrompt)}
                        disabled={
                          selectedPrompt.thoughts.length === 0 ||
                          isEvolvingId === selectedPrompt.id
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-all disabled:opacity-30 shadow-lg shadow-purple-900/20"
                      >
                        {isEvolvingId === selectedPrompt.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        Evolve New Version
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedPrompt.thoughts.map((t, idx) => (
                        <div key={t.id} className="flex gap-4">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-400 flex-shrink-0">
                              {idx + 1}
                            </div>
                            {idx !== selectedPrompt.thoughts.length - 1 && (
                              <div className="w-px h-full bg-[#222] my-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="bg-[#161616] border border-[#222] rounded-2xl p-4">
                              <p className="text-sm text-[#ddd] leading-relaxed">
                                {t.text}
                              </p>
                              <div className="mt-2 text-[9px] font-mono text-[#333] uppercase">
                                {t.timestamp}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <AddThoughtForm
                        onAdd={(text) =>
                          addIterationThought(selectedPrompt.id, text)
                        }
                      />
                    </div>
                  </div>
                )}

                {selectedPrompt.mode === "none" && (
                  <div className="py-20 text-center opacity-30">
                    <Layout size={40} className="mx-auto mb-4" />
                    <p className="text-sm">
                      Select a mode at the top to track benchmarks or
                      iterations.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="max-w-4xl mx-auto px-6 py-12 text-center opacity-20">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase">
          Built for Power Users
        </p>
      </footer>
    </div>
  );
};

// Sub-components for better organization
const AddModelForm = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = () => {
    if (!name || !rating) return;
    onAdd({ name, rating, note });
    setName("");
    setRating(0);
    setNote("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="h-full min-h-[140px] flex flex-col items-center justify-center gap-2 border border-dashed border-[#222] rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-[#444] hover:text-blue-400"
      >
        <Plus size={24} />
        <span className="text-xs font-bold uppercase tracking-widest">
          Add Benchmark
        </span>
      </button>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-blue-500/30 rounded-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
      <input
        autoFocus
        placeholder="Model Name (e.g. Claude 3.5)"
        className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2 text-xs focus:border-blue-500 outline-none transition-all"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) handleSubmit();
        }}
      />
      <div className="flex items-center gap-3 px-1">
        <span className="text-[10px] text-[#555] uppercase font-bold">
          Rating
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={16}
              className={`cursor-pointer transition-all hover:scale-125 ${s <= rating ? "text-yellow-500 fill-yellow-500" : "text-[#333]"}`}
              onClick={() => setRating(s)}
            />
          ))}
        </div>
      </div>
      <textarea
        placeholder="Short experience note..."
        className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2 text-xs h-20 resize-none focus:border-blue-500 outline-none transition-all"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) handleSubmit();
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => setIsAdding(false)}
          className="flex-1 py-2 text-[10px] font-bold text-[#555] hover:text-[#888] uppercase"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-blue-900/20"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const AddThoughtForm = ({ onAdd }) => {
  const [text, setText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = () => {
    if (!text) return;
    onAdd(text);
    setText("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-4 flex items-center justify-center gap-2 border border-dashed border-[#222] rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-[#444] hover:text-purple-400"
      >
        <Plus size={18} />
        <span className="text-xs font-bold uppercase tracking-widest">
          Add Thought / Correction
        </span>
      </button>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-purple-500/30 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
      <textarea
        autoFocus
        placeholder="What did the model miss? Any corrections or new ideas..."
        className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-sm h-32 resize-none focus:border-purple-500 outline-none transition-all"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) handleSubmit();
        }}
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setIsAdding(false)}
          className="px-6 py-2 text-[10px] font-bold text-[#555] hover:text-[#888] uppercase"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-purple-900/20"
        >
          Log Thought
        </button>
      </div>
    </div>
  );
};

export default App;
