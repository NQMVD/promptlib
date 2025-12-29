import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainView from "./components/MainView";
import { X, Settings } from "lucide-react";
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
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // -- Persistence --
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

  useEffect(() => {
    localStorage.setItem("provider", provider);
    localStorage.setItem("api_keys", JSON.stringify(apiKeys));
    localStorage.setItem("modelId", modelId);
  }, [provider, apiKeys, modelId]);


  // -- Actions --

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const addPrompt = (content = "", parentId = null) => {
    const newId = Date.now() + Math.random();
    const promptObj = {
      id: newId,
      content: content.trim(),
      timestamp: formatDate(new Date()),
      mode: parentId ? "evolved" : "none",
      parentId,
    };
    setPrompts(prev => [promptObj, ...prev]);
    setSelectedPromptId(newId);
  };

  const updatePrompt = (id, newContent) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, content: newContent } : p));
  };

  const deletePrompt = (id) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
    if (selectedPromptId === id) setSelectedPromptId(null);
  };

  // -- API Calls --

  const enhancePrompt = async () => {
    const prompt = prompts.find(p => p.id === selectedPromptId);
    if (!prompt) return;

    if (!apiKeys[provider]) {
      setShowSettings(true);
      return;
    }

    setIsProcessing(true);
    const systemPrompt = "Role: Meta-Prompt Engineer. Task: Rewrite and optimize the user's input into a high-performance prompt. Strict Rule 1 (No Execution): Do not perform the task described in the prompt. Your only output must be the revised version of the prompt itself. Strict Rule 2 (Fidelity): Retain all specific technical choices, constraints, and details. Strict Rule 3 (No Hallucinations): Do not invent specific requirements. Process: 1. Clean grammar. 2. Apply formatting. 3. Add structure. Output ONLY refined prompt text.";

    try {
      const response = await fetch(PROVIDERS[provider].endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKeys[provider]}`,
          "HTTP-Referer": "https://promptlib.local",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Original: ${prompt.content}` }
          ]
        })
      });

      if (!response.ok) throw new Error("API Request Failed");
      const data = await response.json();
      const refined = data.choices[0].message.content;
      addPrompt(refined, prompt.id);

    } catch (e) {
      console.error(e);
      alert("Enhance failed (Check API Key): " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const evolvePrompt = async (thought) => {
    const prompt = prompts.find(p => p.id === selectedPromptId);
    if (!prompt) return;

    if (!apiKeys[provider]) {
      setShowSettings(true);
      return;
    }

    setIsProcessing(true);
    const systemPrompt = "Role: Prompt Evolution Specialist. Task: Evolve the base prompt by integrating user feedback and thoughts. Output ONLY the evolved prompt text.";

    try {
      const response = await fetch(PROVIDERS[provider].endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKeys[provider]}`,
          "HTTP-Referer": "https://promptlib.local",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Base: ${prompt.content}\nThoughts: ${thought}` }
          ]
        })
      });

      if (!response.ok) throw new Error("API Request Failed");
      const data = await response.json();
      const evolved = data.choices[0].message.content;
      addPrompt(evolved, prompt.id);

    } catch (e) {
      console.error(e);
      alert("Evolution failed (Check API Key): " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };


  // -- Filtering --
  const filteredPrompts = prompts.filter(p =>
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePrompt = prompts.find(p => p.id === selectedPromptId);

  return (
    <div className="flex h-screen w-full bg-[var(--bg-primary)] text-[var(--text-secondary)] font-sans overflow-hidden">

      {/* Sidebar */}
      <Sidebar
        prompts={filteredPrompts}
        selectedId={selectedPromptId}
        onSelect={setSelectedPromptId}
        onAdd={() => addPrompt("New Prompt")}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Settings Overlay */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm"
          >
            <Settings size={18} />
          </button>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-4 w-80 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl z-50 p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[var(--text-primary)]">Settings</h3>
                <button onClick={() => setShowSettings(false)}><X size={16} /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-[var(--text-muted)] uppercase">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-sm"
                  >
                    {Object.keys(PROVIDERS).map(k => <option key={k} value={k}>{PROVIDERS[k].name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-[var(--text-muted)] uppercase">API Key</label>
                  <input
                    type="password"
                    value={apiKeys[provider] || ""}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                    className="w-full mt-1 p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-sm"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[var(--text-muted)] uppercase">Model ID</label>
                  <input
                    type="text"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full mt-1 p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        <MainView
          prompt={activePrompt}
          allPrompts={prompts}
          onUpdate={updatePrompt}
          onDelete={deletePrompt}
          onEvolve={evolvePrompt}
          onEnhance={enhancePrompt}
          isProcessing={isProcessing}
        />
      </div>

    </div>
  );
};

export default App;
