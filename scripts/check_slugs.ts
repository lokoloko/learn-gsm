import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSlugs() {
  // Check videos_parsed
  console.log('=== Checking videos_parsed ===');
  const { data: videos, error: videoErr, count: videoCount } = await supabase
    .from('videos_parsed')
    .select('slug, youtube_video_id', { count: 'exact' })
    .eq('ai_status', 'completed')
    .limit(5);
  
  if (videoErr) {
    console.log('Video error:', videoErr);
  } else {
    console.log('Sample videos:', videos);
    console.log('Total completed videos:', videoCount);
  }

  // Count videos with slugs
  const { count: videosWithSlugs } = await supabase
    .from('videos_parsed')
    .select('*', { count: 'exact', head: true })
    .eq('ai_status', 'completed')
    .not('slug', 'is', null);
  console.log('Videos with slugs:', videosWithSlugs);

  // Check news_articles
  console.log('\n=== Checking news_articles ===');
  const { data: news, error: newsErr, count: newsCount } = await supabase
    .from('news_articles')
    .select('slug, id', { count: 'exact' })
    .eq('status', 'parsed')
    .eq('is_relevant', true)
    .limit(5);
  
  if (newsErr) {
    console.log('News error:', newsErr);
  } else {
    console.log('Sample news:', news);
    console.log('Total relevant news:', newsCount);
  }

  // Count news with slugs
  const { count: newsWithSlugs } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'parsed')
    .eq('is_relevant', true)
    .not('slug', 'is', null);
  console.log('News with slugs:', newsWithSlugs);

  // Check videos_channels
  console.log('\n=== Checking videos_channels ===');
  const { data: channels, error: channelErr, count: channelCount } = await supabase
    .from('videos_channels')
    .select('slug, title', { count: 'exact' })
    .eq('status', 'active')
    .limit(5);
  
  if (channelErr) {
    console.log('Channel error:', channelErr);
  } else {
    console.log('Sample channels:', channels);
    console.log('Total active channels:', channelCount);
  }
}

checkSlugs();
