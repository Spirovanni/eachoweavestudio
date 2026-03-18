-- =============================================================================
-- AI Generations tracking table
-- Logs every AI generation for auditing, cost tracking, and history
-- =============================================================================

CREATE TABLE ews_ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES ews_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES ews_projects(id) ON DELETE SET NULL,
  tool TEXT NOT NULL,              -- e.g. "copilot", "story_generator", "writing_assistant"
  prompt TEXT NOT NULL,
  context JSONB,                   -- additional context sent with the request
  result TEXT,                     -- generated text (null if streamed and not stored)
  model TEXT NOT NULL,
  provider TEXT NOT NULL,          -- "anthropic" or "openai"
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,             -- wall-clock time in milliseconds
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'error', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_generations_user ON ews_ai_generations(user_id);
CREATE INDEX idx_ai_generations_project ON ews_ai_generations(project_id);
CREATE INDEX idx_ai_generations_created ON ews_ai_generations(created_at DESC);

ALTER TABLE ews_ai_generations ENABLE ROW LEVEL SECURITY;

-- Users can view their own generations
CREATE POLICY "Users can view their own AI generations"
  ON ews_ai_generations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own generations
CREATE POLICY "Users can create AI generations"
  ON ews_ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
