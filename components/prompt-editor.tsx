"use client"

import type { Prompt, EvolutionNote } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, GitMerge, MessageSquare, Save, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface PromptEditorProps {
  prompt: Prompt | null
  notes: EvolutionNote[]
  onSave: (title: string, content: string) => void
  onEnhance: () => void
  onEvolve: () => void
  onDiscuss: () => void
  onAddNote: (note: string) => void
  onDeleteNote: (noteId: string) => void
  isProcessing: boolean
}

export function PromptEditor({
  prompt,
  notes,
  onSave,
  onEnhance,
  onEvolve,
  onDiscuss,
  onAddNote,
  onDeleteNote,
  isProcessing,
}: PromptEditorProps) {
  const [title, setTitle] = useState(prompt?.title || "")
  const [content, setContent] = useState(prompt?.content || "")
  const [newNote, setNewNote] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  // Update local state when prompt changes
  if (prompt && (title !== prompt.title || content !== prompt.content)) {
    if (!hasChanges) {
      setTitle(prompt.title)
      setContent(prompt.content)
    }
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setHasChanges(true)
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(title, content)
    setHasChanges(false)
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim())
      setNewNote("")
    }
  }

  if (!prompt) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a prompt to edit or create a new one
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Edit Prompt</h2>
          {prompt.variant_type !== "base" && (
            <span
              className={cn(
                "text-xs px-2 py-1 rounded",
                prompt.variant_type === "enhanced" && "bg-primary/20 text-primary",
                prompt.variant_type === "evolved" && "bg-blue-500/20 text-blue-400",
                prompt.variant_type === "discussion" && "bg-purple-500/20 text-purple-400",
              )}
            >
              {prompt.variant_type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onEnhance} disabled={isProcessing || !content.trim()}>
            <Sparkles className="h-4 w-4 mr-2" />
            Enhance
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onEvolve}
            disabled={isProcessing || notes.length === 0 || !content.trim()}
          >
            <GitMerge className="h-4 w-4 mr-2" />
            Evolve
          </Button>
          <Button size="sm" variant="outline" onClick={onDiscuss} disabled={isProcessing || !content.trim()}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Discuss
          </Button>
          {hasChanges && (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div>
          <Label htmlFor="title" className="text-sm text-muted-foreground">
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter prompt title..."
            className="mt-1.5"
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <Label htmlFor="content" className="text-sm text-muted-foreground">
            Content
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter your prompt here..."
            className="mt-1.5 flex-1 resize-none font-mono text-sm"
          />
        </div>

        {/* Evolution Notes Section */}
        <div className="border-t border-border pt-4">
          <Label className="text-sm text-muted-foreground mb-2 block">Evolution Notes</Label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add feedback note..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddNote()
                }
              }}
            />
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 group">
                <p className="flex-1 text-sm">{note.note}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteNote(note.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No notes yet. Add notes to use the Evolve feature.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
