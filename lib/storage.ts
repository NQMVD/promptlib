import fs from "fs/promises"
import path from "path"
import { Prompt, EvolutionNote, DiscussionResponse } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")
const PROMPTS_FILE = path.join(DATA_DIR, "prompts.json")
const NOTES_FILE = path.join(DATA_DIR, "notes.json")
const DISCUSSIONS_FILE = path.join(DATA_DIR, "discussions.json")

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

async function readJson<T>(filePath: string): Promise<T[]> {
  await ensureDataDir()
  try {
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeJson<T>(filePath: string, data: T[]) {
  await ensureDataDir()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")
}

export const storage = {
  // Prompts
  async getPrompts(): Promise<Prompt[]> {
    const prompts = await readJson<Prompt>(PROMPTS_FILE)
    return prompts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  async getPromptById(id: string): Promise<Prompt | null> {
    const prompts = await readJson<Prompt>(PROMPTS_FILE)
    return prompts.find((p) => p.id === id) || null
  },

  async createPrompt(prompt: Omit<Prompt, "id" | "created_at" | "updated_at">): Promise<Prompt> {
    const prompts = await readJson<Prompt>(PROMPTS_FILE)
    const newPrompt: Prompt = {
      ...prompt,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    prompts.push(newPrompt)
    await writeJson(PROMPTS_FILE, prompts)
    return newPrompt
  },

  async updatePrompt(id: string, updates: Partial<Omit<Prompt, "id" | "created_at" | "updated_at">>): Promise<Prompt | null> {
    const prompts = await readJson<Prompt>(PROMPTS_FILE)
    const index = prompts.findIndex((p) => p.id === id)
    if (index === -1) return null

    const updatedPrompt: Prompt = {
      ...prompts[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    prompts[index] = updatedPrompt
    await writeJson(PROMPTS_FILE, prompts)
    return updatedPrompt
  },

  async deletePrompt(id: string): Promise<boolean> {
    const prompts = await readJson<Prompt>(PROMPTS_FILE)
    const initialLength = prompts.length
    const filteredPrompts = prompts.filter((p) => p.id !== id)
    if (filteredPrompts.length === initialLength) return false
    
    await writeJson(PROMPTS_FILE, filteredPrompts)
    
    // Cascading delete for variants
    const childVariants = prompts.filter(p => p.parent_id === id)
    for (const variant of childVariants) {
      await this.deletePrompt(variant.id)
    }

    // Cascading delete for notes and discussions
    const notes = await readJson<EvolutionNote>(NOTES_FILE)
    await writeJson(NOTES_FILE, notes.filter(n => n.prompt_id !== id))
    
    const discussions = await readJson<DiscussionResponse>(DISCUSSIONS_FILE)
    await writeJson(DISCUSSIONS_FILE, discussions.filter(d => d.prompt_id !== id))

    return true
  },

  async getVariants(parentId: string): Promise<Prompt[]> {
    const prompts = await readJson<Prompt>(PROMPTS_FILE)
    return prompts.filter((p) => p.parent_id === parentId)
  },

  // Notes
  async getNotes(promptId: string): Promise<EvolutionNote[]> {
    const notes = await readJson<EvolutionNote>(NOTES_FILE)
    return notes.filter((n) => n.prompt_id === promptId)
  },

  async createNote(promptId: string, noteText: string): Promise<EvolutionNote> {
    const notes = await readJson<EvolutionNote>(NOTES_FILE)
    const newNote: EvolutionNote = {
      id: crypto.randomUUID(),
      prompt_id: promptId,
      note: noteText,
      created_at: new Date().toISOString(),
    }
    notes.push(newNote)
    await writeJson(NOTES_FILE, notes)
    return newNote
  },

  async deleteNote(noteId: string): Promise<boolean> {
    const notes = await readJson<EvolutionNote>(NOTES_FILE)
    const filteredNotes = notes.filter((n) => n.id !== noteId)
    if (filteredNotes.length === notes.length) return false
    await writeJson(NOTES_FILE, filteredNotes)
    return true
  },

  // Discussions
  async getDiscussion(promptId: string): Promise<DiscussionResponse | null> {
    const discussions = await readJson<DiscussionResponse>(DISCUSSIONS_FILE)
    return discussions.find((d) => d.prompt_id === promptId) || null
  },

  async createOrUpdateDiscussion(promptId: string, data: { questions: string[], additions: string[] }): Promise<DiscussionResponse> {
    const discussions = await readJson<DiscussionResponse>(DISCUSSIONS_FILE)
    const index = discussions.findIndex((d) => d.prompt_id === promptId)
    
    if (index !== -1) {
      discussions[index] = {
        ...discussions[index],
        questions: data.questions,
        additions: data.additions,
      }
      await writeJson(DISCUSSIONS_FILE, discussions)
      return discussions[index]
    } else {
      const newDiscussion: DiscussionResponse = {
        id: crypto.randomUUID(),
        prompt_id: promptId,
        questions: data.questions,
        additions: data.additions,
        created_at: new Date().toISOString(),
      }
      discussions.push(newDiscussion)
      await writeJson(DISCUSSIONS_FILE, discussions)
      return newDiscussion
    }
  }
}
