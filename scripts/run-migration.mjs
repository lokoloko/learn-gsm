import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

// Load .env.local
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'public' } }
)

async function runMigration() {
  console.log('Running migrations for slug columns...')

  const migrations = [
    // videos_parsed slug
    {
      name: 'Add slug to videos_parsed',
      sql: `
        ALTER TABLE public.videos_parsed
        ADD COLUMN IF NOT EXISTS slug TEXT;
      `
    },
    {
      name: 'Generate slugs for videos_parsed',
      sql: `
        UPDATE public.videos_parsed
        SET slug = lower(regexp_replace(
          regexp_replace(title, '[^a-zA-Z0-9\\s-]', '', 'g'),
          '\\s+', '-', 'g'
        )) || '-' || youtube_video_id
        WHERE slug IS NULL AND title IS NOT NULL;
      `
    },
    {
      name: 'Create unique constraint on videos_parsed.slug',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'videos_parsed_slug_key') THEN
            ALTER TABLE public.videos_parsed ADD CONSTRAINT videos_parsed_slug_key UNIQUE (slug);
          END IF;
        END $$;
      `
    },
    // videos_channels slug
    {
      name: 'Add slug to videos_channels',
      sql: `
        ALTER TABLE public.videos_channels
        ADD COLUMN IF NOT EXISTS slug TEXT;
      `
    },
    {
      name: 'Generate slugs for videos_channels',
      sql: `
        UPDATE public.videos_channels
        SET slug = COALESCE(
          NULLIF(handle, ''),
          lower(regexp_replace(
            regexp_replace(title, '[^a-zA-Z0-9\\s-]', '', 'g'),
            '\\s+', '-', 'g'
          ))
        )
        WHERE slug IS NULL;
      `
    },
    {
      name: 'Create unique constraint on videos_channels.slug',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'videos_channels_slug_key') THEN
            ALTER TABLE public.videos_channels ADD CONSTRAINT videos_channels_slug_key UNIQUE (slug);
          END IF;
        END $$;
      `
    },
    // news_articles slug
    {
      name: 'Add slug to news_articles',
      sql: `
        ALTER TABLE public.news_articles
        ADD COLUMN IF NOT EXISTS slug TEXT;
      `
    },
    {
      name: 'Generate slugs for news_articles',
      sql: `
        UPDATE public.news_articles
        SET slug = lower(regexp_replace(
          regexp_replace(title, '[^a-zA-Z0-9\\s-]', '', 'g'),
          '\\s+', '-', 'g'
        )) || '-' || to_char(COALESCE(published_at, created_at), 'YYYY-MM')
        WHERE slug IS NULL AND title IS NOT NULL;
      `
    },
    {
      name: 'Create unique constraint on news_articles.slug',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'news_articles_slug_key') THEN
            ALTER TABLE public.news_articles ADD CONSTRAINT news_articles_slug_key UNIQUE (slug);
          END IF;
        END $$;
      `
    },
  ]

  for (const migration of migrations) {
    console.log(`Running: ${migration.name}...`)
    const { data, error } = await supabase.rpc('exec_sql', { sql: migration.sql })

    if (error) {
      // If exec_sql doesn't exist, try raw query
      if (error.message.includes('exec_sql')) {
        console.log('  Note: exec_sql RPC not available, using raw approach...')
        // Try using the /sql endpoint via fetch
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ query: migration.sql }),
        })
        if (!response.ok) {
          console.log(`  Skip (may need manual run): ${error.message}`)
        }
      } else {
        console.log(`  Warning: ${error.message}`)
      }
    } else {
      console.log(`  ✓ Done`)
    }
  }

  // Verify results
  console.log('\n--- Verification ---')

  const { data: videos } = await supabase
    .from('videos_parsed')
    .select('id, slug, title')
    .not('slug', 'is', null)
    .limit(3)
  console.log('Videos with slugs:', videos?.length || 0, 'sample:', videos?.[0]?.slug)

  const { data: channels } = await supabase
    .from('videos_channels')
    .select('id, slug, title')
    .not('slug', 'is', null)
    .limit(3)
  console.log('Channels with slugs:', channels?.length || 0, 'sample:', channels?.[0]?.slug)

  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, slug, title')
    .not('slug', 'is', null)
    .limit(3)
  console.log('Articles with slugs:', articles?.length || 0, 'sample:', articles?.[0]?.slug)
}

runMigration()
