"use client"

import type { Prompt } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ComparisonViewProps {
  basePrompt: Prompt
  variantPrompt: Prompt
}

export function ComparisonView({ basePrompt, variantPrompt }: ComparisonViewProps) {
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      <div className="flex flex-col">
        <div className="mb-3">
          <Label className="text-sm text-muted-foreground">Base Prompt</Label>
          <h3 className="text-base font-semibold mt-1">{basePrompt.title}</h3>
        </div>
        <ScrollArea className="flex-1 rounded-lg border border-border p-4 bg-card">
          <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">{basePrompt.content}</p>
        </ScrollArea>
      </div>

      <div className="flex flex-col">
        <div className="mb-3">
          <Label className="text-sm text-muted-foreground">
            {variantPrompt.variant_type === "enhanced" && "Enhanced Version"}
            {variantPrompt.variant_type === "evolved" && "Evolved Version"}
            {variantPrompt.variant_type === "discussion" && "Discussion Version"}
          </Label>
          <h3 className="text-base font-semibold mt-1">{variantPrompt.title}</h3>
        </div>
        <ScrollArea className="flex-1 rounded-lg border border-primary p-4 bg-card">
          <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">{variantPrompt.content}</p>
        </ScrollArea>
      </div>
    </div>
  )
}
