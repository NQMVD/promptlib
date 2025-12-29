"use client"

import type { Prompt } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Copy, Trash2, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromptListProps {
  prompts: Prompt[]
  selectedPromptId: string | null
  onSelect: (prompt: Prompt) => void
  onDuplicate: (prompt: Prompt) => void
  onDelete: (promptId: string) => void
}

export function PromptList({ prompts, selectedPromptId, onSelect, onDuplicate, onDelete }: PromptListProps) {
  // Group prompts by base (parent_id === null) and their variants
  const basePrompts = prompts.filter((p) => p.parent_id === null)

  return (
    <div className="flex flex-col gap-2">
      {basePrompts.map((basePrompt) => {
        const variants = prompts.filter((p) => p.parent_id === basePrompt.id)
        const isSelected = selectedPromptId === basePrompt.id
        const hasSelectedVariant = variants.some((v) => v.id === selectedPromptId)

        return (
          <div key={basePrompt.id} className="flex flex-col gap-1">
            <div
              className={cn(
                "group flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent cursor-pointer",
                isSelected && "bg-accent border-primary",
              )}
              onClick={() => onSelect(basePrompt)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{basePrompt.title}</h3>
                  {variants.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GitBranch className="h-3 w-3" />
                      {variants.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">{basePrompt.content.slice(0, 60)}...</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(basePrompt)
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(basePrompt.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Variants */}
            {(hasSelectedVariant || isSelected) && variants.length > 0 && (
              <div className="ml-6 flex flex-col gap-1">
                {variants.map((variant) => {
                  const isVariantSelected = selectedPromptId === variant.id
                  return (
                    <div
                      key={variant.id}
                      className={cn(
                        "group flex items-center justify-between gap-2 rounded-lg border border-border bg-card/50 p-2.5 transition-colors hover:bg-accent cursor-pointer",
                        isVariantSelected && "bg-accent border-primary",
                      )}
                      onClick={() => onSelect(variant)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded",
                              variant.variant_type === "enhanced" && "bg-primary/20 text-primary",
                              variant.variant_type === "evolved" && "bg-blue-500/20 text-blue-400",
                              variant.variant_type === "discussion" && "bg-purple-500/20 text-purple-400",
                            )}
                          >
                            {variant.variant_type}
                          </span>
                          <h4 className="text-xs font-medium truncate">{variant.title}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDuplicate(variant)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(variant.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
