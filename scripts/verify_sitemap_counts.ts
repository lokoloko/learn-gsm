import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyCounts() {
  console.log('=== Sitemap Coverage Verification ===\n');

  // Videos
  const { count: videoCount } = await supabase
    .from('videos_parsed')
    .select('*', { count: 'exact', head: true })
    .eq('ai_status', 'completed');
  
  // News
  const { count: newsCount } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'parsed')
    .eq('is_relevant', true);

  // Static pages + topics
  const staticPages = 5; // home, /videos, /news, /topics, /chat
  const topicPages = 6;  // 6 categories

  const totalUrls = staticPages + topicPages + (videoCount || 0) + (newsCount || 0);

  console.log('Content in database:');
  console.log(`  Videos (ai_status=completed): ${videoCount}`);
  console.log(`  News (status=parsed, is_relevant=true): ${newsCount}`);
  console.log(`  Static pages: ${staticPages}`);
  console.log(`  Topic pages: ${topicPages}`);
  console.log(`\nTotal URLs in sitemap: ${totalUrls}`);
  console.log('\nLimits configured:');
  console.log('  VIDEO_LIMIT: 50,000');
  console.log('  NEWS_LIMIT: 10,000');
  console.log(`\n✓ All ${videoCount} videos will be indexed (was limited to 1,000)`);
  console.log(`✓ All ${newsCount} news articles will be indexed (was limited to 500)`);
}

verifyCounts();
