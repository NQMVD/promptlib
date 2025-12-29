"use client"

import { useState, useEffect } from "react"
import type { Prompt, EvolutionNote } from "@/lib/types"
import { PromptList } from "@/components/prompt-list"
import { PromptEditor } from "@/components/prompt-editor"
import { ComparisonView } from "@/components/comparison-view"
import { DiscussionPanel } from "@/components/discussion-panel"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { Plus, GitCompare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type ViewMode = "edit" | "compare" | "discuss"

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [notes, setNotes] = useState<EvolutionNote[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("edit")
  const [compareWith, setCompareWith] = useState<Prompt | null>(null)
  const [discussion, setDiscussion] = useState<{
    questions: string[]
    additions: string[]
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState("anthropic/claude-3.5-sonnet")
  const { toast } = useToast()

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openrouter_api_key")
    const savedModel = localStorage.getItem("openrouter_model")
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedModel) setModel(savedModel)
  }, [])

  // Load prompts
  useEffect(() => {
    loadPrompts()
  }, [])

  // Load notes when prompt changes
  useEffect(() => {
    if (selectedPrompt) {
      loadNotes(selectedPrompt.id)
    }
  }, [selectedPrompt]) // Updated to use selectedPrompt directly

  const loadPrompts = async () => {
    try {
      const response = await fetch("/api/prompts")
      const data = await response.json()
      setPrompts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      })
    }
  }

  const loadNotes = async (promptId: string) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/notes`)
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error("Failed to load notes:", error)
    }
  }

  const handleCreatePrompt = async () => {
    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Prompt",
          content: "",
          variant_type: "base",
        }),
      })
      const newPrompt = await response.json()
      setPrompts([newPrompt, ...prompts])
      setSelectedPrompt(newPrompt)
      setViewMode("edit")
      toast({
        title: "Success",
        description: "New prompt created",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create prompt",
        variant: "destructive",
      })
    }
  }

  const handleSavePrompt = async (title: string, content: string) => {
    if (!selectedPrompt) return

    try {
      const response = await fetch(`/api/prompts/${selectedPrompt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })
      const updatedPrompt = await response.json()

      setPrompts(prompts.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p)))
      setSelectedPrompt(updatedPrompt)

      toast({
        title: "Success",
        description: "Prompt saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      })
    }
  }

  const handleDuplicatePrompt = async (prompt: Prompt) => {
    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${prompt.title} (Copy)`,
          content: prompt.content,
          variant_type: "base",
        }),
      })
      const newPrompt = await response.json()
      setPrompts([newPrompt, ...prompts])
      toast({
        title: "Success",
        description: "Prompt duplicated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate prompt",
        variant: "destructive",
      })
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
    try {
      await fetch(`/api/prompts/${promptId}`, {
        method: "DELETE",
      })
      setPrompts(prompts.filter((p) => p.id !== promptId))
      if (selectedPrompt?.id === promptId) {
        setSelectedPrompt(null)
      }
      toast({
        title: "Success",
        description: "Prompt deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      })
    }
  }

  const handleEnhance = async () => {
    if (!selectedPrompt || !apiKey) {
      toast({
        title: "Configuration Required",
        description: "Please configure your OpenRouter API key in settings",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: selectedPrompt.content,
          model,
          apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance prompt")
      }

      // Create a new variant
      const variantResponse = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${selectedPrompt.title} (Enhanced)`,
          content: data.enhancedPrompt,
          parent_id: selectedPrompt.parent_id || selectedPrompt.id,
          variant_type: "enhanced",
        }),
      })

      const newVariant = await variantResponse.json()
      setPrompts([newVariant, ...prompts])
      setSelectedPrompt(newVariant)

      toast({
        title: "Success",
        description: "Prompt enhanced successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enhance prompt",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEvolve = async () => {
    if (!selectedPrompt || !apiKey || notes.length === 0) {
      toast({
        title: "Cannot Evolve",
        description: "Add some evolution notes first",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/ai/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: selectedPrompt.content,
          notes: notes.map((n) => n.note),
          model,
          apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to evolve prompt")
      }

      // Create a new variant
      const variantResponse = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${selectedPrompt.title} (Evolved)`,
          content: data.evolvedPrompt,
          parent_id: selectedPrompt.parent_id || selectedPrompt.id,
          variant_type: "evolved",
        }),
      })

      const newVariant = await variantResponse.json()
      setPrompts([newVariant, ...prompts])
      setSelectedPrompt(newVariant)

      toast({
        title: "Success",
        description: "Prompt evolved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to evolve prompt",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDiscuss = async () => {
    if (!selectedPrompt || !apiKey) {
      toast({
        title: "Configuration Required",
        description: "Please configure your OpenRouter API key in settings",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/ai/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: selectedPrompt.content,
          model,
          apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate discussion")
      }

      setDiscussion({
        questions: data.questions,
        additions: data.additions,
      })
      setViewMode("discuss")

      toast({
        title: "Success",
        description: "Discussion generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate discussion",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddNote = async (note: string) => {
    if (!selectedPrompt) return

    try {
      const response = await fetch(`/api/prompts/${selectedPrompt.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      })
      const newNote = await response.json()
      setNotes([newNote, ...notes])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedPrompt) return

    try {
      await fetch(`/api/prompts/${selectedPrompt.id}/notes?noteId=${noteId}`, {
        method: "DELETE",
      })
      setNotes(notes.filter((n) => n.id !== noteId))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const handleCompare = () => {
    if (!selectedPrompt) return

    // Find the base prompt
    const basePrompt = selectedPrompt.parent_id
      ? prompts.find((p) => p.id === selectedPrompt.parent_id)
      : selectedPrompt

    if (basePrompt && selectedPrompt.parent_id) {
      setCompareWith(basePrompt)
      setViewMode("compare")
    } else {
      toast({
        title: "Cannot Compare",
        description: "Select a variant to compare with its base",
        variant: "destructive",
      })
    }
  }

  const handleSaveSettings = (newApiKey: string, newModel: string) => {
    setApiKey(newApiKey)
    setModel(newModel)
    localStorage.setItem("openrouter_api_key", newApiKey)
    localStorage.setItem("openrouter_model", newModel)
    toast({
      title: "Settings Saved",
      description: "Your API configuration has been updated",
    })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-card/30">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Prompt Studio</h1>
            <SettingsDialog apiKey={apiKey} model={model} onSave={handleSaveSettings} />
          </div>
          <Button onClick={handleCreatePrompt} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <PromptList
            prompts={prompts}
            selectedPromptId={selectedPrompt?.id || null}
            onSelect={(prompt) => {
              setSelectedPrompt(prompt)
              setViewMode("edit")
            }}
            onDuplicate={handleDuplicatePrompt}
            onDelete={handleDeletePrompt}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/30">
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "edit" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("edit")}>
              Edit
            </Button>
            <Button
              variant={viewMode === "compare" ? "secondary" : "ghost"}
              size="sm"
              onClick={handleCompare}
              disabled={!selectedPrompt?.parent_id}
            >
              <GitCompare className="h-4 w-4 mr-2" />
              Compare
            </Button>
            <Button
              variant={viewMode === "discuss" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => discussion && setViewMode("discuss")}
              disabled={!discussion}
            >
              Discussion
            </Button>
          </div>
          {isProcessing && <div className="text-sm text-muted-foreground">Processing...</div>}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden">
          {viewMode === "edit" && (
            <PromptEditor
              prompt={selectedPrompt}
              notes={notes}
              onSave={handleSavePrompt}
              onEnhance={handleEnhance}
              onEvolve={handleEvolve}
              onDiscuss={handleDiscuss}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              isProcessing={isProcessing}
            />
          )}
          {viewMode === "compare" && selectedPrompt && compareWith && (
            <ComparisonView basePrompt={compareWith} variantPrompt={selectedPrompt} />
          )}
          {viewMode === "discuss" && discussion && (
            <DiscussionPanel questions={discussion.questions} additions={discussion.additions} />
          )}
        </div>
      </div>
    </div>
  )
}
