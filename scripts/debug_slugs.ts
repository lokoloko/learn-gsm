
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

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
    console.log('Debugging video slugs...');

    // Check how many have slugs
    const { count: videoSlugCount, error } = await supabase
        .from('videos_parsed')
        .select('slug', { count: 'exact', head: true })
        .eq('ai_status', 'completed')
        .not('slug', 'is', null);

    if (error) {
        console.error('Video Slug Count Error:', error);
    } else {
        console.log(`Videos with Slugs: ${videoSlugCount}`);
    }
}

checkCounts();
