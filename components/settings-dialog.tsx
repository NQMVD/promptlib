"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { useState, useEffect } from "react"

interface SettingsDialogProps {
  apiKey: string
  model: string
  onSave: (apiKey: string, model: string) => void
}

export function SettingsDialog({ apiKey, model, onSave }: SettingsDialogProps) {
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [localModel, setLocalModel] = useState(model)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setLocalApiKey(apiKey)
    setLocalModel(model)
  }, [apiKey, model])

  const handleSave = () => {
    onSave(localApiKey, localModel)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Configuration</DialogTitle>
          <DialogDescription>Configure your OpenRouter API key and model selection for AI features.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">OpenRouter API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              placeholder="anthropic/claude-3.5-sonnet"
            />
            <p className="text-xs text-muted-foreground">
              Examples: anthropic/claude-3.5-sonnet, openai/gpt-4, meta-llama/llama-3.1-70b-instruct
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
