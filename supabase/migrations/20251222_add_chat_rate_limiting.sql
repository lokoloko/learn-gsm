-- learn.gostudiom.com Migration: Chat rate limiting for anonymous users
-- Table: learn_chat_rate_limits
-- Function: increment_learn_chat_rate_limit
-- Run with: supabase db push --db-url or via Supabase dashboard

-- ============================================================================
-- learn_chat_rate_limits - Track daily chat usage per anonymous user
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.learn_chat_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,           -- IP + user agent hash for anonymous users
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, date)
);

-- Enable RLS but allow anonymous access (public site)
ALTER TABLE public.learn_chat_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_chat_rate_limits FORCE ROW LEVEL SECURITY;

-- Allow anonymous rate limit tracking (service role inserts)
CREATE POLICY IF NOT EXISTS "Allow anonymous rate limit tracking"
  ON public.learn_chat_rate_limits
  FOR ALL
  USING (true);

-- Index for fast lookup by identifier and date
CREATE INDEX IF NOT EXISTS idx_learn_chat_rate_limits_lookup
  ON public.learn_chat_rate_limits(identifier, date);

-- ============================================================================
-- increment_learn_chat_rate_limit - Atomically increment message count
-- Returns the new count after incrementing
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_learn_chat_rate_limit(
  p_identifier TEXT,
  p_date DATE
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.learn_chat_rate_limits (identifier, date, message_count)
  VALUES (p_identifier, p_date, 1)
  ON CONFLICT (identifier, date)
  DO UPDATE SET message_count = learn_chat_rate_limits.message_count + 1
  RETURNING message_count INTO v_count;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE public.learn_chat_rate_limits IS 'Rate limiting for anonymous chat users on learn.gostudiom.com (5/day limit)';
COMMENT ON COLUMN public.learn_chat_rate_limits.identifier IS 'Hash of IP + user agent for anonymous user tracking';
COMMENT ON COLUMN public.learn_chat_rate_limits.message_count IS 'Number of chat messages sent today';
COMMENT ON FUNCTION public.increment_learn_chat_rate_limit IS 'Atomically increment and return chat message count for rate limiting';
