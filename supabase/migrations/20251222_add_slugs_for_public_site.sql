-- learn.gostudiom.com Migration: Add slug columns for SEO-friendly URLs
-- Tables: videos_parsed, videos_channels, news_articles
-- Run with: supabase db push --db-url or via Supabase dashboard

-- ============================================================================
-- videos_parsed (unique by youtube_video_id suffix)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos_parsed' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.videos_parsed ADD COLUMN slug TEXT UNIQUE;
  END IF;
END $$;

-- Generate slugs for existing videos (title + youtube_video_id for uniqueness)
UPDATE public.videos_parsed
SET slug = lower(regexp_replace(
  regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
)) || '-' || youtube_video_id
WHERE slug IS NULL AND title IS NOT NULL;

-- Index for slug lookup
CREATE INDEX IF NOT EXISTS idx_videos_parsed_slug
  ON public.videos_parsed(slug);

-- ============================================================================
-- videos_channels (use @handle if available, else slugified title)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos_channels' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.videos_channels ADD COLUMN slug TEXT UNIQUE;
  END IF;
END $$;

-- Generate slugs for existing channels (prefer handle, fallback to title)
UPDATE public.videos_channels
SET slug = COALESCE(
  NULLIF(handle, ''),
  lower(regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ))
)
WHERE slug IS NULL;

-- Index for slug lookup
CREATE INDEX IF NOT EXISTS idx_videos_channels_slug
  ON public.videos_channels(slug);

-- ============================================================================
-- news_articles (unique by YYYY-MM suffix for date disambiguation)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_articles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.news_articles ADD COLUMN slug TEXT UNIQUE;
  END IF;
END $$;

-- Generate slugs for existing articles (title + YYYY-MM + short ID suffix for uniqueness)
UPDATE public.news_articles
SET slug = lower(regexp_replace(
  regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
)) || '-' || to_char(COALESCE(published_at, created_at), 'YYYY-MM') || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL AND title IS NOT NULL;

-- Index for slug lookup
CREATE INDEX IF NOT EXISTS idx_news_articles_slug
  ON public.news_articles(slug);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON COLUMN public.videos_parsed.slug IS 'SEO-friendly URL slug for learn.gostudiom.com';
COMMENT ON COLUMN public.videos_channels.slug IS 'SEO-friendly URL slug (derived from @handle or title)';
COMMENT ON COLUMN public.news_articles.slug IS 'SEO-friendly URL slug for learn.gostudiom.com';
