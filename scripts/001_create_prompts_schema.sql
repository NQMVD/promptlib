-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  variant_type TEXT CHECK (variant_type IN ('base', 'enhanced', 'evolved', 'discussion')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create evolution_notes table for storing feedback notes
CREATE TABLE IF NOT EXISTS evolution_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discussion_responses table for storing discussion mode Q&A
CREATE TABLE IF NOT EXISTS discussion_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  questions JSONB,
  additions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prompts_parent_id ON prompts(parent_id);
CREATE INDEX IF NOT EXISTS idx_evolution_notes_prompt_id ON evolution_notes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_discussion_responses_prompt_id ON discussion_responses(prompt_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
