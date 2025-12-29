import React, { useState, useEffect, useRef } from "react";
import VariantsGallery from "./VariantsGallery";
import LineageTimeline from "./components/LineageTimeline";
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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Brain,
  Zap,
  Layout,
  Layers,
  MoreVertical,
  ArrowLeftRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROVIDERS = {
  openrouter: {
    name: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-oss-120b:free",
  },
  groq: {
    name: "Groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "moonshotai/kimi-k2-instruct-0905",
  },
  inception: {
    name: "Inception",
    endpoint: "https://api.inceptionlabs.ai/v1/chat/completions",
    defaultModel: "mercury",
  },
};

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
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [lineageActiveIndices, setLineageActiveIndices] = useState({});
  const [sideBySidePromptId, setSideBySidePromptId] = useState(null);
  const [sideBySideReturnToDetail, setSideBySideReturnToDetail] =
    useState(false);

  useEffect(() => {
    if (!selectedPromptId) {
      setIsAddingModel(false);
    }
  }, [selectedPromptId]);

  useEffect(() => {
    if (selectedPromptId || sideBySidePromptId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPromptId, sideBySidePromptId]);

  const [provider, setProvider] = useState(
    localStorage.getItem("provider") || "openrouter",
  );
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem("api_keys");
    if (saved) return JSON.parse(saved);
    return {
      openrouter:
        localStorage.getItem("openrouter_api_key") ||
        import.meta.env.OPENROUTER_API_KEY ||
        "",
      groq:
        localStorage.getItem("groq_api_key") ||
        import.meta.env.GROQ_API_KEY ||
        "",
      cerebras: "",
    };
  });
  const [modelId, setModelId] = useState(
    localStorage.getItem("modelId") || PROVIDERS[provider].defaultModel,
  );

  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);
  const editRef = useRef(null);
  const searchInputRef = useRef(null);
  const addBenchmarkBtnRef = useRef(null);
  const addThoughtBtnRef = useRef(null);

  // Keyboard shortcuts and Escape handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape handling
      if (e.key === "Escape") {
        if (sideBySidePromptId) {
          closeSideBySide();
          return;
        }
        if (selectedPromptId) {
          if (
            document.activeElement &&
            (document.activeElement.tagName === "INPUT" ||
              document.activeElement.tagName === "TEXTAREA")
          ) {
            document.activeElement.blur();
          } else {
            setSelectedPromptId(null);
          }
          return;
        }
      }

      // Global shortcuts (when not typing in an input)
      const isTyping =
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA");

      // Escape handling - always close modal (blur first if typing)
      if (e.key === "Escape" && selectedPromptId) {
        e.preventDefault();
        if (isTyping) {
          document.activeElement.blur();
        }
        setSelectedPromptId(null);
        return;
      }

      if (!isTyping) {
        if (e.key === "Tab" && selectedPromptId && !isAddingModel) {
          e.preventDefault();
          const prompt = prompts.find((p) => p.id === selectedPromptId);
          if (prompt) {
            const modes = ["none", "compare", "evolve"];
            const currentIndex = modes.indexOf(prompt.mode);
            const nextIndex = (currentIndex + 1) % modes.length;
            updatePromptMode(selectedPromptId, modes[nextIndex]);
          }
        }
        if (e.key === "n") {
          e.preventDefault();
          if (selectedPromptId) {
            // New entry in modal
            const prompt = prompts.find((p) => p.id === selectedPromptId);
            if (prompt?.mode === "compare") addBenchmarkBtnRef.current?.click();
            if (prompt?.mode === "evolve") addThoughtBtnRef.current?.click();
          } else {
            // New prompt in main view
            textareaRef.current?.focus();
          }
        }
        if (e.key === "s" && !selectedPromptId) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
        if (e.key === "c" && selectedPromptId) {
          e.preventDefault();
          const prompt = prompts.find((p) => p.id === selectedPromptId);
          if (prompt) copyToClipboard(prompt.content, prompt.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPromptId, prompts, isAddingModel, sideBySidePromptId]);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

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

  useEffect(() => {
    localStorage.setItem("provider", provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem("api_keys", JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem("modelId", modelId);
  }, [modelId]);

  const updateApiKey = (key) => {
    setApiKeys((prev) => ({ ...prev, [provider]: key }));
  };

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setModelId(PROVIDERS[newProvider].defaultModel);
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

  const addPrompt = (
    content = newPrompt,
    parentId = null,
    relationType = null,
  ) => {
    if (!content.trim()) return;
    const newId = Date.now() + Math.random();
    const promptObj = {
      id: newId,
      content: content.trim(),
      timestamp: formatDate(new Date()),
      mode: "none",
      models: [],
      thoughts: [],
      parentId,
      relationType,
    };

    setPrompts((prev) => {
      const updated = [promptObj, ...prev];
      if (parentId) {
        const promptMap = new Map(updated.map((p) => [p.id, p]));
        let root = promptMap.get(parentId);
        while (root && root.parentId && promptMap.has(root.parentId)) {
          root = promptMap.get(root.parentId);
        }
        if (root) {
          setLineageActiveIndices((prevIdx) => {
            const next = { ...prevIdx };
            delete next[root.id];
            return next;
          });
        }
      }
      return updated;
    });

    setNewPrompt("");
    copyToClipboard(content.trim(), newId);
  };

  const deletePrompt = (id) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    if (selectedPromptId === id) {
      setSelectedPromptId(null);
      setIsAddingModel(false);
    }
  };

  const duplicatePrompt = (prompt) => {
    const duplicated = {
      ...prompt,
      id: Date.now() + Math.random(),
      timestamp: formatDate(new Date()) + " (Copy)",
      parentId: null,
      relationType: null,
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
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, mode } : p)));
  };

  const addModelResult = (id, modelData) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            models: [
              ...p.models,
              {
                ...modelData,
                id: Date.now() + Math.random(),
                timestamp: formatDate(new Date()),
              },
            ],
          }
          : p,
      ),
    );
  };

  const removeModelResult = (promptId, modelId) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId
          ? {
            ...p,
            models: p.models.filter((m) => m.id !== modelId),
          }
          : p,
      ),
    );
  };

  const addEvolutionThought = (id, text) => {
    if (!text.trim()) return;
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            thoughts: [
              ...p.thoughts,
              {
                id: Date.now(),
                text,
                timestamp: formatDate(new Date()),
              },
            ],
          }
          : p,
      ),
    );
  };

  const enhancePrompt = async (prompt) => {
    const currentApiKey = apiKeys[provider];
    if (!currentApiKey) {
      setShowSettings(true);
      return;
    }
    setIsEnhancingId(prompt.id);
    const systemPrompt =
      "Role: Meta-Prompt Engineer. Task: Rewrite and optimize the user's input into a high-performance prompt. Strict Rule 1 (No Execution): Do not perform the task described in the prompt. Your only output must be the revised version of the prompt itself. Strict Rule 2 (Fidelity): Retain all specific technical choices, constraints, and details. Strict Rule 3 (No Hallucinations): Do not invent specific requirements. Process: 1. Clean grammar. 2. Apply formatting. 3. Add structure. Output ONLY refined prompt text.";

    try {
      const response = await fetch(PROVIDERS[provider].endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentApiKey}`,
          ...(provider === "openrouter" && {
            "HTTP-Referer": "https://promptlib.local",
            "X-Title": "Prompt Library",
          }),
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Original Prompt: ${prompt.content}` },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API Error: ${response.status}`,
        );
      }
      const data = await response.json();
      const enhancedText = data.choices?.[0]?.message?.content;
      if (enhancedText) addPrompt(enhancedText, prompt.id, "enhanced");
    } catch (err) {
      console.error("Enhance failed:", err);
      alert("Failed to enhance prompt. Error: " + err.message);
    } finally {
      setIsEnhancingId(null);
    }
  };

  const evolvePrompt = async (prompt) => {
    const currentApiKey = apiKeys[provider];
    if (!currentApiKey) {
      setShowSettings(true);
      return;
    }
    setIsEvolvingId(prompt.id);
    const thoughtsList = prompt.thoughts.map((t) => `- ${t.text}`).join("\n");
    const systemPrompt =
      "Role: Prompt Evolution Specialist. Task: Evolve the base prompt by integrating user feedback and thoughts. Output ONLY the evolved prompt text.";

    try {
      const response = await fetch(PROVIDERS[provider].endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentApiKey}`,
          ...(provider === "openrouter" && {
            "HTTP-Referer": "https://promptlib.local",
            "X-Title": "Prompt Library",
          }),
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Base Prompt: ${prompt.content}\n\nUser Feedback/Thoughts:\n${thoughtsList}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API Error: ${response.status}`,
        );
      }
      const data = await response.json();
      const evolvedText = data.choices?.[0]?.message?.content;
      if (evolvedText) {
        addPrompt(evolvedText, prompt.id, "evolved");
      }
    } catch (err) {
      console.error("Evolve failed:", err);
      alert("Failed to evolve prompt. Error: " + err.message);
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

  const closeSideBySide = () => {
    const promptId = sideBySidePromptId;
    setSideBySidePromptId(null);
    if (sideBySideReturnToDetail && promptId) {
      setSelectedPromptId(promptId);
    }
    setSideBySideReturnToDetail(false);
  };

  const getLineages = (allPrompts) => {
    const promptMap = new Map(allPrompts.map((p) => [p.id, p]));
    const roots = allPrompts.filter(
      (p) => !p.parentId || !promptMap.has(p.parentId),
    );

    return roots
      .map((root) => {
        const versions = [];
        const queue = [root];
        const visited = new Set();

        while (queue.length > 0) {
          const current = queue.shift();
          if (visited.has(current.id)) continue;
          visited.add(current.id);
          versions.push(current);
          const children = allPrompts.filter((p) => p.parentId === current.id);
          queue.push(...children);
        }

        return {
          rootId: root.id,
          versions: versions.sort((a, b) => a.id - b.id),
        };
      })
      .sort((a, b) => b.rootId - a.rootId);
  };

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
  const filteredPrompts = prompts.filter((p) =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (showGallery) {
    return <VariantsGallery onBack={() => setShowGallery(false)} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans">
      {/* Header - Glass effect with gradient accents */}
      <header className="glass-strong sticky top-0 z-40 border-b border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-purple)] rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-orange)] to-[#CE9160] flex items-center justify-center shadow-lg">
                  <Archive size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                  Prompt Library
                </h1>
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                  {prompts.length} prompts
                </p>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-1">
              <div className="flex items-center bg-[var(--bg-surface)] rounded-xl p-1 border border-[var(--border-subtle)]">
                <button
                  onClick={exportLibrary}
                  className="btn-ghost p-2"
                  title="Export Library"
                >
                  <Download size={18} />
                </button>
                <label
                  className="btn-ghost p-2 cursor-pointer"
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
                <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`btn-ghost p-2 ${showSettings ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]" : ""}`}
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
                <button
                  onClick={() => setShowGallery(true)}
                  className="btn-ghost p-2"
                  title="View UI Variants"
                >
                  <Layout size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="card-base p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    API Configuration
                  </h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="btn-ghost p-1.5"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                      Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="input-base w-full appearance-none cursor-pointer"
                    >
                      {Object.entries(PROVIDERS).map(([id, p]) => (
                        <option key={id} value={id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                      Model ID
                    </label>
                    <input
                      type="text"
                      className="input-base w-full"
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                      API Key
                    </label>
                    <input
                      type="password"
                      className="input-base w-full"
                      value={apiKeys[provider] || ""}
                      onChange={(e) => updateApiKey(e.target.value)}
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area - Floating card with gradient border on focus */}
        <div className="mb-12">
          <div className="relative group">
            {/* Glow effect behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-orange)] to-[var(--accent-purple)] rounded-2xl opacity-0 group-focus-within:opacity-20 blur-xl transition-all duration-500" />

            <div className="relative card-base card-interactive overflow-hidden">
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent border-none p-6 min-h-[140px] max-h-[60vh] text-base leading-relaxed placeholder-[var(--text-muted)] resize-none focus:outline-none overflow-y-auto scrollbar-hide text-[var(--text-primary)]"
                placeholder="Paste or type your prompt here..."
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
              />
              <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase">
                    ⌘ + Enter to Save
                  </span>
                </div>
                <button
                  onClick={() => addPrompt()}
                  disabled={!newPrompt.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Plus size={16} /> Save Prompt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        {prompts.length > 0 && (
          <div className="relative mb-10 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              size={16}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search library..."
              className="input-base w-full pl-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Prompt Grid */}
        <div className="space-y-6">
          {filteredPrompts.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-[var(--border-default)] rounded-2xl bg-[var(--bg-secondary)]">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-5 border border-[var(--border-subtle)]">
                <Archive size={24} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-tertiary)] text-sm font-medium mb-2">
                {searchQuery
                  ? "No results found"
                  : "Your library is empty"}
              </p>
              <p className="text-[var(--text-muted)] text-xs">
                {searchQuery
                  ? "Try a different search term"
                  : "Start by saving your first prompt above"}
              </p>
            </div>
          ) : (
            getLineages(filteredPrompts).map((lineage) => {
              const activeIndex = Math.min(
                lineageActiveIndices[lineage.rootId] ??
                lineage.versions.length - 1,
                lineage.versions.length - 1,
              );
              const prompt = lineage.versions[activeIndex];
              if (!prompt) return null;

              return (
                <motion.div
                  layout
                  key={lineage.rootId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group relative card-base card-interactive cursor-pointer ${editingId === prompt.id
                    ? "border-[var(--border-strong)] bg-[var(--bg-surface)]"
                    : ""
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
                        className="absolute inset-0 z-20 glass-strong rounded-[var(--radius-xl)] flex flex-col items-center justify-center p-6 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-12 h-12 rounded-full bg-[var(--accent-red-soft)] flex items-center justify-center mb-4">
                          <AlertCircle className="text-[var(--accent-red)]" size={24} />
                        </div>
                        <p className="text-sm font-medium text-[var(--text-primary)] mb-5">
                          Delete this prompt?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-5 py-2 rounded-xl text-xs font-semibold border border-[var(--border-default)] hover:bg-[var(--bg-surface)] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deletePrompt(prompt.id)}
                            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-red)] text-white hover:opacity-90 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-6">
                    {/* Header Badges */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2 items-center flex-wrap">
                        {prompt.parentId && (
                          <span className={`badge ${prompt.relationType === "enhanced" ? "badge-green" : "badge-purple"}`}>
                            <Sparkles size={10} />
                            {prompt.relationType}
                          </span>
                        )}
                        {prompt.mode === "compare" && (
                          <span className="badge badge-orange">
                            <BarChart2 size={10} /> Compare
                          </span>
                        )}
                        {prompt.mode === "evolve" && (
                          <span className="badge badge-purple">
                            <History size={10} /> Evolve
                          </span>
                        )}
                      </div>
                      {lineage.versions.length > 1 && (
                        <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                          v{activeIndex + 1}/{lineage.versions.length}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-h-[80px]">
                      {editingId === prompt.id ? (
                        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            ref={editRef}
                            className="input-base w-full min-h-[140px] max-h-[60vh] resize-none"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn-ghost"
                            >
                              <X size={18} />
                            </button>
                            <button
                              onClick={() => saveEdit(prompt.id)}
                              className="btn-primary text-xs flex items-center gap-2"
                            >
                              <Save size={14} /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap break-words line-clamp-4 group-hover:text-[var(--text-primary)] transition-colors">
                          {prompt.content}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {lineage.versions.length > 1 && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <LineageTimeline
                              versions={lineage.versions}
                              activeIndex={activeIndex}
                              onSelect={(idx) =>
                                setLineageActiveIndices((prev) => ({
                                  ...prev,
                                  [lineage.rootId]: idx,
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                          {prompt.timestamp}
                        </span>
                        {prompt.models.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                            <Zap size={10} className="text-[var(--accent-orange)]" />
                            {prompt.models.length}
                          </div>
                        )}
                        {prompt.thoughts.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                            <Brain size={10} className="text-[var(--accent-purple)]" />
                            {prompt.thoughts.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {editingId !== prompt.id && !confirmDeleteId && (
                    <div
                      className="absolute bottom-14 right-4 flex flex-row items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 bg-[#1a1a1a] border border-[#333] p-0.5 rounded-xl shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => copyToClipboard(prompt.content, prompt.id)}
                        className={`btn-ghost p-2 ${copiedId === prompt.id ? "text-[var(--accent-green)]" : ""}`}
                        title="Copy"
                      >
                        {copiedId === prompt.id ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                      <button
                        onClick={() => startEditing(prompt)}
                        className="btn-ghost p-2"
                        title="Edit"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => enhancePrompt(prompt)}
                        disabled={isEnhancingId === prompt.id}
                        className="btn-ghost p-2 hover:text-[var(--accent-green)] disabled:opacity-50"
                        title="AI Enhance"
                      >
                        {isEnhancingId === prompt.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Sparkles size={15} />
                        )}
                      </button>
                      {prompt.parentId && (
                        <button
                          onClick={() => setSideBySidePromptId(prompt.id)}
                          className="btn-ghost p-2 hover:text-[var(--accent-blue)]"
                          title="Compare"
                        >
                          <ArrowLeftRight size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => duplicatePrompt(prompt)}
                        className="btn-ghost p-2 hover:text-[var(--accent-orange)]"
                        title="Duplicate"
                      >
                        <CopyPlus size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(prompt.id)}
                        className="btn-ghost p-2 hover:text-[var(--accent-red)]"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </main>

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
              className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-xl"
              onClick={() => setSelectedPromptId(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                    <Archive size={16} className="text-[var(--text-tertiary)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Prompt Detail
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                      {selectedPrompt.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Mode Tabs */}
                  <div className="flex bg-[var(--bg-primary)] rounded-xl p-1 border border-[var(--border-subtle)]">
                    <button
                      onClick={() => updatePromptMode(selectedPrompt.id, "none")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${selectedPrompt.mode === "none"
                        ? "bg-[var(--bg-surface)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                        }`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => updatePromptMode(selectedPrompt.id, "compare")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${selectedPrompt.mode === "compare"
                        ? "bg-[var(--accent-orange-soft)] text-[var(--accent-orange)]"
                        : "text-[var(--text-muted)] hover:text-[var(--accent-orange)]"
                        }`}
                    >
                      <BarChart2 size={11} /> Compare
                    </button>
                    <button
                      onClick={() => updatePromptMode(selectedPrompt.id, "evolve")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${selectedPrompt.mode === "evolve"
                        ? "bg-[var(--accent-purple-soft)] text-[var(--accent-purple)]"
                        : "text-[var(--text-muted)] hover:text-[var(--accent-purple)]"
                        }`}
                    >
                      <History size={11} /> Evolve
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedPromptId(null)}
                    className="btn-ghost p-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#444]" />
                      <span className="text-[11px] font-bold text-[#444] uppercase tracking-widest">
                        {selectedPrompt.parentId
                          ? "Version Content"
                          : "Base Prompt"}
                      </span>
                    </div>
                    {selectedPrompt.parentId && (
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border flex items-center gap-1"
                        style={{
                          color:
                            selectedPrompt.relationType === "enhanced"
                              ? "#7FD88F"
                              : "#AAA0FA",
                          backgroundColor:
                            selectedPrompt.relationType === "enhanced"
                              ? "#7FD88F11"
                              : "#AAA0FA11",
                          borderColor:
                            selectedPrompt.relationType === "enhanced"
                              ? "#7FD88F22"
                              : "#AAA0FA22",
                        }}
                      >
                        <Sparkles size={10} />
                        {selectedPrompt.relationType.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="bg-[#0d0d0d] border border-[#222] rounded-2xl p-6 relative group overflow-hidden">
                    <AnimatePresence>
                      {confirmDeleteId === selectedPrompt.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-20 bg-[#0a0a0a]/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AlertCircle
                            className="text-[#FF5252] mb-3"
                            size={28}
                          />
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
                              onClick={() => deletePrompt(selectedPrompt.id)}
                              className="px-6 py-2 rounded-xl text-xs font-medium bg-[#FF5252] text-white hover:bg-[#FF5252]/80 transition-colors shadow-lg shadow-[#FF5252]/20"
                            >
                              Confirm Delete
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {editingId === selectedPrompt.id ? (
                      <div className="space-y-4">
                        <textarea
                          ref={editRef}
                          className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-[15px] text-[#ddd] focus:border-[#555] focus:ring-0 resize-none min-h-[140px] max-h-[60vh] focus:outline-none overflow-y-auto"
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
                            onClick={() => saveEdit(selectedPrompt.id)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-[#f0f0f0] text-[#0a0a0a] rounded-lg text-xs font-bold shadow-md"
                          >
                            <Save size={14} /> Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-[16px] leading-relaxed text-[#ddd] whitespace-pre-wrap">
                          {selectedPrompt.content}
                        </p>
                        <div className="absolute bottom-2 right-2 flex flex-row items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 bg-[#1a1a1a] border border-[#333] p-0.5 rounded-xl shadow-2xl">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                selectedPrompt.content,
                                selectedPrompt.id,
                              )
                            }
                            className={`p-2 rounded-lg transition-all ${copiedId === selectedPrompt.id
                              ? "text-[#7FD88F] bg-[#7FD88F]/10"
                              : "text-[#888] hover:text-[#f0f0f0] hover:bg-[#262626]"
                              }`}
                            title="Copy"
                          >
                            {copiedId === selectedPrompt.id ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => startEditing(selectedPrompt)}
                            className="p-2 text-[#888] hover:text-[#f0f0f0] hover:bg-[#262626] rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => enhancePrompt(selectedPrompt)}
                            disabled={isEnhancingId === selectedPrompt.id}
                            className="p-2 text-[#888] hover:text-[#7FD88F] hover:bg-[#7FD88F]/10 rounded-lg transition-all disabled:opacity-50"
                            title="AI Enhance"
                          >
                            {isEnhancingId === selectedPrompt.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Sparkles size={16} />
                            )}
                          </button>
                          {selectedPrompt.parentId && (
                            <button
                              onClick={() => {
                                setSideBySideReturnToDetail(true);
                                setSideBySidePromptId(selectedPrompt.id);
                                setSelectedPromptId(null);
                              }}
                              className="p-2 text-[#888] hover:text-[#60A5FA] hover:bg-[#60A5FA]/10 rounded-lg transition-all"
                              title="Compare with Base"
                            >
                              <ArrowLeftRight size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => duplicatePrompt(selectedPrompt)}
                            className="p-2 text-[#888] hover:text-[#EEB180] hover:bg-[#EEB180]/10 rounded-lg transition-all"
                            title="Duplicate"
                          >
                            <CopyPlus size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDeleteId(selectedPrompt.id)
                            }
                            className="p-2 text-[#888] hover:text-[#FF5252] hover:bg-[#FF5252]/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {selectedPrompt.mode === "compare" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between border-b border-[#222] pb-4">
                      <div className="flex items-center gap-2">
                        <BarChart2 size={16} className="text-[#EEB180]" />
                        <span className="text-[11px] font-bold text-[#EEB180] uppercase tracking-widest">
                          Model Performance Comparison
                        </span>
                      </div>
                      <div className="text-[10px] text-[#888] uppercase font-mono tracking-widest">
                        {selectedPrompt.models.length} Data Points
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[...selectedPrompt.models]
                        .sort((a, b) => b.rating - a.rating)
                        .map((m, idx) => (
                          <div
                            key={m.id}
                            className="group/item bg-[#0d0d0d] border border-[#222] rounded-xl overflow-hidden hover:border-[#EEB180]/30 transition-all"
                          >
                            <div className="flex flex-col md:flex-row">
                              <div className="p-4 md:w-1/3 border-b md:border-b-0 md:border-r border-[#222] bg-[#111]/50">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[14.5px] font-bold text-[#444] font-mono shrink-0">
                                    #{idx + 1}
                                  </span>
                                  <h4 className="font-bold text-[#f0f0f0] truncate text-[14.5px]">
                                    {m.name}
                                  </h4>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px] uppercase font-bold text-[#666] mb-1">
                                    <span>Score</span>
                                    <span className="text-[#EEB180]">
                                      {m.rating * 20}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${(m.rating / 5) * 100}%`,
                                      }}
                                      className="h-full bg-linear-to-r from-[#EEB180]/50 to-[#EEB180]"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="mb-4">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] uppercase font-bold text-[#666]">
                                      Observations
                                    </span>
                                    <button
                                      onClick={() =>
                                        removeModelResult(
                                          selectedPrompt.id,
                                          m.id,
                                        )
                                      }
                                      className="opacity-0 group-hover/item:opacity-100 p-1 text-[#444] hover:text-[#FF5252] transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  <p className="text-sm text-[#888] leading-relaxed">
                                    {m.note || "—"}
                                  </p>
                                </div>
                                <div className="text-[9px] font-mono text-[#444] uppercase flex items-center gap-2">
                                  <span>LOGGED</span>
                                  <span>{m.timestamp}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      <div className="pt-4">
                        <AddModelForm
                          ref={addBenchmarkBtnRef}
                          onAddingChange={setIsAddingModel}
                          onAdd={(data) =>
                            addModelResult(selectedPromptId, data)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPrompt.mode === "evolve" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain size={14} className="text-[#AAA0FA]" />
                        <span className="text-[11px] font-bold text-[#AAA0FA] uppercase tracking-widest">
                          Evolution Log
                        </span>
                      </div>
                      <button
                        onClick={() => evolvePrompt(selectedPrompt)}
                        disabled={
                          selectedPrompt.thoughts.length === 0 ||
                          isEvolvingId === selectedPrompt.id
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-[#AAA0FA] text-black rounded-xl text-xs font-bold hover:bg-[#AAA0FA]/80 transition-all disabled:opacity-30 shadow-lg shadow-[#AAA0FA]/20"
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
                            <div className="w-6 h-6 rounded-full bg-[#AAA0FA]/20 border border-[#AAA0FA]/30 flex items-center justify-center text-[10px] font-bold text-[#AAA0FA] shrink-0">
                              {idx + 1}
                            </div>
                            {idx !== selectedPrompt.thoughts.length - 1 && (
                              <div className="w-px flex-1 bg-[#222] my-2" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-[#161616] border border-[#222] rounded-2xl p-4 w-fit max-w-full">
                              <p className="text-sm text-[#ddd] leading-relaxed">
                                {t.text}
                              </p>
                              <div className="mt-2 text-[9px] font-mono text-[#666] uppercase">
                                {t.timestamp}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <AddThoughtForm
                        ref={addThoughtBtnRef}
                        onAdd={(text) =>
                          addEvolutionThought(selectedPrompt.id, text)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sideBySidePromptId &&
          (() => {
            const sideBySidePrompt = prompts.find(
              (p) => p.id === sideBySidePromptId,
            );
            if (!sideBySidePrompt || !sideBySidePrompt.parentId) return null;
            const basePrompt = prompts.find(
              (p) => p.id === sideBySidePrompt.parentId,
            );
            if (!basePrompt) return null;

            return (
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
                  className="absolute inset-0 bg-black/40 backdrop-blur-xl"
                  onClick={closeSideBySide}
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="relative w-full max-w-6xl h-[85vh] bg-[#111] border border-[#222] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="px-8 py-5 border-b border-[#222] flex items-center justify-between bg-[#0d0d0d]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#60A5FA]/10 border border-[#60A5FA]/20 flex items-center justify-center">
                        <ArrowLeftRight size={16} className="text-[#60A5FA]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#f0f0f0]">
                          Side-by-Side Comparison
                        </h2>
                        <p className="text-[10px] text-[#555] font-mono uppercase tracking-wider">
                          Base vs{" "}
                          {sideBySidePrompt.relationType?.toUpperCase() ||
                            "DERIVED"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeSideBySide}
                      className="p-2 rounded-xl text-[#555] hover:text-[#f0f0f0] hover:bg-[#222] transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                      <div className="flex flex-col h-full min-h-0">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-lg bg-[#333] flex items-center justify-center">
                            <MessageSquare size={12} className="text-[#888]" />
                          </div>
                          <span className="text-[11px] font-bold text-[#666] uppercase tracking-widest">
                            Base Prompt
                          </span>
                          <span className="ml-auto text-[10px] font-mono text-[#444]">
                            {basePrompt.timestamp}
                          </span>
                        </div>
                        <div className="flex-1 min-h-0 bg-[#0d0d0d] border border-[#222] rounded-2xl p-6 overflow-y-auto custom-scrollbar">
                          <p className="text-[15px] leading-relaxed text-[#999] whitespace-pre-wrap">
                            {basePrompt.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col h-full min-h-0">
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor:
                                sideBySidePrompt.relationType === "enhanced"
                                  ? "#7FD88F22"
                                  : "#AAA0FA22",
                            }}
                          >
                            {sideBySidePrompt.relationType === "enhanced" ? (
                              <Sparkles size={12} className="text-[#7FD88F]" />
                            ) : (
                              <History size={12} className="text-[#AAA0FA]" />
                            )}
                          </div>
                          <span
                            className="text-[11px] font-bold uppercase tracking-widest"
                            style={{
                              color:
                                sideBySidePrompt.relationType === "enhanced"
                                  ? "#7FD88F"
                                  : "#AAA0FA",
                            }}
                          >
                            {sideBySidePrompt.relationType === "enhanced"
                              ? "Enhanced"
                              : "Evolved"}{" "}
                            Prompt
                          </span>
                          <span className="ml-auto text-[10px] font-mono text-[#444]">
                            {sideBySidePrompt.timestamp}
                          </span>
                        </div>
                        <div
                          className="flex-1 rounded-2xl p-6 overflow-y-auto custom-scrollbar border"
                          style={{
                            backgroundColor:
                              sideBySidePrompt.relationType === "enhanced"
                                ? "#7FD88F08"
                                : "#AAA0FA08",
                            borderColor:
                              sideBySidePrompt.relationType === "enhanced"
                                ? "#7FD88F22"
                                : "#AAA0FA22",
                          }}
                        >
                          <p className="text-[15px] leading-relaxed text-[#ddd] whitespace-pre-wrap">
                            {sideBySidePrompt.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-4 border-t border-[#222] bg-[#0d0d0d] flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-mono text-[#444] uppercase">
                      <span>Base: {basePrompt.content.length} chars</span>
                      <span className="text-[#333]">|</span>
                      <span
                        style={{
                          color:
                            sideBySidePrompt.relationType === "enhanced"
                              ? "#7FD88F"
                              : "#AAA0FA",
                        }}
                      >
                        {sideBySidePrompt.relationType === "enhanced"
                          ? "Enhanced"
                          : "Evolved"}
                        : {sideBySidePrompt.content.length} chars
                      </span>
                      <span className="text-[#333]">|</span>
                      <span className="text-[#60A5FA]">
                        {sideBySidePrompt.content.length >
                          basePrompt.content.length
                          ? "+"
                          : ""}
                        {Math.round(
                          ((sideBySidePrompt.content.length -
                            basePrompt.content.length) /
                            basePrompt.content.length) *
                          100,
                        )}
                        % change
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            basePrompt.content,
                            `base-${basePrompt.id}`,
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${copiedId === `base-${basePrompt.id}`
                          ? "bg-[#7FD88F]/20 text-[#7FD88F]"
                          : "text-[#555] hover:text-[#888] hover:bg-[#222]"
                          }`}
                      >
                        {copiedId === `base-${basePrompt.id}` ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        Copy Base
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            sideBySidePrompt.content,
                            sideBySidePrompt.id,
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${copiedId === sideBySidePrompt.id
                          ? "bg-[#7FD88F]/20 text-[#7FD88F]"
                          : sideBySidePrompt.relationType === "enhanced"
                            ? "text-[#7FD88F] hover:bg-[#7FD88F]/10"
                            : "text-[#AAA0FA] hover:bg-[#AAA0FA]/10"
                          }`}
                      >
                        {copiedId === sideBySidePrompt.id ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        Copy{" "}
                        {sideBySidePrompt.relationType === "enhanced"
                          ? "Enhanced"
                          : "Evolved"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      <footer className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4 opacity-20">
          <div className="w-1 h-1 bg-[var(--text-tertiary)] rounded-full" />
          <div className="w-1 h-1 bg-[var(--text-tertiary)] rounded-full" />
          <div className="w-1 h-1 bg-[var(--text-tertiary)] rounded-full" />
        </div>
        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-[var(--text-muted)]">
          Prompt Library
        </p>
      </footer>
    </div>
  );
};

const AddModelForm = React.forwardRef(({ onAdd, onAddingChange }, ref) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  useEffect(() => {
    onAddingChange?.(isAdding);
  }, [isAdding, onAddingChange]);
  const ratingContainerRef = useRef(null);
  const noteRef = useRef(null);

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
        ref={ref}
        onClick={() => setIsAdding(true)}
        className="w-full py-4 flex items-center justify-center gap-2 border border-dashed border-[#222] rounded-2xl hover:border-[#EEB180]/50 hover:bg-[#EEB180]/5 transition-all text-[#444] hover:text-[#EEB180]"
      >
        <Plus size={18} />
        <span className="text-xs font-bold uppercase tracking-widest">
          Add New
        </span>
      </button>
    );
  }

  return (
    <div className="add-benchmark-form bg-[#0d0d0d] border border-[#EEB180]/30 rounded-xl overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="flex flex-col md:flex-row">
        <div className="p-4 md:w-1/3 border-b md:border-b-0 md:border-r border-[#222] bg-[#111]/50 space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#666] block">
              Model Name
            </span>
            <input
              autoFocus
              placeholder="e.g. GPT-4o"
              className="w-full bg-transparent border-none p-0 text-[14.5px] font-bold text-[#f0f0f0] outline-none focus:ring-0 placeholder-[#333]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] uppercase font-bold text-[#666]">
              <span>Rating</span>
              <span className="text-[#EEB180] font-mono">
                {rating > 0 ? rating * 20 : 0}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 p-1 -ml-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={`cursor-pointer transition-all hover:scale-125 ${s <= rating ? "text-yellow-500 fill-yellow-500" : "text-[#222]"}`}
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-1 h-full flex flex-col">
            <span className="text-[9px] uppercase font-bold text-[#666] block">
              Observations
            </span>
            <textarea
              placeholder="Record your findings..."
              className="w-full flex-1 bg-transparent border-none p-0 text-sm text-[#ddd] outline-none focus:ring-0 resize-none placeholder-[#333] min-h-[60px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="mt-4 flex gap-3 justify-end items-center">
            <button
              onClick={() => setIsAdding(false)}
              className="text-[10px] font-bold text-[#444] hover:text-[#666] uppercase"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name || !rating}
              className="bg-[#EEB180] text-black px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg shadow-[#EEB180]/10"
            >
              Log Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const AddThoughtForm = React.forwardRef(({ onAdd }, ref) => {
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
        ref={ref}
        onClick={() => setIsAdding(true)}
        className="w-full py-4 flex items-center justify-center gap-2 border border-dashed border-[#222] rounded-2xl hover:border-[#AAA0FA]/50 hover:bg-[#AAA0FA]/5 transition-all text-[#444] hover:text-[#AAA0FA]"
      >
        <Plus size={18} />
        <span className="text-xs font-bold uppercase tracking-widest">
          Add Thought / Correction
        </span>
      </button>
    );
  }
  return (
    <div className="bg-[#1a1a1a] border border-[#AAA0FA]/30 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
      <textarea
        autoFocus
        className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-sm h-32 resize-none focus:border-[#AAA0FA] outline-none transition-all"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setIsAdding(false)}
          className="px-6 py-2 text-[10px] font-bold text-[#666] hover:text-[#888] uppercase"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-[#AAA0FA] text-black rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-[#AAA0FA]/20"
        >
          Log Thought
        </button>
      </div>
    </div>
  );
});

export default App;
