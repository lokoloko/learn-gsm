
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Try to load from .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
  console.log('Checking database counts for sitemap...');

  // 1. Videos
  const { count: videoCount, error: videoError } = await supabase
    .from('videos_parsed')
    .select('*', { count: 'exact', head: true })
    .eq('ai_status', 'completed');
  
  if (videoError) console.error('Video count error:', videoError);
  else console.log(`Total Completed Videos: ${videoCount}`);

  // Check how many have slugs
  const { count: videoSlugCount } = await supabase
      .from('videos_parsed')
      .select('*', { count: 'exact', head: true })
      .eq('ai_status', 'completed')
      .not('slug', 'is', null);
  console.log(`Videos with Slugs: ${videoSlugCount}`);


  // 2. News
  const { count: newsCount, error: newsError } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'parsed')
    .eq('is_relevant', true);

  if (newsError) console.error('News count error:', newsError);
  else console.log(`Total Relevant News: ${newsCount}`);

   // Check how many have slugs
   const { count: newsSlugCount } = await supabase
   .from('news_articles')
   .select('*', { count: 'exact', head: true })
   .eq('status', 'parsed')
   .eq('is_relevant', true)
   .not('slug', 'is', null);
   console.log(`News with Slugs: ${newsSlugCount}`);


  // 3. Creators
  const { count: creatorCount, error: creatorError } = await supabase
    .from('videos_channels')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (creatorError) console.error('Creator count error:', creatorError);
  else console.log(`Total Active Creators: ${creatorCount}`);

     // Check how many have slugs
     const { count: creatorSlugCount } = await supabase
     .from('videos_channels')
     .select('*', { count: 'exact', head: true })
     .eq('status', 'active')
     .not('slug', 'is', null);
     console.log(`Creators with Slugs: ${creatorSlugCount}`);

  // current limits in sitemap.ts:
  // Videos: 1000
  // News: 500
  // Creators: 200

  console.log('\n--- Analysis ---');
  if (videoCount !== null && videoCount > 1000) {
      console.log(`[WARNING] Video count (${videoCount}) EXPECTS limit (1000). Sitemap is incomplete.`);
  }
  if (newsCount !== null && newsCount > 500) {
      console.log(`[WARNING] News count (${newsCount}) EXPECTS limit (500). Sitemap is incomplete.`);
  }
  if (creatorCount !== null && creatorCount > 200) {
      console.log(`[WARNING] Creator count (${creatorCount}) EXPECTS limit (200). Sitemap is incomplete.`);
  }
}

checkCounts();
