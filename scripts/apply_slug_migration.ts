import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyMigration() {
  console.log('Applying slug migration to videos tables...\n');

  // Step 1: Add slug column to videos_parsed
  console.log('1. Adding slug column to videos_parsed...');
  const { error: addColError } = await supabase.rpc('exec_sql', {
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'videos_parsed' AND column_name = 'slug'
        ) THEN
          ALTER TABLE public.videos_parsed ADD COLUMN slug TEXT;
        END IF;
      END $$;
    `
  });
  
  if (addColError) {
    // Try direct approach - rpc might not exist
    console.log('   RPC not available, trying alternative approach...');
  }

  // Let's use a different approach - update via the API by fetching and updating records
  console.log('\n2. Fetching videos without slugs...');
  
  // First check if slug column exists by trying to select it
  const { data: testVideo, error: testError } = await supabase
    .from('videos_parsed')
    .select('slug')
    .limit(1);
  
  if (testError && testError.message.includes('does not exist')) {
    console.log('\n❌ slug column does not exist on videos_parsed.');
    console.log('\nYou need to run this SQL in the Supabase Dashboard SQL Editor:\n');
    console.log(`
-- Add slug column to videos_parsed
ALTER TABLE public.videos_parsed ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing videos
UPDATE public.videos_parsed
SET slug = lower(regexp_replace(
  regexp_replace(title, '[^a-zA-Z0-9\\s-]', '', 'g'),
  '\\s+', '-', 'g'
)) || '-' || youtube_video_id
WHERE slug IS NULL AND title IS NOT NULL;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_parsed_slug ON public.videos_parsed(slug);

-- Add slug column to videos_channels
ALTER TABLE public.videos_channels ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for channels
UPDATE public.videos_channels
SET slug = COALESCE(
  NULLIF(handle, ''),
  lower(regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\\s-]', '', 'g'),
    '\\s+', '-', 'g'
  ))
)
WHERE slug IS NULL;

-- Create unique index for channels
CREATE UNIQUE INDEX IF NOT EXISTS idx_videos_channels_slug ON public.videos_channels(slug);
`);
    return;
  }

  console.log('✓ slug column exists on videos_parsed');
  
  // Check how many need slugs
  const { count } = await supabase
    .from('videos_parsed')
    .select('*', { count: 'exact', head: true })
    .is('slug', null);
  
  console.log(`   ${count} videos need slugs generated`);
}

applyMigration();
