export interface Prompt {
  id: string
  title: string
  content: string
  parent_id: string | null
  variant_type: "base" | "enhanced" | "evolved" | "discussion"
  created_at: string
  updated_at: string
}

export interface EvolutionNote {
  id: string
  prompt_id: string
  note: string
  created_at: string
}

export interface DiscussionResponse {
  id: string
  prompt_id: string
  questions: string[]
  additions: string[]
  created_at: string
}

export interface PromptWithVariants extends Prompt {
  variants?: Prompt[]
  notes?: EvolutionNote[]
  discussion?: DiscussionResponse
}
